package pool

import (
	"context"
	"fmt"
	"sync"
)

type Pool struct {
	sem chan struct{}
	wg  sync.WaitGroup
}

func New(size int) (*Pool, error) {
	if size < 1 {
		return nil, fmt.Errorf("pool size must be at least 1")
	}
	return &Pool{sem: make(chan struct{}, size)}, nil
}

func (p *Pool) Submit(ctx context.Context, fn func(context.Context)) error {
	if fn == nil {
		return fmt.Errorf("nil task")
	}
	if err := ctx.Err(); err != nil {
		return err
	}
	select {
	case <-ctx.Done():
		return ctx.Err()
	case p.sem <- struct{}{}:
	}
	p.wg.Add(1)
	go func() {
		defer p.wg.Done()
		defer func() { <-p.sem }()
		fn(ctx)
	}()
	return nil
}

func (p *Pool) Wait() {
	p.wg.Wait()
}
