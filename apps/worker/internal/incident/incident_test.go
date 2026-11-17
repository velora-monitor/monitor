package incident

import (
	"errors"
	"testing"
)

func TestApply(t *testing.T) {
	tests := []struct {
		name      string
		state     State
		status    Status
		threshold int
		want      Outcome
		wantErr   error
	}{
		{
			name:      "down increments consecutive failures",
			state:     State{},
			status:    StatusDown,
			threshold: 3,
			want: Outcome{
				ConsecutiveFailures: 1,
				Action:              ActionNone,
			},
		},
		{
			name:      "down below threshold does not open",
			state:     State{ConsecutiveFailures: 1},
			status:    StatusDown,
			threshold: 3,
			want: Outcome{
				ConsecutiveFailures: 2,
				Action:              ActionNone,
			},
		},
		{
			name:      "incident opens when streak reaches threshold and none is open",
			state:     State{ConsecutiveFailures: 2},
			status:    StatusDown,
			threshold: 3,
			want: Outcome{
				ConsecutiveFailures: 3,
				Open:                true,
				FailureCount:        3,
				Action:              ActionOpen,
			},
		},
		{
			name:      "threshold of one opens on the first down",
			status:    StatusDown,
			threshold: 1,
			want: Outcome{
				ConsecutiveFailures: 1,
				Open:                true,
				FailureCount:        1,
				Action:              ActionOpen,
			},
		},
		{
			name: "further down attaches and does not open another",
			state: State{
				ConsecutiveFailures: 3,
				Open:                true,
				FailureCount:        3,
			},
			status:    StatusDown,
			threshold: 3,
			want: Outcome{
				ConsecutiveFailures: 4,
				Open:                true,
				FailureCount:        4,
				Action:              ActionAttach,
			},
		},
		{
			name: "down while open attaches even below threshold",
			state: State{
				ConsecutiveFailures: 1,
				Open:                true,
				FailureCount:        1,
			},
			status:    StatusDown,
			threshold: 5,
			want: Outcome{
				ConsecutiveFailures: 2,
				Open:                true,
				FailureCount:        2,
				Action:              ActionAttach,
			},
		},
		{
			name:      "up clears the streak",
			state:     State{ConsecutiveFailures: 2},
			status:    StatusUp,
			threshold: 3,
			want: Outcome{
				Action: ActionNone,
			},
		},
		{
			name: "up while open resolves",
			state: State{
				ConsecutiveFailures: 4,
				Open:                true,
				FailureCount:        4,
			},
			status:    StatusUp,
			threshold: 3,
			want: Outcome{
				FailureCount: 4,
				Action:       ActionResolve,
			},
		},
		{
			name:      "up stays clear when the streak is already clear",
			status:    StatusUp,
			threshold: 2,
			want: Outcome{
				Action: ActionNone,
			},
		},
		{
			name:      "threshold below one is rejected",
			status:    StatusDown,
			threshold: 0,
			wantErr:   ErrInvalidThreshold,
		},
		{
			name:      "negative threshold is rejected",
			status:    StatusUp,
			threshold: -3,
			wantErr:   ErrInvalidThreshold,
		},
		{
			name:      "invalid status is rejected",
			status:    Status("degraded"),
			threshold: 2,
			wantErr:   ErrInvalidStatus,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Apply(tt.state, tt.status, tt.threshold)
			if tt.wantErr != nil {
				if !errors.Is(err, tt.wantErr) {
					t.Fatalf("error = %v, want %v", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatalf("Apply: %v", err)
			}
			if got != tt.want {
				t.Fatalf("Apply() = %+v, want %+v", got, tt.want)
			}
		})
	}
}

func TestLaterDownStreakOpensNewIncident(t *testing.T) {
	state := State{}
	steps := []struct {
		name   string
		status Status
		want   Outcome
	}{
		{
			name:   "first down counts",
			status: StatusDown,
			want:   Outcome{ConsecutiveFailures: 1, Action: ActionNone},
		},
		{
			name:   "second down opens",
			status: StatusDown,
			want:   Outcome{ConsecutiveFailures: 2, Open: true, FailureCount: 2, Action: ActionOpen},
		},
		{
			name:   "third down attaches",
			status: StatusDown,
			want:   Outcome{ConsecutiveFailures: 3, Open: true, FailureCount: 3, Action: ActionAttach},
		},
		{
			name:   "up resolves",
			status: StatusUp,
			want:   Outcome{FailureCount: 3, Action: ActionResolve},
		},
		{
			name:   "later streak starts over",
			status: StatusDown,
			want:   Outcome{ConsecutiveFailures: 1, Action: ActionNone},
		},
		{
			name:   "later streak opens a new incident",
			status: StatusDown,
			want:   Outcome{ConsecutiveFailures: 2, Open: true, FailureCount: 2, Action: ActionOpen},
		},
	}
	for _, step := range steps {
		t.Run(step.name, func(t *testing.T) {
			got, err := Apply(state, step.status, 2)
			if err != nil {
				t.Fatalf("Apply: %v", err)
			}
			if got != step.want {
				t.Fatalf("Apply() = %+v, want %+v", got, step.want)
			}
			state = State{
				ConsecutiveFailures: got.ConsecutiveFailures,
				Open:                got.Open,
			}
			if got.Open {
				state.FailureCount = got.FailureCount
			}
		})
	}
}
