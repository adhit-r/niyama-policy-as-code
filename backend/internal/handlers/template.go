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
	templates, err := h.service.GetTemplates()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get templates",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, templates)
}

func (h *TemplateHandler) GetTemplate(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": "Template ID is required",
		})
		return
	}

	template, err := h.service.GetTemplate(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get template",
			"message": err.Error(),
		})
		return
	}

	if template == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Template not found",
			"message": "Template with ID " + id + " does not exist",
		})
		return
	}

	c.JSON(http.StatusOK, template)
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
