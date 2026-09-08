//go:build tools

package main

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type PostComment struct {
	ID      int64
	Content string
}

func main() {
	dsn := "root:@tcp(127.0.0.1:3306)/facebook_clone?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Println("Error connecting to database:", err)
		return
	}

	var comments []PostComment
	db.Order("id desc").Limit(5).Find(&comments)

	fmt.Println("Latest 5 comments:")
	for _, c := range comments {
		fmt.Printf("ID: %d | Content: '%s'\n", c.ID, c.Content)
	}
}
