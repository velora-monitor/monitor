package schedule_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"velora/apps/worker/internal/checker"
	"velora/apps/worker/internal/pool"
	"velora/apps/worker/internal/schedule"
	"velora/apps/worker/internal/store"
)

func TestSchedulerAppliesFixtureResults(t *testing.T) {
	mem := store.NewMemory()
	const id = "11111111-1111-4111-8111-111111111111"
	if err := mem.InsertMonitor(store.Monitor{
		ID:               id,
		OwnerID:          "22222222-2222-4222-8222-222222222222",
		Name:             "api",
		URL:              "https://example.test/health",
		IntervalSeconds:  30,
		FailureThreshold: 2,
		Enabled:          true,
	}); err != nil {
		t.Fatal(err)
	}
	fix := &checker.Fixture{}
	fix.SetDefault(checker.Result{Status: "down"})
	workers, err := pool.New(2)
	if err != nil {
		t.Fatal(err)
	}
	now := time.Date(2026, 11, 14, 15, 0, 0, 0, time.UTC)
	sched := schedule.New(schedule.Options{
		Store:    mem,
		Checker:  fix,
		Pool:     workers,
		Interval: time.Hour,
		Now:      func() time.Time { return now },
	})
	ctx := context.Background()
	tick := func() {
		t.Helper()
		if err := sched.Tick(ctx); err != nil {
			t.Fatal(err)
		}
	}
	assertState := func(streak int, open bool) {
		t.Helper()
		mon, ok := mem.Monitor(id)
		if !ok {
			t.Fatal("missing monitor")
		}
		if mon.ConsecutiveFailures != streak || (mon.OpenIncidentID != nil) != open {
			t.Fatalf("streak %d open %v, want streak %d open %v", mon.ConsecutiveFailures, mon.OpenIncidentID != nil, streak, open)
		}
	}
	tick()
	assertState(1, false)
	tick()
	assertState(1, false)
	now = now.Add(time.Minute)
	tick()
	assertState(2, true)
	now = now.Add(time.Minute)
	tick()
	assertState(3, true)
	incidents := mem.Incidents(id)
	if len(incidents) != 1 || incidents[0].State != store.IncidentOpen || incidents[0].FailureCount != 3 {
		t.Fatalf("incidents after attach = %+v", incidents)
	}
	firstID := incidents[0].ID
	openedAt := incidents[0].OpenedAt
	fix.SetDefault(checker.Result{Status: "up"})
	now = now.Add(time.Minute)
	resolvedAt := now
	tick()
	assertState(0, false)
	incidents = mem.Incidents(id)
	if len(incidents) != 1 || incidents[0].State != store.IncidentResolved || incidents[0].ResolvedAt == nil || !incidents[0].ResolvedAt.Equal(resolvedAt) {
		t.Fatalf("resolved incidents = %+v", incidents)
	}
	if !incidents[0].OpenedAt.Equal(openedAt) || incidents[0].FailureCount != 3 {
		t.Fatalf("resolved incident changed history: %+v", incidents[0])
	}
	fix.SetDefault(checker.Result{Status: "down"})
	now = now.Add(time.Minute)
	tick()
	assertState(1, false)
	now = now.Add(time.Minute)
	tick()
	assertState(2, true)
	incidents = mem.Incidents(id)
	if len(incidents) != 2 {
		t.Fatalf("incidents = %+v", incidents)
	}
	if incidents[0].ID != firstID || incidents[0].State != store.IncidentResolved {
		t.Fatalf("first incident = %+v", incidents[0])
	}
	if incidents[1].ID == firstID || incidents[1].State != store.IncidentOpen || incidents[1].FailureCount != 2 {
		t.Fatalf("second incident = %+v", incidents[1])
	}
	checks := mem.Checks(id)
	want := []string{"down", "down", "down", "up", "down", "down"}
	if len(checks) != len(want) {
		t.Fatalf("checks = %d, want %d", len(checks), len(want))
	}
	for i, status := range want {
		if checks[i].Status != status || checks[i].CheckedAt.IsZero() {
			t.Fatalf("check %d = %+v", i, checks[i])
		}
	}
}

func TestSchedulerOffModeWritesNothing(t *testing.T) {
	mem := store.NewMemory()
	const id = "33333333-3333-4333-8333-333333333333"
	if err := mem.InsertMonitor(store.Monitor{
		ID:               id,
		Name:             "api",
		URL:              "https://example.test/off",
		IntervalSeconds:  30,
		FailureThreshold: 1,
		Enabled:          true,
	}); err != nil {
		t.Fatal(err)
	}
	workers, err := pool.New(1)
	if err != nil {
		t.Fatal(err)
	}
	sched := schedule.New(schedule.Options{
		Store:    mem,
		Checker:  checker.Off{},
		Pool:     workers,
		Interval: time.Hour,
	})
	if err := sched.Tick(context.Background()); err != nil {
		t.Fatal(err)
	}
	if checks := mem.Checks(id); len(checks) != 0 {
		t.Fatalf("checks = %+v", checks)
	}
	mon, ok := mem.Monitor(id)
	if !ok || mon.ConsecutiveFailures != 0 || mon.OpenIncidentID != nil {
		t.Fatalf("monitor = %+v", mon)
	}
}

func TestRunPullsCheckerOnTick(t *testing.T) {
	mem := store.NewMemory()
	if err := mem.InsertMonitor(store.Monitor{
		ID:               "44444444-4444-4444-8444-444444444444",
		Name:             "api",
		URL:              "https://example.test/tick",
		IntervalSeconds:  3600,
		FailureThreshold: 3,
		Enabled:          true,
	}); err != nil {
		t.Fatal(err)
	}
	workers, err := pool.New(1)
	if err != nil {
		t.Fatal(err)
	}
	checked := make(chan struct{}, 1)
	sched := schedule.New(schedule.Options{
		Store: mem,
		Checker: checker.Func(func(context.Context, checker.Target) (checker.Result, error) {
			select {
			case checked <- struct{}{}:
			default:
			}
			return checker.Result{Status: "up"}, nil
		}),
		Pool:     workers,
		Interval: 5 * time.Millisecond,
	})
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	errCh := make(chan error, 1)
	go func() {
		errCh <- sched.Run(ctx)
	}()
	select {
	case <-checked:
	case <-time.After(2 * time.Second):
		t.Fatal("ticker did not pull checker")
	}
	cancel()
	select {
	case err := <-errCh:
		if err != nil && !errors.Is(err, context.Canceled) {
			t.Fatal(err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("scheduler did not stop")
	}
}
