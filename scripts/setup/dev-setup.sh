#!/bin/bash
set -e

echo "🚀 Setting up Niyama development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Go version
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go 1.21+"
        print_status "Visit: https://golang.org/doc/install"
        exit 1
    fi
    
    GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
    print_success "Go version: $GO_VERSION"
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm version: $NPM_VERSION"
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker version: $DOCKER_VERSION"
    else
        print_warning "Docker is not installed. Some features may not work."
        print_status "Visit: https://docs.docker.com/get-docker/"
    fi
    
    # Check kubectl (optional)
    if command -v kubectl &> /dev/null; then
        KUBECTL_VERSION=$(kubectl version --client --short 2>/dev/null || echo "kubectl installed")
        print_success "kubectl: $KUBECTL_VERSION"
    else
        print_warning "kubectl is not installed. Kubernetes features will not work."
    fi
    
    print_success "Prerequisites check passed"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Download Go modules
    print_status "Downloading Go modules..."
    go mod download
    go mod tidy
    
    # Copy environment file
    if [ ! -f .env ]; then
        if [ -f ../config/development/.env.example ]; then
            cp ../config/development/.env.example .env
            print_success "Created .env file from template"
        else
            print_warning "No .env template found, creating basic .env"
            cat > .env << EOF
# Basic development configuration
DATABASE_URL=postgres://postgres:password@localhost:5432/niyama_dev?sslmode=disable
REDIS_URL=redis://localhost:6379
PORT=8000
GIN_MODE=debug
ENVIRONMENT=development
JWT_SECRET=dev-secret-key
CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-key
GEMINI_API_KEY=your-gemini-key
EOF
            print_success "Created basic .env file"
        fi
    else
        print_success ".env file already exists"
    fi
    
    # Build the application to check for errors
    print_status "Building backend to verify setup..."
    if go build -o bin/niyama-server cmd/server/main.go; then
        print_success "Backend build successful"
        rm -f bin/niyama-server
    else
        print_error "Backend build failed"
        cd ..
        exit 1
    fi
    
    cd ..
    print_success "Backend setup complete"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install npm dependencies
    print_status "Installing npm dependencies..."
    if npm install; then
        print_success "npm dependencies installed"
    else
        print_error "Failed to install npm dependencies"
        cd ..
        exit 1
    fi
    
    # Copy environment file
    if [ ! -f .env ]; then
        if [ -f ../config/development/.env.example ]; then
            # Extract frontend-specific variables
            cat > .env << EOF
# Frontend development configuration
VITE_API_URL=http://localhost:8000/api/v1
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key
VITE_ENVIRONMENT=development
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_COMPLIANCE_FEATURES=true
VITE_ENABLE_MONITORING=true
EOF
            print_success "Created frontend .env file"
        else
            print_warning "No frontend .env template found"
        fi
    else
        print_success "Frontend .env file already exists"
    fi
    
    # Run type checking to verify setup
    print_status "Running TypeScript type checking..."
    if npm run type-check; then
        print_success "TypeScript type checking passed"
    else
        print_warning "TypeScript type checking failed, but continuing..."
    fi
    
    cd ..
    print_success "Frontend setup complete"
}

# Setup development tools
setup_tools() {
    print_status "Setting up development tools..."
    
    # Install pre-commit hooks if pre-commit is available
    if command -v pre-commit &> /dev/null; then
        print_status "Installing pre-commit hooks..."
        pre-commit install
        print_success "Pre-commit hooks installed"
    else
        print_warning "pre-commit not found. Install with: pip install pre-commit"
        print_status "Creating basic git hooks..."
        
        # Create a basic pre-commit hook
        mkdir -p .git/hooks
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Basic pre-commit hook for Niyama

echo "Running pre-commit checks..."

# Check Go formatting
if command -v gofmt &> /dev/null; then
    if [ -n "$(gofmt -l backend/)" ]; then
        echo "Go code is not formatted. Run: make format-backend"
        exit 1
    fi
fi

# Check frontend linting
if [ -d "frontend/node_modules" ]; then
    cd frontend && npm run lint --silent
    if [ $? -ne 0 ]; then
        echo "Frontend linting failed. Run: make lint-frontend"
        exit 1
    fi
    cd ..
fi

echo "Pre-commit checks passed!"
EOF
        chmod +x .git/hooks/pre-commit
        print_success "Basic git hooks created"
    fi
    
    # Setup VS Code settings if .vscode directory exists
    if [ -d .vscode ]; then
        print_success "VS Code settings already configured"
    else
        print_status "Creating VS Code settings..."
        mkdir -p .vscode
        
        cat > .vscode/settings.json << 'EOF'
{
  "go.toolsManagement.checkForUpdates": "local",
  "go.useLanguageServer": true,
  "go.lintOnSave": "package",
  "go.formatTool": "goimports",
  "go.testFlags": ["-v", "-race"],
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
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/.DS_Store": true,
    "**/coverage": true
  }
}
EOF
        
        cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "golang.go",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-kubernetes-tools.vscode-kubernetes-tools",
    "redhat.vscode-yaml"
  ]
}
EOF
        
        print_success "VS Code settings created"
    fi
}

# Setup database (optional)
setup_database() {
    print_status "Setting up database..."
    
    # Check if Docker is available for local database
    if command -v docker &> /dev/null; then
        print_status "Checking for local PostgreSQL container..."
        
        if ! docker ps | grep -q postgres; then
            print_status "Starting PostgreSQL container..."
            docker run -d \
                --name niyama-postgres \
                -e POSTGRES_PASSWORD=password \
                -e POSTGRES_DB=niyama_dev \
                -p 5432:5432 \
                postgres:15
            
            print_success "PostgreSQL container started"
            
            # Wait for database to be ready
            print_status "Waiting for database to be ready..."
            sleep 5
        else
            print_success "PostgreSQL container already running"
        fi
        
        # Check if Redis is available
        if ! docker ps | grep -q redis; then
            print_status "Starting Redis container..."
            docker run -d \
                --name niyama-redis \
                -p 6379:6379 \
                redis:7
            
            print_success "Redis container started"
        else
            print_success "Redis container already running"
        fi
        
    else
        print_warning "Docker not available. Please set up PostgreSQL and Redis manually."
        print_status "PostgreSQL: https://www.postgresql.org/download/"
        print_status "Redis: https://redis.io/download"
    fi
}

# Main setup flow
main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    Niyama Development Setup                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_prerequisites
    echo ""
    
    setup_backend
    echo ""
    
    setup_frontend
    echo ""
    
    setup_tools
    echo ""
    
    setup_database
    echo ""
    
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    Setup Complete! 🎉                       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Start the backend:"
    echo "   make dev-backend"
    echo ""
    echo "2. Start the frontend (in another terminal):"
    echo "   make dev-frontend"
    echo ""
    echo "3. Or start both together:"
    echo "   make dev"
    echo ""
    echo "4. Open your browser:"
    echo "   Frontend: http://localhost:3001"
    echo "   Backend API: http://localhost:8000"
    echo "   API Docs: http://localhost:8000/docs"
    echo ""
    echo "For more commands, run: make help"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"