package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// AuditLog represents an audit log entry
type AuditLog struct {
	Timestamp    time.Time   `json:"timestamp"`
	Method       string      `json:"method"`
	Path         string      `json:"path"`
	StatusCode   int         `json:"status_code"`
	Duration     int64       `json:"duration_ms"`
	ClientIP     string      `json:"client_ip"`
	UserAgent    string      `json:"user_agent"`
	UserID       interface{} `json:"user_id,omitempty"`
	RequestBody  string      `json:"request_body,omitempty"`
	ResponseSize int         `json:"response_size"`
	Error        string      `json:"error,omitempty"`
}

// AuditLogger creates a middleware for audit logging
func AuditLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		
		// Capture request body if it's not too large and is relevant
		var requestBody string
		if shouldLogRequestBody(c) {
			if body, err := io.ReadAll(c.Request.Body); err == nil {
				requestBody = string(body)
				// Restore the request body for the next handler
				c.Request.Body = io.NopCloser(bytes.NewBuffer(body))
			}
		}

		// Create a response writer wrapper to capture response size
		writer := &responseWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = writer

		// Process request
		c.Next()

		// Calculate duration
		duration := time.Since(start)

		// Get user ID if available
		userID, exists := c.Get("user_id")
		if !exists {
			userID = nil
		}

		// Get error if any
		var errorMsg string
		if len(c.Errors) > 0 {
			errorMsg = c.Errors.String()
		}

		// Create audit log entry
		auditLog := AuditLog{
			Timestamp:    start,
			Method:       c.Request.Method,
			Path:         c.Request.URL.Path,
			StatusCode:   c.Writer.Status(),
			Duration:     duration.Milliseconds(),
			ClientIP:     c.ClientIP(),
			UserAgent:    c.Request.UserAgent(),
			UserID:       userID,
			RequestBody:  sanitizeRequestBody(requestBody),
			ResponseSize: writer.body.Len(),
			Error:        errorMsg,
		}

		// Log to structured format
		logAuditEntry(auditLog)
	}
}

type responseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w responseWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

// shouldLogRequestBody determines if request body should be logged
func shouldLogRequestBody(c *gin.Context) bool {
	// Don't log for GET/HEAD requests
	if c.Request.Method == "GET" || c.Request.Method == "HEAD" {
		return false
	}

	// Don't log for large requests
	if c.Request.ContentLength > 10240 { // 10KB limit
		return false
	}

	// Don't log file uploads
	contentType := c.Request.Header.Get("Content-Type")
	if strings.Contains(contentType, "multipart/form-data") ||
		strings.Contains(contentType, "application/octet-stream") {
		return false
	}

	return true
}

// sanitizeRequestBody removes sensitive information from request body
func sanitizeRequestBody(body string) string {
	if body == "" {
		return ""
	}

	// Parse as JSON and redact sensitive fields
	var data map[string]interface{}
	if err := json.Unmarshal([]byte(body), &data); err == nil {
		// Redact password fields
		sensitiveFields := []string{"password", "token", "secret", "key", "credential"}
		for _, field := range sensitiveFields {
			if _, exists := data[field]; exists {
				data[field] = "[REDACTED]"
			}
		}

		if sanitized, err := json.Marshal(data); err == nil {
			return string(sanitized)
		}
	}

	// If not JSON, just return truncated version
	if len(body) > 500 {
		return body[:500] + "..."
	}
	return body
}

// logAuditEntry logs the audit entry in structured format
func logAuditEntry(entry AuditLog) {
	// Convert to JSON for structured logging
	if logData, err := json.Marshal(entry); err == nil {
		log.Printf("AUDIT: %s", string(logData))
	} else {
		// Fallback to simple format
		log.Printf("AUDIT: %s %s %d %dms %s", 
			entry.Method, 
			entry.Path, 
			entry.StatusCode, 
			entry.Duration,
			entry.ClientIP,
		)
	}
}

// AuditConfig holds configuration for audit logging
type AuditConfig struct {
	EnableFileLogging     bool
	LogFilePath          string
	EnableDatabaseLogging bool
	LogSensitiveData     bool
	MaxRequestBodySize   int64
}

// TODO: In future, extend this to support:
// 1. Database logging for audit trails
// 2. File-based logging with rotation
// 3. Integration with external log aggregation systems
// 4. Configurable sensitivity levels
// 5. Async logging for better performance