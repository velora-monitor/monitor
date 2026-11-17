package schedule

import (
	"context"
	"errors"
	"log/slog"
	"sync"
	"time"

	"velora/apps/worker/internal/checker"
	"velora/apps/worker/internal/pool"
	"velora/apps/worker/internal/store"
)

type Options struct {
	Store    store.Repository
	Checker  checker.Checker
	Pool     *pool.Pool
	Interval time.Duration
	Now      func() time.Time
	Logger   *slog.Logger
}

type Scheduler struct {
	Store    store.Repository
	Checker  checker.Checker
	Pool     *pool.Pool
	Interval time.Duration
	Now      func() time.Time
	Logger   *slog.Logger
}

func New(opts Options) *Scheduler {
	if opts.Interval <= 0 {
		opts.Interval = 15 * time.Second
	}
	if opts.Now == nil {
		opts.Now = time.Now
	}
	if opts.Logger == nil {
		opts.Logger = slog.New(slog.DiscardHandler)
	}
	return &Scheduler{
		Store:    opts.Store,
		Checker:  opts.Checker,
		Pool:     opts.Pool,
		Interval: opts.Interval,
		Now:      opts.Now,
		Logger:   opts.Logger,
	}
}

func (s *Scheduler) Run(ctx context.Context) error {
	ticker := time.NewTicker(s.Interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			err := s.Tick(ctx)
			if err == nil {
				continue
			}
			if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
				return err
			}
			s.Logger.Error("tick failed", "err", err)
		}
	}
}

func (s *Scheduler) Tick(ctx context.Context) error {
	if s.Store == nil || s.Checker == nil || s.Pool == nil {
		return errors.New("scheduler is not configured")
	}
	if err := ctx.Err(); err != nil {
		return err
	}
	now := s.Now()
	monitors, err := s.Store.ListDue(ctx, now)
	if err != nil {
		return err
	}
	var wg sync.WaitGroup
	errs := make(chan error, len(monitors))
	for _, mon := range monitors {
		if err := s.submit(ctx, mon, now, &wg, errs); err != nil {
			wg.Wait()
			return err
		}
	}
	wg.Wait()
	close(errs)
	var joined []error
	for err := range errs {
		joined = append(joined, err)
	}
	return errors.Join(joined...)
}

func (s *Scheduler) submit(ctx context.Context, mon store.Monitor, at time.Time, wg *sync.WaitGroup, errs chan<- error) error {
	wg.Add(1)
	err := s.Pool.Submit(ctx, func(ctx context.Context) {
		defer wg.Done()
		if err := s.check(ctx, mon, at); err != nil {
			errs <- err
		}
	})
	if err != nil {
		wg.Done()
	}
	return err
}

func (s *Scheduler) check(ctx context.Context, mon store.Monitor, at time.Time) error {
	result, err := s.Checker.Check(ctx, checker.Target{URL: mon.URL})
	if err != nil {
		if errors.Is(err, checker.ErrSkipped) {
			return nil
		}
		return err
	}
	return s.Store.Apply(ctx, mon.ID, store.Observation{
		Status:     result.Status,
		StatusCode: result.StatusCode,
		LatencyMS:  result.LatencyMS,
		Error:      result.Error,
	}, at)
}
