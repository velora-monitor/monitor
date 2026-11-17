package config

import (
	"os"
	"path/filepath"
	"strings"
)

func LoadWorkspaceEnv() {
	dir, err := os.Getwd()
	if err != nil {
		return
	}
	for {
		marker := filepath.Join(dir, "pnpm-workspace.yaml")
		if _, statErr := os.Stat(marker); statErr == nil {
			applyEnvFile(filepath.Join(dir, ".env"))
			return
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return
		}
		dir = parent
	}
}

func applyEnvFile(path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		return
	}
	for line := range strings.SplitSeq(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		if strings.HasPrefix(line, "export ") {
			line = strings.TrimSpace(strings.TrimPrefix(line, "export "))
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		if key == "" {
			continue
		}
		if _, exists := os.LookupEnv(key); exists {
			continue
		}
		if err := os.Setenv(key, unquoteEnv(strings.TrimSpace(value))); err != nil {
			return
		}
	}
}

func unquoteEnv(value string) string {
	if len(value) < 2 {
		return value
	}
	if (value[0] == '"' && value[len(value)-1] == '"') || (value[0] == '\'' && value[len(value)-1] == '\'') {
		return value[1 : len(value)-1]
	}
	return value
}
