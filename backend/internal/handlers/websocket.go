package handlers

import (
	"net/http"
	"strconv"
	"time"

	"niyama-backend/internal/websocket"

	"github.com/gin-gonic/gin"
	gorilla_websocket "github.com/gorilla/websocket"
)

type WebSocketHandler struct {
	hub *websocket.Hub
}

func NewWebSocketHandler(hub *websocket.Hub) *WebSocketHandler {
	return &WebSocketHandler{hub: hub}
}

// WebSocketUpgrader is the websocket upgrader
var WebSocketUpgrader = gorilla_websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins in development
		return true
	},
}

// Connect handles websocket connections
func (h *WebSocketHandler) Connect(c *gin.Context) {
	// Get user ID and organization ID from query params or headers
	userIDStr := c.Query("user_id")
	orgIDStr := c.Query("org_id")

	if userIDStr == "" || orgIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id and org_id are required"})
		return
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}

	orgID, err := strconv.ParseUint(orgIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid org_id"})
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := WebSocketUpgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	// Create client
	client := &websocket.Client{
		Hub:    h.hub,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		UserID: uint(userID),
		OrgID:  uint(orgID),
	}

	// Register client
	h.hub.Register <- client

	// Start goroutines for reading and writing
	go client.WritePump()
	go client.ReadPump()
}

// GetStats returns websocket connection statistics
func (h *WebSocketHandler) GetStats(c *gin.Context) {
	stats := gin.H{
		"total_connections": h.hub.GetClientCount(),
		"timestamp":         time.Now().Format(time.RFC3339),
	}

	c.JSON(http.StatusOK, stats)
}
