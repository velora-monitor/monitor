package checker

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
)

var ErrSkipped = errors.New("probe skipped")

type Result struct {
	Status     string
	StatusCode *int
	LatencyMS  *int
	Error      *string
}

type Target struct {
	URL string
}

type Checker interface {
	Check(context.Context, Target) (Result, error)
}

type Off struct{}

func (Off) Check(ctx context.Context, _ Target) (Result, error) {
	if err := ctx.Err(); err != nil {
		return Result{}, err
	}
	return Result{}, ErrSkipped
}

type Fixture struct {
	mu      sync.Mutex
	ByURL   map[string]Result
	Default Result
}

func (f *Fixture) SetDefault(result Result) {
	f.mu.Lock()
	f.Default = result
	f.mu.Unlock()
}

func (f *Fixture) Check(ctx context.Context, target Target) (Result, error) {
	if err := ctx.Err(); err != nil {
		return Result{}, err
	}
	if f == nil {
		return Result{Status: "up"}, nil
	}
	f.mu.Lock()
	defer f.mu.Unlock()
	if result, ok := f.ByURL[target.URL]; ok {
		return result, nil
	}
	if f.Default.Status != "" {
		return f.Default, nil
	}
	return Result{Status: "up"}, nil
}

type Func func(context.Context, Target) (Result, error)

func (f Func) Check(ctx context.Context, target Target) (Result, error) {
	if err := ctx.Err(); err != nil {
		return Result{}, err
	}
	if f == nil {
		return Result{}, errors.New("nil checker")
	}
	return f(ctx, target)
}

func New(mode string, timeout time.Duration) (Checker, error) {
	switch strings.ToLower(strings.TrimSpace(mode)) {
	case "", "off":
		return Off{}, nil
	case "fixture":
		return &Fixture{Default: Result{Status: "up"}}, nil
	case "http":
		return NewHTTP(timeout), nil
	default:
		return nil, fmt.Errorf("unknown probe mode %q", mode)
	}
}
