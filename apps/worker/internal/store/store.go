package store

import (
	"context"
	"errors"
	"time"
)

var ErrNotFound = errors.New("monitor not found")

const (
	IncidentOpen     = "open"
	IncidentResolved = "resolved"
)

type Monitor struct {
	ID                  string
	OwnerID             string
	Name                string
	URL                 string
	IntervalSeconds     int
	FailureThreshold    int
	Enabled             bool
	ConsecutiveFailures int
	OpenIncidentID      *string
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

type Incident struct {
	ID           string
	MonitorID    string
	State        string
	OpenedAt     time.Time
	ResolvedAt   *time.Time
	FailureCount int
}

type CheckResult struct {
	ID         string
	MonitorID  string
	Status     string
	StatusCode *int
	LatencyMS  *int
	Error      *string
	CheckedAt  time.Time
}

type Observation struct {
	Status     string
	StatusCode *int
	LatencyMS  *int
	Error      *string
}

type Repository interface {
	ListDue(context.Context, time.Time) ([]Monitor, error)
	Apply(context.Context, string, Observation, time.Time) error
}

var (
	_ Repository = (*Memory)(nil)
	_ Repository = (*PGX)(nil)
	_ Repository = (*LazyPGX)(nil)
)
