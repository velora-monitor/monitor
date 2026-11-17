package checker

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"
)

func TestNewUsesHTTPOnlyWhenEnabled(t *testing.T) {
	for _, mode := range []string{"", "off", "fixture"} {
		got, err := New(mode, time.Second)
		if err != nil {
			t.Fatalf("New(%q): %v", mode, err)
		}
		if _, ok := got.(HTTP); ok {
			t.Fatalf("New(%q) built an HTTP checker", mode)
		}
	}
	got, err := New("http", time.Second)
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := got.(HTTP); !ok {
		t.Fatalf("New(http) = %T", got)
	}
	if _, err := New("tcp", time.Second); err == nil {
		t.Fatal("expected unknown probe mode error")
	}
}

func TestHTTPCheckerStatusCodes(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		code, convErr := strconv.Atoi(r.URL.Query().Get("code"))
		if convErr != nil {
			http.Error(w, convErr.Error(), http.StatusBadRequest)
			return
		}
		w.WriteHeader(code)
	}))
	t.Cleanup(server.Close)
	checker := NewHTTP(2 * time.Second)
	tests := []struct {
		code   int
		status string
	}{
		{code: http.StatusOK, status: "up"},
		{code: http.StatusFound, status: "up"},
		{code: http.StatusNotFound, status: "down"},
		{code: http.StatusInternalServerError, status: "down"},
	}
	for _, tt := range tests {
		t.Run(http.StatusText(tt.code), func(t *testing.T) {
			result, err := checker.Check(context.Background(), Target{URL: server.URL + "?code=" + strconv.Itoa(tt.code)})
			if err != nil {
				t.Fatalf("Check: %v", err)
			}
			if result.Status != tt.status {
				t.Fatalf("status = %s, want %s", result.Status, tt.status)
			}
			if result.StatusCode == nil || *result.StatusCode != tt.code {
				t.Fatalf("status code = %v, want %d", result.StatusCode, tt.code)
			}
			if result.LatencyMS == nil || *result.LatencyMS < 0 {
				t.Fatalf("latency = %v", result.LatencyMS)
			}
			if result.Error != nil {
				t.Fatalf("error = %s", *result.Error)
			}
		})
	}
}

func TestHTTPCheckerConnectionError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {}))
	url := server.URL
	server.Close()
	result, err := NewHTTP(time.Second).Check(context.Background(), Target{URL: url})
	if err != nil {
		t.Fatal(err)
	}
	if result.Status != "down" || result.Error == nil || *result.Error == "" {
		t.Fatalf("result = %+v", result)
	}
	if result.StatusCode != nil {
		t.Fatalf("status code = %d", *result.StatusCode)
	}
}

func TestHTTPCheckerInvalidURL(t *testing.T) {
	result, err := NewHTTP(time.Second).Check(context.Background(), Target{URL: "://bad"})
	if err != nil {
		t.Fatal(err)
	}
	if result.Status != "down" || result.Error == nil {
		t.Fatalf("result = %+v", result)
	}
}

func TestHTTPCheckerCanceledContext(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {}))
	t.Cleanup(server.Close)
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	_, err := NewHTTP(time.Second).Check(ctx, Target{URL: server.URL})
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("error = %v", err)
	}
}

func TestOffCheckerSkips(t *testing.T) {
	_, err := Off{}.Check(context.Background(), Target{URL: "https://example.test"})
	if !errors.Is(err, ErrSkipped) {
		t.Fatalf("error = %v", err)
	}
}
