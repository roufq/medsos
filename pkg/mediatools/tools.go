package mediatools

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

// Executable resolves a configured tool, PATH, or the project's portable bundle.
func Executable(name string) (string, error) {
	if name != "ffprobe" && name != "ffmpeg" {
		return "", fmt.Errorf("unsupported media tool")
	}
	if configured := strings.TrimSpace(os.Getenv(strings.ToUpper(name) + "_PATH")); configured != "" {
		return exec.LookPath(configured)
	}
	if path, err := exec.LookPath(name); err == nil {
		return path, nil
	}
	binary := name
	if runtime.GOOS == "windows" {
		binary += ".exe"
	}
	roots := []string{"."}
	if executable, err := os.Executable(); err == nil {
		roots = append(roots, filepath.Dir(executable), filepath.Dir(filepath.Dir(executable)))
	}
	for _, root := range roots {
		candidate := filepath.Join(root, "tmp", "toolchain", "ffmpeg", "bin", binary)
		if info, err := os.Stat(candidate); err == nil && !info.IsDir() {
			return filepath.Abs(candidate)
		}
	}
	return "", fmt.Errorf("%s is unavailable; install the portable FFmpeg bundle or configure %s_PATH", name, strings.ToUpper(name))
}
