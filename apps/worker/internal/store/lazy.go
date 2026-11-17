package store

import (
	"context"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type LazyPGX struct {
	databaseURL string
	mu          sync.Mutex
	pool        *pgxpool.Pool
}

func NewLazyPGX(databaseURL string) *LazyPGX {
	return &LazyPGX{databaseURL: databaseURL}
}

func (l *LazyPGX) Close() {
	l.mu.Lock()
	defer l.mu.Unlock()
	if l.pool != nil {
		l.pool.Close()
		l.pool = nil
	}
}

func (l *LazyPGX) ListDue(ctx context.Context, now time.Time) ([]Monitor, error) {
	repo, err := l.get(ctx)
	if err != nil {
		return nil, err
	}
	return repo.ListDue(ctx, now)
}

func (l *LazyPGX) Apply(ctx context.Context, monitorID string, obs Observation, at time.Time) error {
	repo, err := l.get(ctx)
	if err != nil {
		return err
	}
	return repo.Apply(ctx, monitorID, obs, at)
}

func (l *LazyPGX) get(ctx context.Context) (*PGX, error) {
	l.mu.Lock()
	defer l.mu.Unlock()
	if l.pool != nil {
		return NewPGX(l.pool), nil
	}
	cfg, err := pgxpool.ParseConfig(l.databaseURL)
	if err != nil {
		return nil, err
	}
	cfg.MinConns = 0
	cfg.MinIdleConns = 0
	if cfg.MaxConns < 1 {
		cfg.MaxConns = 4
	}
	cfg.ConnConfig.ConnectTimeout = 5 * time.Second
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}
	l.pool = pool
	return NewPGX(pool), nil
}
