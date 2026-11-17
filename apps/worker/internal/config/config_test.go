package config

import (
	"log/slog"
	"testing"
	"time"
)

func TestLoadDefaults(t *testing.T) {
	t.Setenv("DATABASE_URL", "")
	t.Setenv("PROBE_MODE", "")
	t.Setenv("TICK_INTERVAL", "")
	t.Setenv("POOL_SIZE", "")
	t.Setenv("HTTP_TIMEOUT", "")
	t.Setenv("LOG_LEVEL", "")
	cfg, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if cfg.DatabaseURL != "" || cfg.ProbeMode != "off" {
		t.Fatalf("defaults = %+v", cfg)
	}
	if cfg.TickInterval != 15*time.Second || cfg.PoolSize != 4 || cfg.HTTPTimeout != 10*time.Second {
		t.Fatalf("defaults = %+v", cfg)
	}
	if cfg.LogLevel != slog.LevelInfo {
		t.Fatalf("level = %v", cfg.LogLevel)
	}
}

func TestLoadOverrides(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://localhost/velora")
	t.Setenv("PROBE_MODE", "HTTP")
	t.Setenv("TICK_INTERVAL", "5s")
	t.Setenv("POOL_SIZE", "8")
	t.Setenv("HTTP_TIMEOUT", "2s")
	t.Setenv("LOG_LEVEL", "debug")
	cfg, err := Load()
	if err != nil {
		t.Fatal(err)
	}
	if cfg.ProbeMode != "http" || cfg.DatabaseURL != "postgres://localhost/velora" {
		t.Fatalf("config = %+v", cfg)
	}
	if cfg.TickInterval != 5*time.Second || cfg.PoolSize != 8 || cfg.HTTPTimeout != 2*time.Second {
		t.Fatalf("config = %+v", cfg)
	}
	if cfg.LogLevel != slog.LevelDebug {
		t.Fatalf("level = %v", cfg.LogLevel)
	}
}

func TestLoadRejectsInvalidValues(t *testing.T) {
	tests := []struct {
		name string
		key  string
		val  string
	}{
		{name: "probe mode", key: "PROBE_MODE", val: "live"},
		{name: "pool size", key: "POOL_SIZE", val: "0"},
		{name: "pool size text", key: "POOL_SIZE", val: "many"},
		{name: "tick interval", key: "TICK_INTERVAL", val: "0s"},
		{name: "tick interval text", key: "TICK_INTERVAL", val: "soon"},
		{name: "http timeout", key: "HTTP_TIMEOUT", val: "-1s"},
		{name: "log level", key: "LOG_LEVEL", val: "verbose"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv("DATABASE_URL", "")
			t.Setenv("PROBE_MODE", "")
			t.Setenv("TICK_INTERVAL", "")
			t.Setenv("POOL_SIZE", "")
			t.Setenv("HTTP_TIMEOUT", "")
			t.Setenv("LOG_LEVEL", "")
			t.Setenv(tt.key, tt.val)
			if _, err := Load(); err == nil {
				t.Fatal("expected error")
			}
		})
	}
}
