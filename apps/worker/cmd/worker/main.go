package main

import (
	"context"
	"errors"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"velora/apps/worker/internal/checker"
	"velora/apps/worker/internal/config"
	"velora/apps/worker/internal/pool"
	"velora/apps/worker/internal/schedule"
	"velora/apps/worker/internal/store"
)

func main() {
	config.LoadWorkspaceEnv()
	cfg, err := config.Load()
	logger := newLogger(cfg)
	if err != nil {
		logger.Error("load config", "err", err)
		os.Exit(1)
	}
	slog.SetDefault(logger)
	if err := run(context.Background(), cfg, logger); err != nil {
		logger.Error("worker stopped", "err", err)
		os.Exit(1)
	}
}

func run(ctx context.Context, cfg config.Config, logger *slog.Logger) error {
	if logger == nil {
		logger = slog.New(slog.DiscardHandler)
	}
	ctx, stop := signal.NotifyContext(ctx, os.Interrupt, syscall.SIGTERM)
	defer stop()
	repo, cleanup, err := openStore(cfg)
	if err != nil {
		return err
	}
	defer cleanup()
	chk, err := checker.New(cfg.ProbeMode, cfg.HTTPTimeout)
	if err != nil {
		return err
	}
	workers, err := pool.New(cfg.PoolSize)
	if err != nil {
		return err
	}
	sched := schedule.New(schedule.Options{
		Store:    repo,
		Checker:  chk,
		Pool:     workers,
		Interval: cfg.TickInterval,
		Logger:   logger,
	})
	logger.Info("worker started", "probe_mode", cfg.ProbeMode, "database", cfg.DatabaseURL != "", "pool_size", cfg.PoolSize)
	err = sched.Run(ctx)
	if errors.Is(err, context.Canceled) {
		return nil
	}
	return err
}

func openStore(cfg config.Config) (store.Repository, func(), error) {
	if cfg.DatabaseURL == "" {
		return store.NewMemory(), func() {}, nil
	}
	lazy := store.NewLazyPGX(cfg.DatabaseURL)
	return lazy, lazy.Close, nil
}

func newLogger(cfg config.Config) *slog.Logger {
	return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: cfg.LogLevel}))
}
