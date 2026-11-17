package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadWorkspaceEnvReadsQuotedValuesWithoutOverride(t *testing.T) {
	root := t.TempDir()
	app := filepath.Join(root, "apps", "worker")
	if err := os.MkdirAll(app, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "pnpm-workspace.yaml"), []byte("packages:\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	body := "VELORA_ENV_PROBE=\"session-pooler\"\n# ignored\nexport VELORA_ENV_EXPORT=1\nVELORA_ENV_KEEP=from-file\n"
	if err := os.WriteFile(filepath.Join(root, ".env"), []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("VELORA_ENV_KEEP", "already-set")
	t.Cleanup(func() {
		os.Unsetenv("VELORA_ENV_PROBE")
		os.Unsetenv("VELORA_ENV_EXPORT")
	})
	t.Chdir(app)

	LoadWorkspaceEnv()

	if got := os.Getenv("VELORA_ENV_PROBE"); got != "session-pooler" {
		t.Fatalf("VELORA_ENV_PROBE = %q", got)
	}
	if got := os.Getenv("VELORA_ENV_EXPORT"); got != "1" {
		t.Fatalf("VELORA_ENV_EXPORT = %q", got)
	}
	if got := os.Getenv("VELORA_ENV_KEEP"); got != "already-set" {
		t.Fatalf("VELORA_ENV_KEEP = %q", got)
	}
}

func TestLoadWorkspaceEnvIgnoresMissingFile(t *testing.T) {
	root := t.TempDir()
	if err := os.WriteFile(filepath.Join(root, "pnpm-workspace.yaml"), []byte("packages:\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Chdir(root)
	LoadWorkspaceEnv()
	if got, ok := os.LookupEnv("VELORA_ENV_PROBE"); ok && got == "session-pooler" {
		t.Fatal("missing env file changed the process")
	}
}
