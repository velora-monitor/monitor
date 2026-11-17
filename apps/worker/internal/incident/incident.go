package incident

import (
	"errors"
	"fmt"
)

var (
	ErrInvalidThreshold = errors.New("failure threshold must be at least 1")
	ErrInvalidStatus    = errors.New("invalid status")
)

type Status string

const (
	StatusUp   Status = "up"
	StatusDown Status = "down"
)

type Action string

const (
	ActionNone    Action = "none"
	ActionOpen    Action = "open"
	ActionAttach  Action = "attach"
	ActionResolve Action = "resolve"
)

type State struct {
	ConsecutiveFailures int
	Open                bool
	FailureCount        int
}

type Outcome struct {
	ConsecutiveFailures int
	Open                bool
	FailureCount        int
	Action              Action
}

func Apply(state State, status Status, threshold int) (Outcome, error) {
	if threshold < 1 {
		return Outcome{}, ErrInvalidThreshold
	}
	if state.ConsecutiveFailures < 0 {
		state.ConsecutiveFailures = 0
	}
	if state.FailureCount < 0 {
		state.FailureCount = 0
	}
	switch status {
	case StatusDown:
		return applyDown(state, threshold), nil
	case StatusUp:
		return applyUp(state), nil
	default:
		return Outcome{}, fmt.Errorf("%w: %q", ErrInvalidStatus, status)
	}
}

func applyDown(state State, threshold int) Outcome {
	streak := state.ConsecutiveFailures + 1
	if state.Open {
		return Outcome{
			ConsecutiveFailures: streak,
			Open:                true,
			FailureCount:        state.FailureCount + 1,
			Action:              ActionAttach,
		}
	}
	if streak >= threshold {
		return Outcome{
			ConsecutiveFailures: streak,
			Open:                true,
			FailureCount:        streak,
			Action:              ActionOpen,
		}
	}
	return Outcome{
		ConsecutiveFailures: streak,
		Action:              ActionNone,
	}
}

func applyUp(state State) Outcome {
	if !state.Open {
		return Outcome{Action: ActionNone}
	}
	return Outcome{
		FailureCount: state.FailureCount,
		Action:       ActionResolve,
	}
}
