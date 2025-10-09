# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git ca-certificates tzdata curl

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build \
    -a -installsuffix cgo \
    -ldflags='-w -s -extldflags "-static"' \
    -o niyama-server cmd/server/main.go

# Production stage
FROM alpine:latest

# Create non-root user
RUN addgroup -g 1001 -S niyama && \
    adduser -u 1001 -S niyama -G niyama

WORKDIR /app

# Install ca-certificates, timezone data, and curl for health checks
RUN apk --no-cache add ca-certificates tzdata curl

# Copy the binary from builder stage
COPY --from=builder /app/niyama-server .

# Copy policies directory if it exists
COPY --from=builder /app/policies ./policies 2>/dev/null || true

# Copy configuration directory
COPY --from=builder /app/config ./config 2>/dev/null || true

# Change ownership to non-root user
RUN chown -R niyama:niyama /app

# Switch to non-root user
USER niyama

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the binary
CMD ["./niyama-server", "-env=production"]
