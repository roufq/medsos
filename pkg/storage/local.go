package storage

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/goravel/framework/contracts/filesystem"
)

// MaxVideoDurationSeconds is the platform-wide 30 minute limit.
const MaxVideoDurationSeconds = 30 * 60

func envMegabytes(name string, fallback, maximum int64) int64 {
	value, err := strconv.ParseInt(strings.TrimSpace(os.Getenv(name)), 10, 64)
	if err != nil || value < 1 || value > maximum {
		value = fallback
	}
	return value * 1024 * 1024
}

// maxVideoSize is configurable via MEDIA_MAX_UPLOAD_MB (default 1024 MB).
func maxVideoSize() int64 { return envMegabytes("MEDIA_MAX_UPLOAD_MB", 1024, 4096) }

// maxImageSize is configurable via MEDIA_MAX_IMAGE_MB (default 10 MB).
func maxImageSize() int64 { return envMegabytes("MEDIA_MAX_IMAGE_MB", 10, 50) }

type MediaInfo struct {
	Type            string
	DurationSeconds int
	extension       string
}

// StoredMedia describes a file after it was validated and saved.
type StoredMedia struct {
	URL             string
	Type            string
	DurationSeconds int
	SizeBytes       int64
}

type StorageService interface {
	UploadFile(filesystem.File) (string, error)
	Upload(filesystem.File) (*StoredMedia, error)
}

type LocalStorageService struct {
	directory string
	baseURL   string
}

func NewLocalStorageService(directory, baseURL string) *LocalStorageService {
	return &LocalStorageService{directory: directory, baseURL: strings.TrimRight(baseURL, "/")}
}

// BaseURL is the prefix every stored file URL starts with.
func (s *LocalStorageService) BaseURL() string { return s.baseURL + "/uploads/" }

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
	if !stat.Mode().IsRegular() || stat.Size() == 0 {
		return nil, errors.New("media must be a non-empty file")
	}
	header := make([]byte, sniffHeaderSize)
	n, err := io.ReadFull(source, header)
	if err != nil && err != io.EOF && err != io.ErrUnexpectedEOF {
		return nil, err
	}
	mediaType, extension, ok := detectMedia(header[:n])
	if !ok {
		return nil, errors.New(SupportedFormatsMessage)
	}
	info := &MediaInfo{Type: mediaType, extension: extension}
	limit := maxImageSize()
	if mediaType == "video" {
		limit = maxVideoSize()
	}
	if stat.Size() > limit {
		return nil, fmt.Errorf("%s must be at most %d MB", mediaType, limit/(1024*1024))
	}
	if mediaType == "video" {
		path, err := filepath.Abs(file.File())
		if err != nil {
			return nil, err
		}
		duration, err := probeVideo(path)
		if err != nil {
			return nil, err
		}
		if duration > MaxVideoDurationSeconds {
			return nil, errors.New("video must be at most 30 minutes long")
		}
		info.DurationSeconds = duration
	}
	return info, nil
}

func (s *LocalStorageService) UploadFile(file filesystem.File) (string, error) {
	stored, err := s.Upload(file)
	if err != nil {
		return "", err
	}
	return stored.URL, nil
}

// Upload validates, compresses (images), and stores the file once.
func (s *LocalStorageService) Upload(file filesystem.File) (*StoredMedia, error) {
	info, err := InspectFile(file)
	if err != nil {
		return nil, err
	}
	if err := os.MkdirAll(s.directory, 0755); err != nil {
		return nil, err
	}
	var random [16]byte
	if _, err := rand.Read(random[:]); err != nil {
		return nil, err
	}
	extension := info.extension
	var imageBytes []byte
	if info.Type == "image" {
		original, err := os.ReadFile(file.File())
		if err != nil {
			return nil, err
		}
		imageBytes, extension, err = compressImage(original, extension)
		if err != nil {
			return nil, err
		}
	}
	name := hex.EncodeToString(random[:]) + extension
	target := filepath.Join(s.directory, name)
	destination, err := os.OpenFile(target, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0644)
	if err != nil {
		return nil, err
	}
	var written int64
	var copyErr error
	if imageBytes != nil {
		var n int
		n, copyErr = destination.Write(imageBytes)
		written = int64(n)
	} else {
		source, openErr := os.Open(file.File())
		if openErr != nil {
			destination.Close()
			_ = os.Remove(target)
			return nil, openErr
		}
		limit := maxVideoSize()
		written, copyErr = io.Copy(destination, io.LimitReader(source, limit+1))
		source.Close()
		if written > limit {
			copyErr = errors.New("file too large")
		}
	}
	closeErr := destination.Close()
	if copyErr != nil || closeErr != nil {
		_ = os.Remove(target)
		return nil, errors.New("failed to save media")
	}
	return &StoredMedia{URL: s.baseURL + "/uploads/" + name, Type: info.Type, DurationSeconds: info.DurationSeconds, SizeBytes: written}, nil
}
