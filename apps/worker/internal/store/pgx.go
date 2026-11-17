package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"velora/apps/worker/internal/incident"
)

const (
	selectDueMonitors = `
select m.id::text,
       m.owner_id::text,
       m.name,
       m.url,
       m.interval_seconds,
       m.failure_threshold,
       m.enabled,
       m.consecutive_failures,
       m.open_incident_id::text,
       m.created_at,
       m.updated_at
from public.monitors m
where m.enabled
  and (
    not exists (
      select 1
      from public.check_results cr
      where cr.monitor_id = m.id
    )
    or (
      select max(cr.checked_at)
      from public.check_results cr
      where cr.monitor_id = m.id
    ) <= $1::timestamptz - (m.interval_seconds * interval '1 second')
  )
order by m.id::text`

	selectMonitorForUpdate = `
select id::text,
       owner_id::text,
       name,
       url,
       interval_seconds,
       failure_threshold,
       enabled,
       consecutive_failures,
       open_incident_id::text,
       created_at,
       updated_at
from public.monitors
where id = $1::uuid
for update`

	selectFailureCount = `
select failure_count
from public.incidents
where id = $1::uuid`

	insertCheck = `
insert into public.check_results (
  id, monitor_id, status, status_code, latency_ms, error, checked_at
) values (
  $1::uuid, $2::uuid, $3, $4, $5, $6, $7
)`

	insertIncident = `
insert into public.incidents (
  id, monitor_id, state, opened_at, failure_count
) values (
  $1::uuid, $2::uuid, 'open', $3, $4
)`

	updateIncidentCount = `
update public.incidents
set failure_count = $2
where id = $1::uuid`

	resolveIncident = `
update public.incidents
set state = 'resolved',
    resolved_at = $2
where id = $1::uuid`

	updateMonitorOpen = `
update public.monitors
set consecutive_failures = $2,
    open_incident_id = $3::uuid,
    updated_at = $4
where id = $1::uuid`

	updateMonitorStreak = `
update public.monitors
set consecutive_failures = $2,
    updated_at = $3
where id = $1::uuid`

	clearMonitorIncident = `
update public.monitors
set consecutive_failures = $2,
    open_incident_id = null,
    updated_at = $3
where id = $1::uuid`
)

type db interface {
	Begin(context.Context) (pgx.Tx, error)
	Query(context.Context, string, ...any) (pgx.Rows, error)
	QueryRow(context.Context, string, ...any) pgx.Row
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
}

type PGX struct {
	db db
}

func NewPGX(pool *pgxpool.Pool) *PGX {
	return &PGX{db: pool}
}

func (r *PGX) ListDue(ctx context.Context, now time.Time) ([]Monitor, error) {
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	rows, err := r.db.Query(ctx, selectDueMonitors, now)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var due []Monitor
	for rows.Next() {
		mon, scanErr := scanMonitor(rows)
		if scanErr != nil {
			return nil, scanErr
		}
		due = append(due, mon)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return due, nil
}

func (r *PGX) Apply(ctx context.Context, monitorID string, obs Observation, at time.Time) error {
	if err := ctx.Err(); err != nil {
		return err
	}
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	mon, err := scanMonitor(tx.QueryRow(ctx, selectMonitorForUpdate, monitorID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("monitor %s: %w", monitorID, ErrNotFound)
		}
		return err
	}
	openCount := 0
	if mon.OpenIncidentID != nil {
		if err := tx.QueryRow(ctx, selectFailureCount, *mon.OpenIncidentID).Scan(&openCount); err != nil {
			return err
		}
	}
	next, err := planCheck(mon, openCount, obs, at)
	if err != nil {
		return err
	}
	if _, err := tx.Exec(
		ctx,
		insertCheck,
		next.Check.ID,
		next.Check.MonitorID,
		next.Check.Status,
		next.Check.StatusCode,
		next.Check.LatencyMS,
		next.Check.Error,
		next.Check.CheckedAt,
	); err != nil {
		return err
	}
	switch next.Action {
	case incident.ActionOpen:
		if _, err := tx.Exec(ctx, insertIncident, next.IncidentID, mon.ID, next.OpenedAt, next.FailureCount); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, updateMonitorOpen, mon.ID, next.Monitor.ConsecutiveFailures, next.IncidentID, at); err != nil {
			return err
		}
	case incident.ActionAttach:
		if _, err := tx.Exec(ctx, updateIncidentCount, next.IncidentID, next.FailureCount); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, updateMonitorStreak, mon.ID, next.Monitor.ConsecutiveFailures, at); err != nil {
			return err
		}
	case incident.ActionResolve:
		if _, err := tx.Exec(ctx, resolveIncident, next.IncidentID, at); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, clearMonitorIncident, mon.ID, next.Monitor.ConsecutiveFailures, at); err != nil {
			return err
		}
	default:
		if _, err := tx.Exec(ctx, updateMonitorStreak, mon.ID, next.Monitor.ConsecutiveFailures, at); err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}

type scanner interface {
	Scan(...any) error
}

func scanMonitor(row scanner) (Monitor, error) {
	var mon Monitor
	var openID *string
	if err := row.Scan(
		&mon.ID,
		&mon.OwnerID,
		&mon.Name,
		&mon.URL,
		&mon.IntervalSeconds,
		&mon.FailureThreshold,
		&mon.Enabled,
		&mon.ConsecutiveFailures,
		&openID,
		&mon.CreatedAt,
		&mon.UpdatedAt,
	); err != nil {
		return Monitor{}, err
	}
	mon.OpenIncidentID = cloneString(openID)
	return mon, nil
}
