package jobs

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"goravel/app/models"
	"goravel/pkg/db"
)

type TranscodePostMedia struct{}

func (receiver *TranscodePostMedia) Signature() string { return "transcode_post_media" }

func (receiver *TranscodePostMedia) Handle(args ...any) error {
	if len(args) != 1 { return errors.New("transcode_post_media requires a media ID") }
	mediaID, ok := args[0].(int64); if !ok || mediaID <= 0 { return fmt.Errorf("invalid media ID: %v", args[0]) }
	var media models.PostMedia; if err := db.DB.First(&media, mediaID).Error; err != nil { return err }
	if media.MediaType != models.MediaTypeVideo { return nil }
	parsed, err := url.Parse(media.MediaURL); if err != nil { return err }; filename := filepath.Base(parsed.Path); if filename == "." || filename == "" { return errors.New("invalid media URL") }
	uploadRoot, err := filepath.Abs("./uploads"); if err != nil { return err }; inputPath := filepath.Join(uploadRoot, filename); if filepath.Dir(inputPath) != uploadRoot { return errors.New("unsafe media path") }
	base := strings.TrimSuffix(filename, filepath.Ext(filename)); outputName := base + ".optimized.mp4"; outputPath := filepath.Join(uploadRoot, outputName)
	ctx, cancel := context.WithTimeout(context.Background(), 45*time.Minute); defer cancel()
	command := exec.CommandContext(ctx, "ffmpeg", "-y", "-i", inputPath, "-map_metadata", "-1", "-vf", "scale=min(1920\\,iw):-2", "-c:v", "libx264", "-preset", "veryfast", "-crf", "28", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", outputPath)
	if output, err := command.CombinedOutput(); err != nil { _ = db.DB.Model(&media).Update("processing_status", "failed").Error; if len(output) > 500 { output = output[len(output)-500:] }; return fmt.Errorf("ffmpeg failed: %s", string(output)) }
	newURL := strings.TrimSuffix(media.MediaURL, filename) + outputName
	if err := db.DB.Model(&media).Updates(map[string]any{"media_url": newURL, "processing_status": "ready"}).Error; err != nil { _ = os.Remove(outputPath); return err }
	if inputPath != outputPath { _ = os.Remove(inputPath) }
	return nil
}

func (receiver *TranscodePostMedia) ShouldRetry(_ error, attempt int) (bool, time.Duration) {
	if attempt >= 2 { return false, 0 }
	return true, time.Duration(attempt*10) * time.Second
}
