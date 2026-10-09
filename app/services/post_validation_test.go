package services

import (
	"strings"
	"testing"

	"goravel/app/dto"
	"goravel/app/models"
)

func words(n int) string { return strings.TrimSpace(strings.Repeat("kata ", n)) }

func validDraft() postDraft {
	d := postDraft{
		postType: models.PostTypeText,
		title:    "Judul yang valid",
		content:  words(DescriptionMinWords),
		tags:     []string{"satu", "dua", "tiga"},
		mentions: []string{"budi"},
	}
	d.normalize()
	return d
}

func TestValidDraftPasses(t *testing.T) {
	d := validDraft()
	if err := d.validate(); err != nil {
		t.Fatal(err)
	}
}

func TestPostRules(t *testing.T) {
	image := dto.MediaItem{URL: "u", Type: models.MediaTypeImage}
	video := func(seconds int) dto.MediaItem {
		return dto.MediaItem{URL: "v", Type: models.MediaTypeVideo, DurationSeconds: seconds}
	}
	shop := func() *dto.ShopPostRequest {
		return &dto.ShopPostRequest{PriceMinor: 150000, Currency: "idr", Category: "Elektronik", Condition: "New", Fulfillment: "pickup, cod"}
	}
	cases := map[string]func(d *postDraft){
		"title too short":         func(d *postDraft) { d.title = "abcd" },
		"title too long":          func(d *postDraft) { d.title = strings.Repeat("a", 101) },
		"description < 160 words": func(d *postDraft) { d.content = words(159) },
		"description > 6000":      func(d *postDraft) { d.content = words(6001) },
		"fewer than 3 hashtags":   func(d *postDraft) { d.tags = d.tags[:2] },
		"more than 9 hashtags":    func(d *postDraft) { d.tags = strings.Fields("a1 a2 a3 a4 a5 a6 a7 a8 a9 a10") },
		"no mention":              func(d *postDraft) { d.mentions = nil },
		"more than 10 mentions":   func(d *postDraft) { d.mentions = strings.Fields("m1 m2 m3 m4 m5 m6 m7 m8 m9 m10 m11") },
		"link without valid url":  func(d *postDraft) { d.postType = models.PostTypeLink; d.linkURL = "javascript:alert(1)" },
		"link with short description": func(d *postDraft) {
			d.postType, d.linkURL, d.content = models.PostTypeLink, "https://example.com", ""
		},
		"text with media":    func(d *postDraft) { d.media = []dto.MediaItem{image} },
		"image without file": func(d *postDraft) { d.postType = models.PostTypeImage },
		"seven images": func(d *postDraft) {
			d.postType = models.PostTypeImage
			for i := 0; i < 7; i++ {
				d.media = append(d.media, image)
			}
		},
		"video over 30 minutes": func(d *postDraft) { d.postType = models.PostTypeVideo; d.media = []dto.MediaItem{video(30*60 + 1)} },
		"shop without image":    func(d *postDraft) { d.postType = models.PostTypeShop; d.shop = shop() },
		"shop video too short": func(d *postDraft) {
			d.postType, d.shop = models.PostTypeShop, shop()
			d.media = []dto.MediaItem{image, video(29)}
		},
		"shop two videos": func(d *postDraft) {
			d.postType, d.shop = models.PostTypeShop, shop()
			d.media = []dto.MediaItem{image, video(40), video(50)}
		},
		"shop without price": func(d *postDraft) {
			d.postType, d.media, d.shop = models.PostTypeShop, []dto.MediaItem{image}, shop()
			d.shop.PriceMinor = 0
		},
		"shop bad condition": func(d *postDraft) {
			d.postType, d.media, d.shop = models.PostTypeShop, []dto.MediaItem{image}, shop()
			d.shop.Condition = "refurbished"
		},
		"shop 31 hashtags": func(d *postDraft) {
			d.postType, d.media, d.shop = models.PostTypeShop, []dto.MediaItem{image}, shop()
			d.tags = nil
			for i := 0; i < 31; i++ {
				d.tags = append(d.tags, "t"+strings.Repeat("x", i+1))
			}
		},
	}
	for name, mutate := range cases {
		d := validDraft()
		mutate(&d)
		if err := d.validate(); err == nil {
			t.Errorf("%s: expected validation error", name)
		}
	}
}

func TestValidVariants(t *testing.T) {
	image := dto.MediaItem{URL: "u", Type: models.MediaTypeImage}
	ok := map[string]func(d *postDraft){
		"six images": func(d *postDraft) {
			d.postType = models.PostTypeImage
			for i := 0; i < 6; i++ {
				d.media = append(d.media, image)
			}
		},
		"30 minute video": func(d *postDraft) {
			d.postType = models.PostTypeVideo
			d.media = []dto.MediaItem{{URL: "v", Type: models.MediaTypeVideo, DurationSeconds: 30 * 60}}
		},
		"link": func(d *postDraft) { d.postType, d.linkURL = models.PostTypeLink, "https://example.com/a" },
		"shop with short description and no mention": func(d *postDraft) {
			d.postType, d.content, d.mentions = models.PostTypeShop, "Sepatu lari ukuran 42", nil
			d.media = []dto.MediaItem{image, {URL: "v", Type: models.MediaTypeVideo, DurationSeconds: 45}}
			d.shop = &dto.ShopPostRequest{PriceMinor: 1, Currency: "usd", Category: "Fashion", Condition: "used", Fulfillment: "shipping,cod,shipping"}
		},
	}
	for name, mutate := range ok {
		d := validDraft()
		mutate(&d)
		if err := d.validate(); err != nil {
			t.Errorf("%s: unexpected error %v", name, err)
		}
	}
}

func TestShopNormalization(t *testing.T) {
	d := validDraft()
	d.postType, d.content, d.mentions = models.PostTypeShop, "Produk", nil
	d.media = []dto.MediaItem{{URL: "u", Type: models.MediaTypeImage}}
	d.shop = &dto.ShopPostRequest{PriceMinor: 5, Currency: " idr ", Category: " Buku ", Condition: " NEW ", Fulfillment: "COD, pickup, cod"}
	if err := d.validate(); err != nil {
		t.Fatal(err)
	}
	if d.shop.Currency != "IDR" || d.shop.Condition != "new" || d.shop.Category != "Buku" || d.shop.Fulfillment != "cod,pickup" {
		t.Fatalf("unexpected normalization %+v", d.shop)
	}
}

func TestHashtagAndMentionExtraction(t *testing.T) {
	tags := normalizeHashtags([]string{"#Go", "go"}, "Belajar #golang dan #Go hari ini")
	if strings.Join(tags, ",") != "go,golang" {
		t.Fatalf("unexpected tags %v", tags)
	}
	mentions := MentionedUsernames("halo @Budi_1 dan @siti, juga email a@b.com")
	if strings.Join(mentions, ",") != "budi_1,siti" {
		t.Fatalf("unexpected mentions %v", mentions)
	}
}
