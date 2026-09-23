package storage

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/goravel/framework/contracts/filesystem"
)

const maxVideoDurationSeconds = 30 * 60

func maxUploadSize() int64 {
	value, err := strconv.ParseInt(strings.TrimSpace(os.Getenv("MEDIA_MAX_UPLOAD_MB")), 10, 64)
	if err != nil || value < 1 || value > 2048 {
		value = 1024
	}
	return value * 1024 * 1024
}

type MediaInfo struct {
	Type            string
	DurationSeconds int
	extension       string
}

type StorageService interface {
	UploadFile(filesystem.File) (string, error)
}

type LocalStorageService struct {
	directory string
	baseURL   string
}

func NewLocalStorageService(directory, baseURL string) *LocalStorageService {
	return &LocalStorageService{directory: directory, baseURL: strings.TrimRight(baseURL, "/")}
}

// InspectFile checks the content instead of trusting the uploaded filename.
func InspectFile(file filesystem.File) (*MediaInfo, error) {
	if file == nil {
		return nil, errors.New("file is required")
	}
	source, err := os.Open(file.File())
	if err != nil {
		return nil, err
	}
	defer source.Close()
	stat, err := source.Stat()
	if err != nil {
		return nil, err
	}
	limit := maxUploadSize()
	if !stat.Mode().IsRegular() || stat.Size() == 0 || stat.Size() > limit {
		return nil, fmt.Errorf("media must be a non-empty file of at most %d MB", limit/(1024*1024))
	}
	header := make([]byte, 512)
	n, err := source.Read(header)
	if err != nil && err != io.EOF {
		return nil, err
	}
	info := &MediaInfo{}
	switch http.DetectContentType(header[:n]) {
	case "image/jpeg":
		info.Type, info.extension = "image", ".jpg"
	case "image/png":
		info.Type, info.extension = "image", ".png"
	case "image/gif":
		info.Type, info.extension = "image", ".gif"
	case "image/webp":
		info.Type, info.extension = "image", ".webp"
	case "video/mp4":
		info.Type, info.extension = "video", ".mp4"
	case "video/webm":
		info.Type, info.extension = "video", ".webm"
	case "video/quicktime":
		info.Type, info.extension = "video", ".mov"
	case "video/x-msvideo":
		info.Type, info.extension = "video", ".avi"
	case "video/mpeg":
		info.Type, info.extension = "video", ".mpeg"
	default:
		return nil, errors.New("supported media: JPEG, PNG, GIF, WebP, MOV, AVI, MPEG, MP4, and WebM")
	}
	if info.Type == "video" {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		path, err := filepath.Abs(file.File())
		if err != nil {
			return nil, err
		}
		output, err := exec.CommandContext(ctx, "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", path).Output()
		if err != nil {
			return nil, fmt.Errorf("cannot inspect video; ensure ffprobe is installed: %w", err)
		}
		duration, err := strconv.ParseFloat(strings.TrimSpace(string(output)), 64)
		if err != nil || math.IsNaN(duration) || math.IsInf(duration, 0) || duration <= 0 || duration > maxVideoDurationSeconds {
			return nil, errors.New("invalid video duration")
		}
		info.DurationSeconds = int(math.Ceil(duration))
	}
	return info, nil
}

func (s *LocalStorageService) UploadFile(file filesystem.File) (string, error) {
	info, err := InspectFile(file)
	if err != nil {
		return "", err
	}
	if err := os.MkdirAll(s.directory, 0755); err != nil {
		return "", err
	}
	var random [16]byte
	if _, err := rand.Read(random[:]); err != nil {
		return "", err
	}
	name := hex.EncodeToString(random[:]) + info.extension
	source, err := os.Open(file.File())
	if err != nil {
		return "", err
	}
	defer source.Close()
	target := filepath.Join(s.directory, name)
	destination, err := os.OpenFile(target, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0644)
	if err != nil {
		return "", err
	}
	limit := maxUploadSize()
	n, copyErr := io.Copy(destination, io.LimitReader(source, limit+1))
	closeErr := destination.Close()
	if copyErr != nil || closeErr != nil || n > limit {
		_ = os.Remove(target)
		return "", errors.New("failed to save media")
	}
	return s.baseURL + "/uploads/" + name, nil
}
