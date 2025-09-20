package handlers

import (
	"net/http"

	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	service *services.UserService
}

func NewUserHandler(service *services.UserService) *UserHandler {
	return &UserHandler{service: service}
}

func (h *UserHandler) GetUsers(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get users - TODO"})
}

func (h *UserHandler) GetUser(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get user - TODO"})
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Update user - TODO"})
}

func (h *UserHandler) DeleteUser(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Delete user - TODO"})
}
