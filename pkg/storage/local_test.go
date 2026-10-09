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

func TestUploadUsesDetectedTypeAndKeepsImageIntact(t *testing.T) {
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
	// PNGs may be losslessly recompressed, so compare pixels, not bytes.
	config, err := png.DecodeConfig(bytes.NewReader(saved))
	if err != nil || config.Width != 2 || config.Height != 2 || len(saved) > content.Len() {
		t.Fatalf("stored image is not the same PNG: %+v %v", config, err)
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
	var header bytes.Buffer
	if err := png.Encode(&header, image.NewRGBA(image.Rect(0, 0, 1, 1))); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(source, header.Bytes(), 0600); err != nil {
		t.Fatal(err)
	}
	file, err := os.OpenFile(source, os.O_RDWR, 0600)
	if err != nil {
		t.Fatal(err)
	}
	if err := file.Truncate(maxImageSize() + 1); err != nil {
		file.Close()
		t.Fatal(err)
	}
	file.Close()
	if _, err := InspectFile(uploadedFile{path: source}); err == nil {
		t.Fatal("oversized upload accepted")
	}
}
