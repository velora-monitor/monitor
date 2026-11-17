package main

import (
	"context"
	"log/slog"
	"testing"
	"time"

	"velora/apps/worker/internal/config"
)

func TestRunStopsWithoutDialing(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	err := run(ctx, config.Config{
		ProbeMode:    "off",
		PoolSize:     1,
		TickInterval: time.Hour,
		HTTPTimeout:  time.Second,
	}, slog.New(slog.DiscardHandler))
	if err != nil {
		t.Fatal(err)
	}
}
