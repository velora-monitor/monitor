package checker

import (
	"context"
	"io"
	"net/http"
	"time"
)

type HTTP struct {
	Client *http.Client
}

func NewHTTP(timeout time.Duration) HTTP {
	if timeout <= 0 {
		timeout = 10 * time.Second
	}
	return HTTP{
		Client: &http.Client{
			Timeout: timeout,
			CheckRedirect: func(*http.Request, []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
	}
}

func (h HTTP) Check(ctx context.Context, target Target) (Result, error) {
	if err := ctx.Err(); err != nil {
		return Result{}, err
	}
	start := time.Now()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, target.URL, nil)
	if err != nil {
		return downResult(0, err), nil
	}
	resp, err := h.client().Do(req)
	latency := latencyMS(start)
	if err != nil {
		if ctx.Err() != nil {
			return Result{}, ctx.Err()
		}
		return downResult(latency, err), nil
	}
	defer func() { _ = resp.Body.Close() }()
	_, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 1<<20))
	code := resp.StatusCode
	status := "down"
	if code >= 200 && code < 400 {
		status = "up"
	}
	result := Result{
		Status:    status,
		LatencyMS: &latency,
	}
	if code >= 100 && code <= 599 {
		result.StatusCode = &code
	}
	return result, nil
}

func (h HTTP) client() *http.Client {
	if h.Client != nil {
		return h.Client
	}
	return NewHTTP(0).Client
}

func downResult(latency int, err error) Result {
	msg := err.Error()
	return Result{
		Status:    "down",
		LatencyMS: &latency,
		Error:     &msg,
	}
}

func latencyMS(start time.Time) int {
	ms := time.Since(start).Milliseconds()
	if ms < 0 {
		return 0
	}
	return int(ms)
}
