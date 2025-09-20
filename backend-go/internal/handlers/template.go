package handlers

import (
	"net/http"

	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type TemplateHandler struct {
	service *services.TemplateService
}

func NewTemplateHandler(service *services.TemplateService) *TemplateHandler {
	return &TemplateHandler{service: service}
}

func (h *TemplateHandler) GetTemplates(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get templates - TODO"})
}

func (h *TemplateHandler) GetTemplate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get template - TODO"})
}

func (h *TemplateHandler) CreateTemplate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Create template - TODO"})
}

func (h *TemplateHandler) UpdateTemplate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Update template - TODO"})
}

func (h *TemplateHandler) DeleteTemplate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Delete template - TODO"})
}
