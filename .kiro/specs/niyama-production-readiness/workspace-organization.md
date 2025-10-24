# Workspace Organization Plan

## Current State Analysis

Based on the workspace analysis, here's the current structure and identified improvements:

### Current Structure
```
niyama/
├── backend-go/           # Go backend (well-organized)
├── frontend/             # React frontend (good structure)
├── k8s/                  # Kubernetes manifests
├── tests/                # E2E and performance tests
├── docs/                 # Documentation
├── scripts/              # Utility scripts
├── .github/workflows/    # CI/CD pipeline
└── node_modules/         # Dependencies (should be in frontend/)
```

### Issues Identified
1. **Root-level node_modules**: Should be in frontend directory
2. **Mixed configuration files**: Environment and config files scattered
3. **Limited development tooling**: Missing pre-commit hooks, linting configs
4. **Incomplete documentation structure**: Missing API docs, deployment guides
5. **No development environment automation**: Manual setup process
6. **Limited monitoring setup**: Basic observability configuration

## Proposed Workspace Structure

### Optimized Directory Layout
```
niyama/
├── .github/                    # GitHub workflows and templates
│   ├── workflows/              # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   └── PULL_REQUEST_TEMPLATE.md
├── .kiro/                      # Kiro configuration
│   ├── specs/                  # Feature specifications
│   └── settings/               # Kiro settings
├── backend/                    # Renamed from backend-go for clarity
│   ├── cmd/                    # Application entry points
│   ├── internal/               # Private application code
│   ├── pkg/                    # Public library code
│   ├── migrations/             # Database migrations
│   ├── scripts/                # Backend-specific scripts
│   ├── tests/                  # Backend unit/integration tests
│   └── Dockerfile
├── frontend/                   # React application
│   ├── src/                    # Source code
│   ├── public/                 # Static assets
│   ├── tests/                  # Frontend tests
│   ├── node_modules/           # Dependencies (moved here)
│   └── Dockerfile
├── infrastructure/             # Infrastructure as Code
│   ├── kubernetes/             # K8s manifests (renamed from k8s/)
│   ├── terraform/              # Terraform configurations
│   ├── helm/                   # Helm charts
│   └── monitoring/             # Prometheus, Grafana configs
├── tests/                      # Cross-system tests
│   ├── e2e/                    # End-to-end tests
│   ├── performance/            # Load testing
│   ├── security/               # Security tests
│   └── integration/            # Integration tests
├── docs/                       # Documentation
│   ├── api/                    # API documentation
│   ├── architecture/           # Architecture decisions
│   ├── deployment/             # Deployment guides
│   ├── development/            # Development setup
│   └── user/                   # User documentation
├── scripts/                    # Project-wide scripts
│   ├── setup/                  # Environment setup
│   ├── build/                  # Build scripts
│   ├── deploy/                 # Deployment scripts
│   └── maintenance/            # Maintenance utilities
├── config/                     # Configuration files
│   ├── development/            # Dev environment configs
│   ├── staging/                # Staging environment configs
│   └── production/             # Production environment configs
├── .devcontainer/              # VS Code dev container
├── .vscode/                    # VS Code settings
└── tools/                      # Development tools and utilities
```

## Development Workflow Improvements

### 1. Automated Development Setup

#### Setup Script (`scripts/setup/dev-setup.sh`)
```bash
#!/bin/bash
set -e

echo "🚀 Setting up Niyama development environment..."

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    # Check Go version
    if ! command -v go &> /dev/null; then
        echo "❌ Go is not installed. Please install Go 1.21+"
        exit 1
    fi
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker"
        exit 1
    fi
    
    echo "✅ Prerequisites check passed"
}

# Setup backend
setup_backend() {
    echo "🔧 Setting up backend..."
    cd backend
    go mod download
    go mod tidy
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "📝 Created .env file from template"
    fi
    
    # Run database migrations
    go run main.go -migrate
    
    # Seed database
    go run main.go -seed
    
    cd ..
    echo "✅ Backend setup complete"
}

# Setup frontend
setup_frontend() {
    echo "🎨 Setting up frontend..."
    cd frontend
    npm install
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "📝 Created frontend .env file from template"
    fi
    
    cd ..
    echo "✅ Frontend setup complete"
}

# Setup development tools
setup_tools() {
    echo "🛠️ Setting up development tools..."
    
    # Install pre-commit hooks
    if command -v pre-commit &> /dev/null; then
        pre-commit install
        echo "✅ Pre-commit hooks installed"
    else
        echo "⚠️ pre-commit not found. Install with: pip install pre-commit"
    fi
    
    # Setup VS Code settings
    if [ -d .vscode ]; then
        echo "✅ VS Code settings already configured"
    fi
}

# Main setup flow
main() {
    check_prerequisites
    setup_backend
    setup_frontend
    setup_tools
    
    echo ""
    echo "🎉 Development environment setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Start backend: cd backend && go run main.go"
    echo "2. Start frontend: cd frontend && npm run dev"
    echo "3. Open http://localhost:3001 in your browser"
    echo ""
    echo "For more information, see docs/development/README.md"
}

main "$@"
```

### 2. Code Quality Automation

#### Pre-commit Configuration (`.pre-commit-config.yaml`)
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict
      - id: check-added-large-files

  - repo: https://github.com/golangci/golangci-lint
    rev: v1.54.2
    hooks:
      - id: golangci-lint
        args: [--config=backend/.golangci.yml]
        files: ^backend/

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.44.0
    hooks:
      - id: eslint
        files: ^frontend/
        additional_dependencies:
          - eslint@8.44.0
          - '@typescript-eslint/parser@6.0.0'
          - '@typescript-eslint/eslint-plugin@6.0.0'

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.0
    hooks:
      - id: prettier
        files: ^frontend/
        exclude: ^frontend/dist/
```

#### Backend Linting Configuration (`backend/.golangci.yml`)
```yaml
run:
  timeout: 5m
  modules-download-mode: readonly

linters-settings:
  govet:
    check-shadowing: true
  golint:
    min-confidence: 0
  gocyclo:
    min-complexity: 15
  maligned:
    suggest-new: true
  dupl:
    threshold: 100
  goconst:
    min-len: 2
    min-occurrences: 2
  misspell:
    locale: US
  lll:
    line-length: 140
  goimports:
    local-prefixes: niyama-backend
  gocritic:
    enabled-tags:
      - diagnostic
      - experimental
      - opinionated
      - performance
      - style

linters:
  enable:
    - bodyclose
    - deadcode
    - depguard
    - dogsled
    - dupl
    - errcheck
    - exportloopref
    - exhaustive
    - funlen
    - gochecknoinits
    - goconst
    - gocritic
    - gocyclo
    - gofmt
    - goimports
    - golint
    - gomnd
    - goprintffuncname
    - gosec
    - gosimple
    - govet
    - ineffassign
    - interfacer
    - lll
    - misspell
    - nakedret
    - noctx
    - nolintlint
    - rowserrcheck
    - scopelint
    - staticcheck
    - structcheck
    - stylecheck
    - typecheck
    - unconvert
    - unparam
    - unused
    - varcheck
    - whitespace

issues:
  exclude-rules:
    - path: _test\.go
      linters:
        - gomnd
        - funlen
        - goconst
```

### 3. Enhanced CI/CD Pipeline

#### Updated GitHub Actions (`.github/workflows/ci.yml`)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

env:
  GO_VERSION: '1.21'
  NODE_VERSION: '18'

jobs:
  test-backend:
    name: Backend Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: niyama_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Go
      uses: actions/setup-go@v4
      with:
        go-version: ${{ env.GO_VERSION }}
    
    - name: Cache Go modules
      uses: actions/cache@v3
      with:
        path: ~/go/pkg/mod
        key: ${{ runner.os }}-go-${{ hashFiles('backend/go.sum') }}
        restore-keys: |
          ${{ runner.os }}-go-
    
    - name: Install dependencies
      working-directory: backend
      run: go mod download
    
    - name: Run linting
      working-directory: backend
      run: |
        go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
        golangci-lint run
    
    - name: Run tests
      working-directory: backend
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/niyama_test?sslmode=disable
        REDIS_URL: redis://localhost:6379
      run: |
        go test -v -race -coverprofile=coverage.out ./...
        go tool cover -html=coverage.out -o coverage.html
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: backend/coverage.out
        flags: backend

  test-frontend:
    name: Frontend Tests
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      working-directory: frontend
      run: npm ci
    
    - name: Run linting
      working-directory: frontend
      run: npm run lint
    
    - name: Run type checking
      working-directory: frontend
      run: npm run type-check
    
    - name: Run tests
      working-directory: frontend
      run: npm run test:coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: frontend/coverage/lcov.info
        flags: frontend

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
    
    - name: Install Playwright
      run: |
        npm install -g @playwright/test
        npx playwright install --with-deps
    
    - name: Start services
      run: |
        docker-compose -f docker-compose.test.yml up -d
        sleep 30  # Wait for services to be ready
    
    - name: Run E2E tests
      run: npx playwright test
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v2
      with:
        sarif_file: 'trivy-results.sarif'

  build-and-deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push backend image
      uses: docker/build-push-action@v5
      with:
        context: backend
        push: true
        tags: ghcr.io/${{ github.repository }}/backend:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Build and push frontend image
      uses: docker/build-push-action@v5
      with:
        context: frontend
        push: true
        tags: ghcr.io/${{ github.repository }}/frontend:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
```

### 4. Development Environment Configuration

#### VS Code Settings (`.vscode/settings.json`)
```json
{
  "go.toolsManagement.checkForUpdates": "local",
  "go.useLanguageServer": true,
  "go.lintOnSave": "package",
  "go.formatTool": "goimports",
  "go.testFlags": ["-v", "-race"],
  "go.coverOnSave": true,
  "go.coverageDecorator": {
    "type": "gutter",
    "coveredHighlightColor": "rgba(64,128,128,0.5)",
    "uncoveredHighlightColor": "rgba(128,64,64,0.25)"
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.yaml": "yaml",
    "*.yml": "yaml"
  },
  "yaml.schemas": {
    "https://json.schemastore.org/github-workflow.json": ".github/workflows/*.yml"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/.DS_Store": true,
    "**/coverage": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true,
    "**/*.log": true
  }
}
```

#### Dev Container Configuration (`.devcontainer/devcontainer.json`)
```json
{
  "name": "Niyama Development",
  "dockerComposeFile": "../docker-compose.dev.yml",
  "service": "dev",
  "workspaceFolder": "/workspace",
  "features": {
    "ghcr.io/devcontainers/features/go:1": {
      "version": "1.21"
    },
    "ghcr.io/devcontainers/features/node:1": {
      "version": "18"
    },
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/kubectl-helm-minikube:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "golang.go",
        "ms-vscode.vscode-typescript-next",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-eslint",
        "bradlc.vscode-tailwindcss",
        "ms-kubernetes-tools.vscode-kubernetes-tools",
        "redhat.vscode-yaml"
      ]
    }
  },
  "forwardPorts": [3001, 8000, 5432, 6379],
  "postCreateCommand": "scripts/setup/dev-setup.sh",
  "remoteUser": "vscode"
}
```

## Documentation Structure

### Enhanced Documentation Organization

#### API Documentation (`docs/api/README.md`)
- OpenAPI specification generation
- Interactive API explorer
- SDK documentation and examples
- Authentication and authorization guides

#### Architecture Documentation (`docs/architecture/`)
- System architecture diagrams
- Database schema documentation
- API design principles
- Security architecture
- Deployment architecture

#### Development Documentation (`docs/development/`)
- Getting started guide
- Development workflow
- Testing strategies
- Debugging guides
- Performance optimization

#### Deployment Documentation (`docs/deployment/`)
- Local development setup
- Staging environment setup
- Production deployment guide
- Kubernetes deployment
- Monitoring and observability setup

## Monitoring and Observability

### Enhanced Monitoring Stack

#### Prometheus Configuration (`infrastructure/monitoring/prometheus.yml`)
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'niyama-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'niyama-frontend'
    static_configs:
      - targets: ['frontend:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

#### Grafana Dashboards
- System performance dashboard
- Application metrics dashboard
- Business metrics dashboard
- Security and compliance dashboard

## Implementation Timeline

### Phase 1: Immediate Improvements (Week 1-2)
1. Reorganize directory structure
2. Implement automated setup scripts
3. Configure pre-commit hooks and linting
4. Update CI/CD pipeline
5. Enhance VS Code configuration

### Phase 2: Development Experience (Week 3-4)
1. Implement dev container setup
2. Create comprehensive documentation
3. Set up monitoring and observability
4. Configure automated testing
5. Implement security scanning

### Phase 3: Production Readiness (Week 5-6)
1. Optimize build and deployment processes
2. Implement comprehensive logging
3. Set up production monitoring
4. Create disaster recovery procedures
5. Finalize security hardening

## Success Metrics

### Developer Experience
- **Setup Time**: <10 minutes for new developer onboarding
- **Build Time**: <2 minutes for full build
- **Test Execution**: <5 minutes for full test suite
- **Code Quality**: 90%+ test coverage, zero linting errors

### Operational Excellence
- **Deployment Frequency**: Multiple deployments per day
- **Lead Time**: <1 hour from commit to production
- **Mean Time to Recovery**: <15 minutes
- **Change Failure Rate**: <5%

### Code Quality
- **Test Coverage**: >90% for both frontend and backend
- **Security Vulnerabilities**: Zero critical, <5 medium
- **Performance**: <200ms API response times
- **Documentation Coverage**: 100% API endpoints documented

This workspace organization plan provides a solid foundation for scaling the Niyama development team while maintaining high code quality and developer productivity.