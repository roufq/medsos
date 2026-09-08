package controllers

import (
	"goravel/app/dto"
	"goravel/app/services"
	"net/http"
	"strconv"

	goravelhttp "github.com/goravel/framework/contracts/http"
)

type PortfolioController struct {
	portfolioService services.PortfolioService
}

func NewPortfolioController(ps services.PortfolioService) *PortfolioController {
	return &PortfolioController{portfolioService: ps}
}

func (h *PortfolioController) CreatePortfolio(c goravelhttp.Context) goravelhttp.Response {
	ctxID := c.Value("userID")
	if ctxID == nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized"})
	}

	// Ensure the type is correctly parsed, the middleware sets it as int64
	userID, ok := ctxID.(int64)
	if !ok {
		// Just in case it's a float64 (from JSON JWT sometimes)
		if fID, isFloat := ctxID.(float64); isFloat {
			userID = int64(fID)
		} else {
			return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Invalid user ID type in context"})
		}
	}

	var req dto.CreatePortfolioRequest
	if err := c.Request().Bind(&req); err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": err.Error()})
	}

	portfolio, err := h.portfolioService.CreatePortfolio(userID, req)
	if err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Failed to create portfolio"})
	}

	return c.Response().Json(http.StatusCreated, portfolio)
}

func (h *PortfolioController) GetPortfolios(c goravelhttp.Context) goravelhttp.Response {
	userIDStr := c.Request().Route("id")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "Invalid user ID"})
	}

	portfolios, err := h.portfolioService.GetPortfolios(userID)
	if err != nil {
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Failed to get portfolios"})
	}

	return c.Response().Json(http.StatusOK, portfolios)
}

func (h *PortfolioController) DeletePortfolio(c goravelhttp.Context) goravelhttp.Response {
	ctxID := c.Value("userID")
	if ctxID == nil {
		return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Unauthorized"})
	}

	userID, ok := ctxID.(int64)
	if !ok {
		if fID, isFloat := ctxID.(float64); isFloat {
			userID = int64(fID)
		} else {
			return c.Response().Json(http.StatusUnauthorized, goravelhttp.Json{"error": "Invalid user ID type in context"})
		}
	}

	portfolioIDStr := c.Request().Route("id")
	portfolioID, err := strconv.ParseInt(portfolioIDStr, 10, 64)
	if err != nil {
		return c.Response().Json(http.StatusBadRequest, goravelhttp.Json{"error": "Invalid portfolio ID"})
	}

	if err := h.portfolioService.DeletePortfolio(userID, portfolioID); err != nil {
		if err.Error() == "unauthorized to delete this portfolio" {
			return c.Response().Json(http.StatusForbidden, goravelhttp.Json{"error": err.Error()})
		}
		return c.Response().Json(http.StatusInternalServerError, goravelhttp.Json{"error": "Failed to delete portfolio"})
	}

	return c.Response().Json(http.StatusOK, goravelhttp.Json{"message": "Portfolio deleted successfully"})
}
