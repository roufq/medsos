package storage

import (
	"bytes"
	"encoding/binary"
	"errors"
	"image"
	"image/color"
	"image/draw"
	"image/jpeg"
	"image/png"
	"io"
)

const (
	// maxImageEdge bounds stored images; larger photos are downscaled.
	maxImageEdge = 2048
	// maxImagePixels rejects decompression bombs before decoding.
	maxImagePixels = 60_000_000
	jpegQuality    = 82
)

// compressImage re-encodes JPEG and PNG images to save storage and bandwidth.
// JPEGs are always re-encoded, which also strips EXIF metadata such as GPS
// coordinates (the EXIF orientation is applied to the pixels first). PNGs are
// only replaced when the result is smaller. GIF (possibly animated) and WebP
// (no encoder in the standard library) are stored unchanged.
//
// It returns the bytes to store and the (possibly unchanged) extension.
func compressImage(original []byte, extension string) ([]byte, string, error) {
	if extension != ".jpg" && extension != ".png" {
		return original, extension, nil
	}
	config, _, err := image.DecodeConfig(bytes.NewReader(original))
	if err != nil {
		return nil, "", errors.New("image cannot be decoded")
	}
	if config.Width <= 0 || config.Height <= 0 || config.Width*config.Height > maxImagePixels {
		return nil, "", errors.New("image dimensions are too large")
	}
	img, _, err := image.Decode(bytes.NewReader(original))
	if err != nil {
		return nil, "", errors.New("image cannot be decoded")
	}
	if extension == ".jpg" {
		img = applyOrientation(img, jpegOrientation(original))
	}
	img = downscale(img, maxImageEdge)

	var out bytes.Buffer
	if extension == ".jpg" {
		if err := jpeg.Encode(&out, img, &jpeg.Options{Quality: jpegQuality}); err != nil {
			return nil, "", err
		}
		return out.Bytes(), ".jpg", nil
	}
	encoder := png.Encoder{CompressionLevel: png.BestCompression}
	if err := encoder.Encode(&out, img); err != nil {
		return nil, "", err
	}
	if out.Len() < len(original) {
		return out.Bytes(), ".png", nil
	}
	return original, ".png", nil
}

// downscale shrinks img so its longest edge is at most maxEdge, averaging the
// source pixels covered by each destination pixel (box filter).
func downscale(img image.Image, maxEdge int) image.Image {
	bounds := img.Bounds()
	width, height := bounds.Dx(), bounds.Dy()
	if width <= maxEdge && height <= maxEdge {
		return img
	}
	newWidth, newHeight := maxEdge, height*maxEdge/width
	if height > width {
		newWidth, newHeight = width*maxEdge/height, maxEdge
	}
	if newWidth < 1 {
		newWidth = 1
	}
	if newHeight < 1 {
		newHeight = 1
	}
	src := image.NewRGBA(image.Rect(0, 0, width, height))
	draw.Draw(src, src.Bounds(), img, bounds.Min, draw.Src)
	dst := image.NewRGBA(image.Rect(0, 0, newWidth, newHeight))
	for y := 0; y < newHeight; y++ {
		y0, y1 := y*height/newHeight, (y+1)*height/newHeight
		if y1 <= y0 {
			y1 = y0 + 1
		}
		for x := 0; x < newWidth; x++ {
			x0, x1 := x*width/newWidth, (x+1)*width/newWidth
			if x1 <= x0 {
				x1 = x0 + 1
			}
			var r, g, b, a, n uint64
			for sy := y0; sy < y1; sy++ {
				offset := sy*src.Stride + x0*4
				for sx := x0; sx < x1; sx++ {
					r += uint64(src.Pix[offset])
					g += uint64(src.Pix[offset+1])
					b += uint64(src.Pix[offset+2])
					a += uint64(src.Pix[offset+3])
					offset += 4
					n++
				}
			}
			dst.SetRGBA(x, y, color.RGBA{uint8(r / n), uint8(g / n), uint8(b / n), uint8(a / n)})
		}
	}
	return dst
}

// jpegOrientation reads the EXIF orientation tag (1-8) from a JPEG, or 1.
func jpegOrientation(data []byte) int {
	reader := bytes.NewReader(data)
	var marker [2]byte
	if _, err := io.ReadFull(reader, marker[:]); err != nil || marker != [2]byte{0xFF, 0xD8} {
		return 1
	}
	for {
		if _, err := io.ReadFull(reader, marker[:]); err != nil || marker[0] != 0xFF {
			return 1
		}
		if marker[1] == 0xDA || marker[1] == 0xD9 { // start of scan / end of image
			return 1
		}
		var size uint16
		if err := binary.Read(reader, binary.BigEndian, &size); err != nil || size < 2 {
			return 1
		}
		segment := make([]byte, int(size)-2)
		if _, err := io.ReadFull(reader, segment); err != nil {
			return 1
		}
		if marker[1] == 0xE1 && len(segment) > 14 && string(segment[:6]) == "Exif\x00\x00" {
			return exifOrientation(segment[6:])
		}
	}
}

func exifOrientation(tiff []byte) int {
	if len(tiff) < 8 {
		return 1
	}
	var order binary.ByteOrder
	switch string(tiff[:2]) {
	case "II":
		order = binary.LittleEndian
	case "MM":
		order = binary.BigEndian
	default:
		return 1
	}
	offset := int(order.Uint32(tiff[4:8]))
	if offset < 8 || offset+2 > len(tiff) {
		return 1
	}
	entries := int(order.Uint16(tiff[offset : offset+2]))
	for i := 0; i < entries; i++ {
		entry := offset + 2 + i*12
		if entry+12 > len(tiff) {
			return 1
		}
		if order.Uint16(tiff[entry:entry+2]) == 0x0112 {
			value := int(order.Uint16(tiff[entry+8 : entry+10]))
			if value >= 1 && value <= 8 {
				return value
			}
			return 1
		}
	}
	return 1
}

// applyOrientation rotates/flips img according to an EXIF orientation value.
func applyOrientation(img image.Image, orientation int) image.Image {
	if orientation <= 1 || orientation > 8 {
		return img
	}
	bounds := img.Bounds()
	width, height := bounds.Dx(), bounds.Dy()
	outWidth, outHeight := width, height
	if orientation >= 5 {
		outWidth, outHeight = height, width
	}
	dst := image.NewRGBA(image.Rect(0, 0, outWidth, outHeight))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			var dx, dy int
			switch orientation {
			case 2:
				dx, dy = width-1-x, y
			case 3:
				dx, dy = width-1-x, height-1-y
			case 4:
				dx, dy = x, height-1-y
			case 5:
				dx, dy = y, x
			case 6:
				dx, dy = height-1-y, x
			case 7:
				dx, dy = height-1-y, width-1-x
			case 8:
				dx, dy = y, width-1-x
			}
			dst.Set(dx, dy, img.At(bounds.Min.X+x, bounds.Min.Y+y))
		}
	}
	return dst
}
