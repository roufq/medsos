package storage

import (
	"bytes"
	"image"
	"image/png"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/goravel/framework/contracts/filesystem"
)

type fileContract = filesystem.File

type uploadedFile struct {
	fileContract
	path string
}

func (f uploadedFile) File() string { return f.path }

func TestUploadUsesDetectedTypeAndPreservesContent(t *testing.T) {
	directory := t.TempDir()
	source := filepath.Join(directory, "misleading.html")
	var content bytes.Buffer
	if err := png.Encode(&content, image.NewRGBA(image.Rect(0, 0, 2, 2))); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(source, content.Bytes(), 0600); err != nil {
		t.Fatal(err)
	}
	storage := NewLocalStorageService(filepath.Join(directory, "uploads"), "http://localhost:3000/")
	url, err := storage.UploadFile(uploadedFile{path: source})
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(url, "http://localhost:3000/uploads/") || !strings.HasSuffix(url, ".png") {
		t.Fatalf("unexpected URL: %s", url)
	}
	saved, err := os.ReadFile(filepath.Join(directory, "uploads", filepath.Base(url)))
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(saved, content.Bytes()) {
		t.Fatal("uploaded content changed")
	}
}

func TestUploadRejectsHTMLDisguisedAsImage(t *testing.T) {
	directory := t.TempDir()
	source := filepath.Join(directory, "image.png")
	if err := os.WriteFile(source, []byte("<html><script>alert(1)</script></html>"), 0600); err != nil {
		t.Fatal(err)
	}
	storage := NewLocalStorageService(filepath.Join(directory, "uploads"), "")
	if _, err := storage.UploadFile(uploadedFile{path: source}); err == nil {
		t.Fatal("HTML was accepted as an image")
	}
	if _, err := os.Stat(filepath.Join(directory, "uploads")); !os.IsNotExist(err) {
		t.Fatal("rejected upload created storage output")
	}
}

func TestInspectRejectsOversizedFile(t *testing.T) {
	source := filepath.Join(t.TempDir(), "large.png")
	file, err := os.Create(source)
	if err != nil {
		t.Fatal(err)
	}
	if err := file.Truncate(maxUploadSize() + 1); err != nil {
		file.Close()
		t.Fatal(err)
	}
	file.Close()
	if _, err := InspectFile(uploadedFile{path: source}); err == nil {
		t.Fatal("oversized upload accepted")
	}
}
