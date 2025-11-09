# Niyama Development Makefile

.PHONY: help setup dev build test clean docker-build docker-run

# Default target
help: ## Show this help message
	@echo "Niyama Development Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development setup
setup: ## Set up development environment
	@echo "🚀 Setting up Niyama development environment..."
	@./scripts/setup/dev-setup.sh

# Development commands
dev-backend: ## Start backend in development mode
	@echo "🔧 Starting backend server..."
	@cd backend && go run cmd/server/main.go -env=development

dev-frontend: ## Start frontend in development mode
	@echo "🎨 Starting frontend server..."
	@cd frontend && bun run dev

dev: ## Start both backend and frontend in development mode
	@echo "🚀 Starting full development environment..."
	@make -j2 dev-backend dev-frontend

# Build commands
build-backend: ## Build backend binary
	@echo "🔨 Building backend..."
	@cd backend && go build -o bin/niyama-server cmd/server/main.go

build-frontend: ## Build frontend for production
	@echo "🔨 Building frontend..."
	@cd frontend && bun run build

build: build-backend build-frontend ## Build both backend and frontend

# Test commands
test-backend: ## Run backend tests
	@echo "🧪 Running backend tests..."
	@cd backend && go test -v ./...

test-frontend: ## Run frontend tests
	@echo "🧪 Running frontend tests..."
	@cd frontend && npm run test

test-e2e: ## Run end-to-end tests
	@echo "🧪 Running E2E tests..."
	@npx playwright test

test: test-backend test-frontend ## Run all tests

# Database commands
db-migrate: ## Run database migrations
	@echo "📊 Running database migrations..."
	@cd backend && go run cmd/server/main.go -migrate -env=development

db-seed: ## Seed database with initial data
	@echo "🌱 Seeding database..."
	@cd backend && go run cmd/server/main.go -seed -env=development

db-reset: ## Reset database (migrate + seed)
	@echo "🔄 Resetting database..."
	@make db-migrate
	@make db-seed

# Docker commands
docker-build: ## Build Docker images
	@echo "🐳 Building Docker images..."
	@docker-compose build

docker-run: ## Run application with Docker Compose
	@echo "🐳 Starting application with Docker..."
	@docker-compose up -d

docker-stop: ## Stop Docker containers
	@echo "🛑 Stopping Docker containers..."
	@docker-compose down

docker-logs: ## Show Docker logs
	@docker-compose logs -f

# Linting and formatting
lint-backend: ## Lint backend code
	@echo "🔍 Linting backend code..."
	@cd backend && golangci-lint run

lint-frontend: ## Lint frontend code
	@echo "🔍 Linting frontend code..."
	@cd frontend && npm run lint

lint: lint-backend lint-frontend ## Lint all code

format-backend: ## Format backend code
	@echo "✨ Formatting backend code..."
	@cd backend && go fmt ./...
	@cd backend && goimports -w .

format-frontend: ## Format frontend code
	@echo "✨ Formatting frontend code..."
	@cd frontend && npm run lint:fix

format: format-backend format-frontend ## Format all code

# Monitoring commands
monitoring-up: ## Start monitoring stack (Prometheus, Grafana)
	@echo "📊 Starting monitoring stack..."
	@docker-compose -f infrastructure/monitoring/docker-compose.yml up -d

monitoring-down: ## Stop monitoring stack
	@echo "📊 Stopping monitoring stack..."
	@docker-compose -f infrastructure/monitoring/docker-compose.yml down

# Deployment commands
deploy-staging: ## Deploy to staging environment
	@echo "🚀 Deploying to staging..."
	@kubectl apply -f infrastructure/kubernetes/ --context=staging

deploy-production: ## Deploy to production environment
	@echo "🚀 Deploying to production..."
	@kubectl apply -f infrastructure/kubernetes/ --context=production

# Cleanup commands
clean: ## Clean build artifacts and dependencies
	@echo "🧹 Cleaning up..."
	@rm -rf backend/bin/
	@rm -rf frontend/dist/
	@rm -rf frontend/node_modules/.cache/
	@docker system prune -f

clean-all: clean ## Clean everything including node_modules
	@echo "🧹 Deep cleaning..."
	@rm -rf frontend/node_modules/
	@cd backend && go clean -modcache

# Security commands
security-scan: ## Run security scans
	@echo "🔒 Running security scans..."
	@cd backend && gosec ./...
	@cd frontend && npm audit

# Performance commands
load-test: ## Run load tests
	@echo "⚡ Running load tests..."
	@k6 run tests/performance/load-test.js

# Documentation commands
docs-generate: ## Generate API documentation
	@echo "📚 Generating API documentation..."
	@cd backend && swag init -g cmd/server/main.go

docs-serve: ## Serve documentation locally
	@echo "📚 Serving documentation..."
	@cd docs && python -m http.server 8080

# Git hooks
install-hooks: ## Install git hooks
	@echo "🪝 Installing git hooks..."
	@pre-commit install

# Environment commands
env-development: ## Copy development environment template
	@cp config/development/.env.example config/development/.env
	@cp config/development/.env.example backend/.env
	@echo "✅ Development environment configured"

env-staging: ## Copy staging environment template
	@cp config/staging/.env.example config/staging/.env
	@echo "✅ Staging environment configured"

env-production: ## Copy production environment template
	@cp config/production/.env.example config/production/.env
	@echo "✅ Production environment configured"