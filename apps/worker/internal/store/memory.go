package store

import (
	"context"
	"fmt"
	"sort"
	"sync"
	"time"

	"velora/apps/worker/internal/incident"
)

type Memory struct {
	mu        sync.Mutex
	monitors  map[string]Monitor
	incidents map[string]Incident
	checks    []CheckResult
	lastCheck map[string]time.Time
}

func NewMemory() *Memory {
	return &Memory{
		monitors:  make(map[string]Monitor),
		incidents: make(map[string]Incident),
		lastCheck: make(map[string]time.Time),
	}
}

func (m *Memory) InsertMonitor(mon Monitor) error {
	if mon.ID == "" {
		id, err := newUUID()
		if err != nil {
			return err
		}
		mon.ID = id
	}
	now := time.Now().UTC()
	if mon.CreatedAt.IsZero() {
		mon.CreatedAt = now
	}
	if mon.UpdatedAt.IsZero() {
		mon.UpdatedAt = mon.CreatedAt
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.monitors[mon.ID]; ok {
		return fmt.Errorf("monitor %s exists", mon.ID)
	}
	m.monitors[mon.ID] = cloneMonitor(mon)
	return nil
}

func (m *Memory) Monitor(id string) (Monitor, bool) {
	m.mu.Lock()
	defer m.mu.Unlock()
	mon, ok := m.monitors[id]
	if !ok {
		return Monitor{}, false
	}
	return cloneMonitor(mon), true
}

func (m *Memory) Incidents(monitorID string) []Incident {
	m.mu.Lock()
	defer m.mu.Unlock()
	out := make([]Incident, 0, 1)
	for _, incident := range m.incidents {
		if incident.MonitorID != monitorID {
			continue
		}
		incident.ResolvedAt = cloneTime(incident.ResolvedAt)
		out = append(out, incident)
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].OpenedAt.Equal(out[j].OpenedAt) {
			return out[i].ID < out[j].ID
		}
		return out[i].OpenedAt.Before(out[j].OpenedAt)
	})
	return out
}

func (m *Memory) Checks(monitorID string) []CheckResult {
	m.mu.Lock()
	defer m.mu.Unlock()
	out := make([]CheckResult, 0, 1)
	for _, check := range m.checks {
		if check.MonitorID != monitorID {
			continue
		}
		out = append(out, cloneCheck(check))
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].CheckedAt.Equal(out[j].CheckedAt) {
			return out[i].ID < out[j].ID
		}
		return out[i].CheckedAt.Before(out[j].CheckedAt)
	})
	return out
}

func (m *Memory) ListDue(ctx context.Context, now time.Time) ([]Monitor, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	due := make([]Monitor, 0, len(m.monitors))
	for _, mon := range m.monitors {
		if !mon.Enabled {
			continue
		}
		last, ok := m.lastCheck[mon.ID]
		if ok && now.Sub(last) < time.Duration(mon.IntervalSeconds)*time.Second {
			continue
		}
		due = append(due, cloneMonitor(mon))
	}
	sort.Slice(due, func(i, j int) bool { return due[i].ID < due[j].ID })
	return due, nil
}

func (m *Memory) Apply(ctx context.Context, monitorID string, obs Observation, at time.Time) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	mon, ok := m.monitors[monitorID]
	if !ok {
		return fmt.Errorf("monitor %s: %w", monitorID, ErrNotFound)
	}
	openCount := 0
	if mon.OpenIncidentID != nil {
		open, found := m.incidents[*mon.OpenIncidentID]
		if !found {
			return fmt.Errorf("incident %s: %w", *mon.OpenIncidentID, ErrNotFound)
		}
		openCount = open.FailureCount
	}
	next, err := planCheck(mon, openCount, obs, at)
	if err != nil {
		return err
	}
	switch next.Action {
	case incident.ActionOpen:
		m.incidents[next.IncidentID] = Incident{
			ID:           next.IncidentID,
			MonitorID:    mon.ID,
			State:        IncidentOpen,
			OpenedAt:     next.OpenedAt,
			FailureCount: next.FailureCount,
		}
	case incident.ActionAttach:
		item, found := m.incidents[next.IncidentID]
		if !found {
			return fmt.Errorf("incident %s: %w", next.IncidentID, ErrNotFound)
		}
		item.FailureCount = next.FailureCount
		m.incidents[next.IncidentID] = item
	case incident.ActionResolve:
		item, found := m.incidents[next.IncidentID]
		if !found {
			return fmt.Errorf("incident %s: %w", next.IncidentID, ErrNotFound)
		}
		item.State = IncidentResolved
		item.ResolvedAt = cloneTime(next.ResolvedAt)
		item.FailureCount = next.FailureCount
		m.incidents[next.IncidentID] = item
	}
	m.monitors[monitorID] = cloneMonitor(next.Monitor)
	m.checks = append(m.checks, cloneCheck(next.Check))
	m.lastCheck[monitorID] = at
	return nil
}

func cloneCheck(check CheckResult) CheckResult {
	check.StatusCode = cloneInt(check.StatusCode)
	check.LatencyMS = cloneInt(check.LatencyMS)
	check.Error = cloneString(check.Error)
	return check
}
