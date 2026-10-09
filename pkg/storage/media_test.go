package storage

import (
	"bytes"
	"encoding/binary"
	"image"
	"image/color"
	"image/jpeg"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestDetectMediaContainers(t *testing.T) {
	pad := func(prefix []byte) []byte { return append(prefix, make([]byte, 64)...) }
	ts := make([]byte, 400)
	ts[0], ts[188], ts[376] = 0x47, 0x47, 0x47
	cases := map[string][]byte{
		".mp4":  pad([]byte("\x00\x00\x00\x18ftypisom\x00\x00\x02\x00")),
		".mov":  pad([]byte("\x00\x00\x00\x14ftypqt  \x00\x00\x02\x00")),
		".avi":  pad([]byte("RIFF\x00\x00\x00\x00AVI LIST")),
		".wmv":  pad([]byte{0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9, 0x00, 0xAA, 0x00, 0x62, 0xCE, 0x6C}),
		".flv":  pad([]byte{'F', 'L', 'V', 0x01, 0x05}),
		".mpeg": pad([]byte{0x00, 0x00, 0x01, 0xBA, 0x44}),
		".mkv":  pad([]byte{0x1A, 0x45, 0xDF, 0xA3, 0x9F, 0x42, 0x82, 0x88, 'm', 'a', 't', 'r', 'o', 's', 'k', 'a'}),
		".webm": pad([]byte{0x1A, 0x45, 0xDF, 0xA3, 0x9F, 0x42, 0x82, 0x84, 'w', 'e', 'b', 'm'}),
		".mxf":  pad([]byte{0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01}),
		".ts":   ts,
	}
	for want, header := range cases {
		kind, extension, ok := detectMedia(header)
		if !ok || kind != "video" || extension != want {
			t.Errorf("%s detected as %q %q %v", want, kind, extension, ok)
		}
	}
	if _, _, ok := detectMedia([]byte("MZ\x90\x00 executable")); ok {
		t.Error("executable accepted as media")
	}
}

func TestVideoLongerThanThirtyMinutesRejected(t *testing.T) {
	original := probeVideo
	defer func() { probeVideo = original }()
	source := filepath.Join(t.TempDir(), "clip.mp4")
	if err := os.WriteFile(source, append([]byte("\x00\x00\x00\x18ftypisom\x00\x00\x02\x00"), make([]byte, 64)...), 0600); err != nil {
		t.Fatal(err)
	}
	probeVideo = func(string) (int, error) { return MaxVideoDurationSeconds + 1, nil }
	if _, err := InspectFile(uploadedFile{path: source}); err == nil || !strings.Contains(err.Error(), "30 minutes") {
		t.Fatalf("expected duration rejection, got %v", err)
	}
	probeVideo = func(string) (int, error) { return 75, nil }
	info, err := InspectFile(uploadedFile{path: source})
	if err != nil || info.Type != "video" || info.DurationSeconds != 75 {
		t.Fatalf("unexpected result %+v %v", info, err)
	}
}

// jpegWithOrientation encodes a w x h JPEG and splices in an EXIF APP1
// segment carrying the given orientation plus a fake GPS marker string.
func jpegWithOrientation(t *testing.T, w, h, orientation int) []byte {
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, color.RGBA{uint8(x), uint8(y), 90, 255})
		}
	}
	var encoded bytes.Buffer
	if err := jpeg.Encode(&encoded, img, &jpeg.Options{Quality: 95}); err != nil {
		t.Fatal(err)
	}
	var tiff bytes.Buffer
	tiff.WriteString("II*\x00")
	binary.Write(&tiff, binary.LittleEndian, uint32(8))
	binary.Write(&tiff, binary.LittleEndian, uint16(1))
	binary.Write(&tiff, binary.LittleEndian, []uint16{0x0112, 3})
	binary.Write(&tiff, binary.LittleEndian, uint32(1))
	binary.Write(&tiff, binary.LittleEndian, []uint16{uint16(orientation), 0})
	binary.Write(&tiff, binary.LittleEndian, uint32(0))
	tiff.WriteString("GPS-SECRET")
	payload := append([]byte("Exif\x00\x00"), tiff.Bytes()...)
	var out bytes.Buffer
	out.Write([]byte{0xFF, 0xD8, 0xFF, 0xE1})
	binary.Write(&out, binary.BigEndian, uint16(len(payload)+2))
	out.Write(payload)
	out.Write(encoded.Bytes()[2:])
	return out.Bytes()
}

func TestCompressImageAppliesOrientationAndStripsMetadata(t *testing.T) {
	source := jpegWithOrientation(t, 40, 20, 6)
	if jpegOrientation(source) != 6 {
		t.Fatal("orientation not parsed")
	}
	result, extension, err := compressImage(source, ".jpg")
	if err != nil || extension != ".jpg" {
		t.Fatal(err)
	}
	if bytes.Contains(result, []byte("GPS-SECRET")) || bytes.Contains(result, []byte("Exif")) {
		t.Fatal("EXIF metadata was not stripped")
	}
	config, err := jpeg.DecodeConfig(bytes.NewReader(result))
	if err != nil || config.Width != 20 || config.Height != 40 {
		t.Fatalf("expected rotated 20x40 image, got %+v %v", config, err)
	}
}

func TestCompressImageDownscalesLargeImages(t *testing.T) {
	source := jpegWithOrientation(t, 3000, 1500, 1)
	result, _, err := compressImage(source, ".jpg")
	if err != nil {
		t.Fatal(err)
	}
	config, _ := jpeg.DecodeConfig(bytes.NewReader(result))
	if config.Width != maxImageEdge || config.Height != maxImageEdge/2 {
		t.Fatalf("unexpected size %dx%d", config.Width, config.Height)
	}
}
