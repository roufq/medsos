package controllers

import (
	"github.com/goravel/framework/contracts/http"
	"goravel/app/repositories"
	"strconv"
	"strings"
)

type MessageController struct {
	msgRepo repositories.MessageRepository
}

func NewMessageController(msgRepo repositories.MessageRepository) *MessageController {
	return &MessageController{
		msgRepo: msgRepo,
	}
}

func (c *MessageController) GetConversations(ctx http.Context) http.Response {
	userID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}

	convs, err := c.msgRepo.GetConversations(userID)
	if err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Failed to get conversations"})
	}

	return ctx.Response().Json(200, convs)
}

func (c *MessageController) GetMessages(ctx http.Context) http.Response {
	userID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}

	convIDStr := ctx.Request().Query("conversation_id", "")
	convID, _ := strconv.ParseInt(convIDStr, 10, 64)

	if convID == 0 {
		return ctx.Response().Json(400, http.Json{"error": "conversation_id is required"})
	}

	msgs, err := c.msgRepo.GetMessages(convID, userID)
	if err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Failed to get messages"})
	}

	// Mark as read
	c.msgRepo.MarkAsRead(convID, userID)

	return ctx.Response().Json(200, msgs)
}

func (c *MessageController) SendMessage(ctx http.Context) http.Response {
	senderID, authErr := authenticatedUserID(ctx)
	if authErr != nil {
		return ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}
	receiverID, err := strconv.ParseInt(ctx.Request().Input("receiver_id"), 10, 64)
	content := strings.TrimSpace(ctx.Request().Input("content"))
	if err != nil || receiverID <= 0 || receiverID == senderID {
		return ctx.Response().Json(400, http.Json{"error": "Invalid receiver_id"})
	}
	if content == "" || len(content) > 5000 {
		return ctx.Response().Json(400, http.Json{"error": "Message content must be between 1 and 5000 bytes"})
	}

	msg, err := c.msgRepo.SendMessage(senderID, receiverID, content)
	if err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Failed to send message"})
	}

	return ctx.Response().Json(200, msg)
}
