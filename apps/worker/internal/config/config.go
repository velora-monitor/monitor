package config

import (
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	DatabaseURL  string
	ProbeMode    string
	TickInterval time.Duration
	PoolSize     int
	HTTPTimeout  time.Duration
	LogLevel     slog.Level
}

func Load() (Config, error) {
	cfg := Config{
		DatabaseURL:  strings.TrimSpace(os.Getenv("DATABASE_URL")),
		ProbeMode:    "off",
		TickInterval: 15 * time.Second,
		PoolSize:     4,
		HTTPTimeout:  10 * time.Second,
		LogLevel:     slog.LevelInfo,
	}
	mode := strings.ToLower(strings.TrimSpace(os.Getenv("PROBE_MODE")))
	if mode != "" {
		cfg.ProbeMode = mode
	}
	switch cfg.ProbeMode {
	case "off", "fixture", "http":
	default:
		return Config{}, fmt.Errorf("invalid PROBE_MODE %q", cfg.ProbeMode)
	}
	if value := strings.TrimSpace(os.Getenv("POOL_SIZE")); value != "" {
		size, err := strconv.Atoi(value)
		if err != nil || size < 1 {
			return Config{}, fmt.Errorf("invalid POOL_SIZE %q", value)
		}
		cfg.PoolSize = size
	}
	if value := strings.TrimSpace(os.Getenv("TICK_INTERVAL")); value != "" {
		interval, err := time.ParseDuration(value)
		if err != nil || interval <= 0 {
			return Config{}, fmt.Errorf("invalid TICK_INTERVAL %q", value)
		}
		cfg.TickInterval = interval
	}
	if value := strings.TrimSpace(os.Getenv("HTTP_TIMEOUT")); value != "" {
		timeout, err := time.ParseDuration(value)
		if err != nil || timeout <= 0 {
			return Config{}, fmt.Errorf("invalid HTTP_TIMEOUT %q", value)
		}
		cfg.HTTPTimeout = timeout
	}
	level, err := parseLevel(os.Getenv("LOG_LEVEL"))
	if err != nil {
		return Config{}, err
	}
	cfg.LogLevel = level
	return cfg, nil
}

func parseLevel(value string) (slog.Level, error) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "", "info":
		return slog.LevelInfo, nil
	case "debug":
		return slog.LevelDebug, nil
	case "warn", "warning":
		return slog.LevelWarn, nil
	case "error":
		return slog.LevelError, nil
	default:
		return 0, fmt.Errorf("invalid LOG_LEVEL %q", value)
	}
}
