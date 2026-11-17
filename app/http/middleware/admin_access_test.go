package middleware

import (
	http "github.com/goravel/framework/contracts/http"
	httpmocks "github.com/goravel/framework/mocks/http"
	"github.com/stretchr/testify/require"
	"goravel/app/models"
	"testing"
)

func TestAdminMiddlewareRejectsUsers(t *testing.T) {
	for _, role := range []any{nil, models.RoleUser, "admin", models.RoleAdmin} {
		c := new(httpmocks.Context)
		request := new(httpmocks.ContextRequest)
		c.On("Value", "userRole").Return(role)
		c.On("Request").Return(request)
		allowed := role == models.RoleAdmin
		if allowed {
			request.On("Next").Return()
		} else {
			request.On("AbortWithStatusJson", 403, http.Json{"error": "Forbidden: Admin access required"}).Return()
		}
		AdminMiddleware()(c)
		require.True(t, request.AssertExpectations(t))
	}
}
