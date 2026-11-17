package store

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func TestLazyPGXConstructorDoesNotDial(t *testing.T) {
	repo := NewLazyPGX("postgres://velora:velora@127.0.0.1:1/velora?connect_timeout=1")
	t.Cleanup(repo.Close)
	if repo.pool != nil {
		t.Fatal("constructor opened a pool")
	}
}

func TestPGXApplyUsesDatabase(t *testing.T) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		t.Skip("DATABASE_URL is not set")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		t.Fatal(err)
	}
	cfg.MinConns = 0
	cfg.MaxConns = 1
	cfg.ConnConfig.ConnectTimeout = 3 * time.Second
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(pool.Close)
	tx, err := pool.Begin(ctx)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = tx.Rollback(ctx) })
	ownerID, err := newUUID()
	if err != nil {
		t.Fatal(err)
	}
	monitorID, err := newUUID()
	if err != nil {
		t.Fatal(err)
	}
	if _, err := tx.Exec(ctx, `
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000000', $1::uuid, 'authenticated', 'authenticated', $2, '',
  now(), now(), '{}'::jsonb, '{}'::jsonb,
  '', '', '', '',
  '', '', '', ''
)`, ownerID, ownerID+"@velora.test"); err != nil {
		t.Fatal(err)
	}
	if _, err := tx.Exec(ctx, `
insert into public.monitors (
  id, owner_id, name, url, interval_seconds, failure_threshold, enabled
) values (
  $1::uuid, $2::uuid, 'api', 'https://example.test/health', 30, 2, true
)`, monitorID, ownerID); err != nil {
		t.Fatal(err)
	}
	repo := &PGX{db: tx}
	at := time.Now().UTC()
	if err := repo.Apply(ctx, monitorID, Observation{Status: "down"}, at); err != nil {
		t.Fatal(err)
	}
	due, err := repo.ListDue(ctx, at)
	if err != nil {
		t.Fatal(err)
	}
	for _, mon := range due {
		if mon.ID == monitorID {
			t.Fatal("monitor was due inside its interval")
		}
	}
	if err := repo.Apply(ctx, monitorID, Observation{Status: "down"}, at.Add(time.Minute)); err != nil {
		t.Fatal(err)
	}
	var streak int
	var openID *string
	var state string
	var failures int
	if err := tx.QueryRow(ctx, `
select m.consecutive_failures, m.open_incident_id::text, i.state, i.failure_count
from public.monitors m
join public.incidents i on i.id = m.open_incident_id
where m.id = $1::uuid`, monitorID).Scan(&streak, &openID, &state, &failures); err != nil {
		t.Fatal(err)
	}
	if streak != 2 || openID == nil || state != IncidentOpen || failures != 2 {
		t.Fatalf("streak %d open %v state %s failures %d", streak, openID, state, failures)
	}
}
