package pool_test

import (
	"context"
	"errors"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"velora/apps/worker/internal/pool"
)

func TestPoolRejectsNonPositiveSize(t *testing.T) {
	for _, size := range []int{0, -1} {
		got, err := pool.New(size)
		if err == nil || got != nil {
			t.Fatalf("New(%d) = (%v, %v), want error", size, got, err)
		}
	}
}

func TestPoolCapsConcurrency(t *testing.T) {
	workers, err := pool.New(2)
	if err != nil {
		t.Fatal(err)
	}
	release := make(chan struct{})
	var started atomic.Int32
	var entered atomic.Int32
	var returned atomic.Int32
	var wg sync.WaitGroup
	for range 3 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			started.Add(1)
			submitErr := workers.Submit(context.Background(), func(context.Context) {
				entered.Add(1)
				<-release
			})
			if submitErr != nil {
				t.Errorf("submit: %v", submitErr)
			}
			returned.Add(1)
		}()
	}
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if entered.Load() > 2 || returned.Load() > 2 {
			t.Fatalf("cap exceeded: entered %d returned %d", entered.Load(), returned.Load())
		}
		if started.Load() == 3 && entered.Load() == 2 && returned.Load() == 2 {
			break
		}
		time.Sleep(time.Millisecond)
	}
	if started.Load() != 3 || entered.Load() != 2 || returned.Load() != 2 {
		t.Fatalf("pool did not hold the third task: started %d entered %d returned %d", started.Load(), entered.Load(), returned.Load())
	}
	close(release)
	wg.Wait()
	workers.Wait()
	if entered.Load() != 3 || returned.Load() != 3 {
		t.Fatalf("tasks did not finish: entered %d returned %d", entered.Load(), returned.Load())
	}
}

func TestPoolSubmitHonorsCanceledContext(t *testing.T) {
	workers, err := pool.New(1)
	if err != nil {
		t.Fatal(err)
	}
	held := make(chan struct{})
	release := make(chan struct{})
	if err := workers.Submit(context.Background(), func(context.Context) {
		close(held)
		<-release
	}); err != nil {
		t.Fatal(err)
	}
	<-held
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	err = workers.Submit(ctx, func(context.Context) {
		t.Error("canceled task ran")
	})
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("submit error = %v", err)
	}
	close(release)
	workers.Wait()
}
