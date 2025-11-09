# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies with frozen lockfile
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application with optimizations
RUN bun run build

# Production stage
FROM nginx:alpine

# Create non-root user
RUN addgroup -g 1001 -S niyama && \
    adduser -u 1001 -S niyama -G niyama

# Install security updates
RUN apk update && apk upgrade

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Set proper permissions
RUN chown -R niyama:niyama /usr/share/nginx/html && \
    chown -R niyama:niyama /var/cache/nginx && \
    chown -R niyama:niyama /var/log/nginx && \
    chown -R niyama:niyama /etc/nginx/conf.d

# Create nginx cache directory
RUN mkdir -p /var/cache/nginx/client_temp && \
    chown -R niyama:niyama /var/cache/nginx

# Switch to non-root user
USER niyama

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

