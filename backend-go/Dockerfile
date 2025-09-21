# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git ca-certificates tzdata

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
    -o niyama-backend .

# Production stage
FROM alpine:latest

# Create non-root user
RUN addgroup -g 1001 -S niyama && \
    adduser -u 1001 -S niyama -G niyama

WORKDIR /app

# Install ca-certificates and timezone data
RUN apk --no-cache add ca-certificates tzdata

# Copy the binary from builder stage
COPY --from=builder /app/niyama-backend .

# Copy policies directory
COPY --from=builder /app/policies ./policies

# Change ownership to non-root user
RUN chown -R niyama:niyama /app

# Switch to non-root user
USER niyama

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Run the binary
CMD ["./niyama-backend"]
