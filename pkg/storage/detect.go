package storage

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"goravel/pkg/mediatools"
	"math"
	"net/http"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

// sniffHeaderSize covers the MPEG-TS check, which looks at the sync byte of
// the third 188-byte packet.
const sniffHeaderSize = 1024

// detectMedia identifies the container from magic bytes instead of trusting
// the client's filename or Content-Type. Professional codecs (ProRes, DNxHR,
// CineForm, HEVC/H.265) travel inside MOV/MP4/MKV/MXF containers, so the
// container is what is detected here; ffprobe then confirms a real video
// stream and the transcode job converts everything to browser-playable MP4.
func detectMedia(header []byte) (mediaType, extension string, ok bool) {
	switch http.DetectContentType(header) {
	case "image/jpeg":
		return "image", ".jpg", true
	case "image/png":
		return "image", ".png", true
	case "image/gif":
		return "image", ".gif", true
	case "image/webp":
		return "image", ".webp", true
	}

	if len(header) >= 12 && string(header[4:8]) == "ftyp" {
		// ISO base media (MP4/M4V/3GP/HEVC-in-MP4) vs QuickTime (MOV/ProRes).
		if string(header[8:12]) == "qt  " {
			return "video", ".mov", true
		}
		return "video", ".mp4", true
	}
	if len(header) >= 8 {
		switch string(header[4:8]) {
		case "moov", "mdat", "wide", "free", "skip", "pnot":
			// Legacy QuickTime files without an ftyp atom.
			return "video", ".mov", true
		}
	}
	switch {
	case len(header) >= 12 && string(header[0:4]) == "RIFF" && string(header[8:12]) == "AVI ":
		return "video", ".avi", true
	case bytes.HasPrefix(header, []byte{0x1A, 0x45, 0xDF, 0xA3}):
		// EBML: WebM or Matroska.
		if bytes.Contains(header, []byte("webm")) {
			return "video", ".webm", true
		}
		return "video", ".mkv", true
	case bytes.HasPrefix(header, []byte{0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9, 0x00, 0xAA, 0x00, 0x62, 0xCE, 0x6C}):
		// ASF container: WMV.
		return "video", ".wmv", true
	case bytes.HasPrefix(header, []byte{'F', 'L', 'V', 0x01}):
		return "video", ".flv", true
	case bytes.HasPrefix(header, []byte{0x00, 0x00, 0x01, 0xBA}), bytes.HasPrefix(header, []byte{0x00, 0x00, 0x01, 0xB3}):
		// MPEG program stream / MPEG-1/2 elementary video stream.
		return "video", ".mpeg", true
	case len(header) >= 377 && header[0] == 0x47 && header[188] == 0x47 && header[376] == 0x47:
		// MPEG transport stream.
		return "video", ".ts", true
	case bytes.HasPrefix(header, []byte{0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02}):
		// MXF, common for DNxHR/ProRes camera and editing exports.
		return "video", ".mxf", true
	}
	return "", "", false
}

// SupportedFormatsMessage lists what detectMedia accepts.
const SupportedFormatsMessage = "supported media: JPEG, PNG, GIF, WebP images; MP4, MOV, AVI, WMV, FLV, WebM, MKV, MPEG, MPEG-TS, and MXF videos (H.264, HEVC/H.265, ProRes, DNxHR, CineForm)"

type probeResult struct {
	Streams []struct {
		CodecType string `json:"codec_type"`
		CodecName string `json:"codec_name"`
	} `json:"streams"`
	Format struct {
		Duration string `json:"duration"`
	} `json:"format"`
}

// probeVideo confirms the file really contains a video stream and returns its
// duration in whole seconds (rounded up).
var probeVideo = func(path string) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	probe, err := mediatools.Executable("ffprobe")
	if err != nil {
		return 0, err
	}
	output, err := exec.CommandContext(ctx, probe, "-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name", "-of", "json", path).Output()
	if err != nil {
		return 0, fmt.Errorf("cannot inspect video; ensure ffprobe is installed: %w", err)
	}
	var result probeResult
	if err := json.Unmarshal(output, &result); err != nil {
		return 0, errors.New("cannot read video metadata")
	}
	hasVideo := false
	for _, stream := range result.Streams {
		if stream.CodecType == "video" {
			hasVideo = true
			break
		}
	}
	if !hasVideo {
		return 0, errors.New("file does not contain a video stream")
	}
	duration, err := strconv.ParseFloat(strings.TrimSpace(result.Format.Duration), 64)
	if err != nil || math.IsNaN(duration) || math.IsInf(duration, 0) || duration <= 0 {
		return 0, errors.New("invalid video duration")
	}
	return int(math.Ceil(duration)), nil
}
