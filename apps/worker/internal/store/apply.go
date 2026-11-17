package store

import (
	"crypto/rand"
	"fmt"
	"time"

	"velora/apps/worker/internal/incident"
)

type change struct {
	Monitor      Monitor
	Check        CheckResult
	Action       incident.Action
	IncidentID   string
	FailureCount int
	OpenedAt     time.Time
	ResolvedAt   *time.Time
}

func planCheck(mon Monitor, openFailureCount int, obs Observation, at time.Time) (change, error) {
	outcome, err := incident.Apply(incident.State{
		ConsecutiveFailures: mon.ConsecutiveFailures,
		Open:                mon.OpenIncidentID != nil,
		FailureCount:        openFailureCount,
	}, incident.Status(obs.Status), mon.FailureThreshold)
	if err != nil {
		return change{}, err
	}
	checkID, err := newUUID()
	if err != nil {
		return change{}, err
	}
	next := change{
		Monitor: mon,
		Check: CheckResult{
			ID:         checkID,
			MonitorID:  mon.ID,
			Status:     obs.Status,
			StatusCode: cloneInt(obs.StatusCode),
			LatencyMS:  cloneInt(obs.LatencyMS),
			Error:      cloneString(obs.Error),
			CheckedAt:  at,
		},
		Action:       outcome.Action,
		FailureCount: outcome.FailureCount,
	}
	next.Monitor.ConsecutiveFailures = outcome.ConsecutiveFailures
	next.Monitor.UpdatedAt = at
	switch outcome.Action {
	case incident.ActionOpen:
		incidentID, idErr := newUUID()
		if idErr != nil {
			return change{}, idErr
		}
		next.IncidentID = incidentID
		next.OpenedAt = at
		next.Monitor.OpenIncidentID = stringPtr(incidentID)
	case incident.ActionAttach:
		if mon.OpenIncidentID == nil {
			return change{}, fmt.Errorf("open incident missing")
		}
		next.IncidentID = *mon.OpenIncidentID
		next.Monitor.OpenIncidentID = cloneString(mon.OpenIncidentID)
	case incident.ActionResolve:
		if mon.OpenIncidentID == nil {
			return change{}, fmt.Errorf("open incident missing")
		}
		resolvedAt := at
		next.IncidentID = *mon.OpenIncidentID
		next.ResolvedAt = &resolvedAt
		next.Monitor.OpenIncidentID = nil
	default:
		next.Monitor.OpenIncidentID = cloneString(mon.OpenIncidentID)
	}
	return next, nil
}

func newUUID() (string, error) {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16]), nil
}

func stringPtr(v string) *string {
	return &v
}

func cloneString(v *string) *string {
	if v == nil {
		return nil
	}
	return stringPtr(*v)
}

func cloneInt(v *int) *int {
	if v == nil {
		return nil
	}
	n := *v
	return &n
}

func cloneTime(v *time.Time) *time.Time {
	if v == nil {
		return nil
	}
	copied := *v
	return &copied
}

func cloneMonitor(mon Monitor) Monitor {
	mon.OpenIncidentID = cloneString(mon.OpenIncidentID)
	return mon
}
