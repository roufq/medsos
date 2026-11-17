package models

import "strings"

func ShouldRecordActivity(method, target string) bool {
	path := strings.TrimPrefix(target, "/api/v1/")
	if path == "auth/activity" || strings.HasPrefix(path, "messages/call/") {
		return false
	}
	if strings.HasPrefix(path, "admin/posts/") && (method == "DELETE" || strings.HasSuffix(path, "/restore")) {
		return false
	}
	if method != "GET" {
		return true
	}
	if path == "posts" || path == "explore" || path == "search" {
		return true
	}
	if strings.Count(path, "/") != 1 {
		return false
	}
	if strings.HasPrefix(path, "posts/") {
		return path != "posts/link-preview"
	}
	return strings.HasPrefix(path, "users/") && path != "users/me" && path != "users/blocked"
}

func ActivityDescription(method, path string) string {
	path = strings.TrimPrefix(path, "/api/v1/")
	if method == "GET" {
		switch {
		case path == "posts":
			return "Melihat beranda"
		case path == "explore":
			return "Menjelajahi konten"
		case path == "search":
			return "Mencari konten"
		case strings.HasPrefix(path, "posts/"):
			return "Membuka postingan"
		case strings.HasPrefix(path, "users/"):
			return "Melihat profil"
		}
		return "Melihat data"
	}
	switch {
	case path == "posts" && method == "POST":
		return "Membuat postingan"
	case strings.HasSuffix(path, "/like"):
		return "Mengubah suka pada postingan"
	case strings.HasSuffix(path, "/save"):
		return "Mengubah koleksi postingan"
	case strings.Contains(path, "/comment"):
		return "Mengelola komentar"
	case strings.HasSuffix(path, "/repost"):
		return "Membagikan ulang postingan"
	case path == "media/upload":
		return "Mengunggah media"
	case strings.HasPrefix(path, "messages"):
		return "Melakukan tindakan pada percakapan"
	case strings.HasPrefix(path, "posts/") && method == "PUT":
		return "Memperbarui postingan"
	case strings.HasPrefix(path, "posts/") && method == "DELETE":
		return "Menghapus postingan sendiri"
	case path == "auth/logout":
		return "Keluar dari akun"
	case strings.Contains(path, "follow"):
		return "Mengubah hubungan mengikuti"
	case strings.Contains(path, "block"):
		return "Mengubah status blokir"
	case strings.HasPrefix(path, "admin/"):
		return "Melakukan tindakan administrator"
	case strings.HasPrefix(path, "users/"):
		return "Memperbarui profil atau pengaturan akun"
	}
	return "Melakukan tindakan pada aplikasi"
}
