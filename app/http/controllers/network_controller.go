package controllers

import (
	"errors"
	"strconv"

	"github.com/goravel/framework/contracts/http"
	"goravel/app/repositories"
)

type NetworkController struct {
	networkRepo repositories.NetworkRepository
}

func NewNetworkController(networkRepo repositories.NetworkRepository) *NetworkController {
	return &NetworkController{
		networkRepo: networkRepo,
	}
}

func (c *NetworkController) GetConnections(ctx http.Context) http.Response {
	userID, err := authenticatedUserID(ctx)
	if err != nil {
		return ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}

	users, err := c.networkRepo.GetConnections(userID)
	if err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Failed to get connections"})
	}

	return ctx.Response().Json(200, publicUsers(users))
}

func (c *NetworkController) GetPendingRequests(ctx http.Context) http.Response {
	userID, err := authenticatedUserID(ctx)
	if err != nil {
		return ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}

	users, err := c.networkRepo.GetPendingRequests(userID)
	if err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Failed to get pending requests"})
	}

	return ctx.Response().Json(200, publicUsers(users))
}

func (c *NetworkController) GetSuggestions(ctx http.Context) http.Response {
	userID, err := authenticatedUserID(ctx)
	if err != nil {
		return ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}

	users, err := c.networkRepo.GetSuggestions(userID)
	if err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Failed to get suggestions"})
	}

	return ctx.Response().Json(200, publicUsers(users))
}

func (c *NetworkController) SendRequest(ctx http.Context) http.Response {
	followerID, err := authenticatedUserID(ctx)
	if err != nil {
		return ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}
	followedID, err := strconv.ParseInt(ctx.Request().Input("user_id"), 10, 64)
	if err != nil || followedID <= 0 || followedID == followerID {
		return ctx.Response().Json(400, http.Json{"error": "Invalid user_id"})
	}

	status, isNew, err := followUser(followerID, followedID)
	switch {
	case errors.Is(err, errFollowBlocked):
		return ctx.Response().Json(403, http.Json{"error": "Follow is not allowed"})
	case errors.Is(err, errFollowNotFound):
		return ctx.Response().Json(404, http.Json{"error": "User not found"})
	case err != nil:
		return ctx.Response().Json(500, http.Json{"error": "Failed to send request"})
	}
	if isNew {
		notifyFollow(followedID, followerID, status)
	}
	return ctx.Response().Json(200, http.Json{"message": "Follow updated successfully", "status": status})
}

func (c *NetworkController) AcceptRequest(ctx http.Context) http.Response {
	followedID, err := authenticatedUserID(ctx)
	if err != nil {
		return ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}
	followerID, err := strconv.ParseInt(ctx.Request().Input("user_id"), 10, 64)
	if err != nil || followerID <= 0 {
		return ctx.Response().Json(400, http.Json{"error": "Invalid user_id"})
	}

	if err := c.networkRepo.AcceptRequest(followerID, followedID); err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Failed to accept request"})
	}
	notifyUser(followerID, followedID, "follow_accepted", "user", followedID, "Your follow request was accepted")

	return ctx.Response().Json(200, http.Json{"message": "Request accepted"})
}

func (c *NetworkController) DeclineRequest(ctx http.Context) http.Response {
	followedID, err := authenticatedUserID(ctx)
	if err != nil {
		return ctx.Response().Json(401, http.Json{"error": "Unauthorized"})
	}
	followerID, err := strconv.ParseInt(ctx.Request().Input("user_id"), 10, 64)
	if err != nil || followerID <= 0 {
		return ctx.Response().Json(400, http.Json{"error": "Invalid user_id"})
	}

	if err := c.networkRepo.DeclineRequest(followerID, followedID); err != nil {
		return ctx.Response().Json(500, http.Json{"error": "Failed to decline request"})
	}

	return ctx.Response().Json(200, http.Json{"message": "Request declined"})
}
