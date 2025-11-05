#!/bin/bash

# Multi-Agent Development Setup Script
# This script sets up the development environment for all 5 agents

set -e

echo "🚀 Setting up Multi-Agent Development Environment for Niyama"
echo "=============================================================="

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check for bun
    if ! command -v bun &> /dev/null; then
        print_error "Bun is not installed. Please install it from https://bun.sh"
        exit 1
    fi
    
    # Check for Go
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install it from https://golang.org"
        exit 1
    fi
    
    # Check for Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it from https://docker.com"
        exit 1
    fi
    
    # Check for Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install it from https://git-scm.com"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        print_status "Creating .env file from .env.example..."
        cp .env.example .env
        print_warning "Please update .env file with your actual values"
    else
        print_success ".env file already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root dependencies
    print_status "Installing root dependencies..."
    bun install
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd backend-go
    go mod tidy
    cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    bun install
    cd ..
    
    print_success "All dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Start PostgreSQL with Docker
    print_status "Starting PostgreSQL container..."
    docker run -d \
        --name niyama-postgres \
        -e POSTGRES_DB=niyama \
        -e POSTGRES_USER=niyama \
        -e POSTGRES_PASSWORD=niyama \
        -p 5432:5432 \
        postgres:15
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    print_success "Database setup complete"
}

# Setup Redis
setup_redis() {
    print_status "Setting up Redis..."
    
    # Start Redis with Docker
    print_status "Starting Redis container..."
    docker run -d \
        --name niyama-redis \
        -p 6379:6379 \
        redis:7-alpine
    
    print_success "Redis setup complete"
}

# Create feature branches for each agent
create_feature_branches() {
    print_status "Creating feature branches for each agent..."
    
    # Agent 1: Backend Infrastructure
    git checkout -b feature/database-integration
    git checkout main
    
    # Agent 2: Frontend & UI
    git checkout -b feature/frontend-optimization
    git checkout main
    
    # Agent 3: DevOps & Infrastructure
    git checkout -b feature/ci-cd-pipeline
    git checkout main
    
    # Agent 4: Testing & Quality
    git checkout -b feature/testing-framework
    git checkout main
    
    # Agent 5: AI & Advanced Features
    git checkout -b feature/ai-enhancements
    git checkout main
    
    print_success "Feature branches created for all agents"
}

# Setup development tools
setup_dev_tools() {
    print_status "Setting up development tools..."
    
    # Install pre-commit hooks
    if command -v pre-commit &> /dev/null; then
        print_status "Installing pre-commit hooks..."
        pre-commit install
    else
        print_warning "pre-commit not installed. Skipping pre-commit hooks setup."
    fi
    
    # Setup VS Code settings
    if [ -d .vscode ]; then
        print_status "VS Code settings already exist"
    else
        print_status "Creating VS Code settings..."
        mkdir -p .vscode
        cat > .vscode/settings.json << EOF
{
    "go.testFlags": ["-v"],
    "go.testTimeout": "30s",
    "typescript.preferences.importModuleSpecifier": "relative",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    }
}
EOF
    fi
    
    print_success "Development tools setup complete"
}

# Create agent workspace directories
create_agent_workspaces() {
    print_status "Creating agent workspace directories..."
    
    # Create directories for each agent
    mkdir -p agent-workspaces/agent-1-backend
    mkdir -p agent-workspaces/agent-2-frontend
    mkdir -p agent-workspaces/agent-3-devops
    mkdir -p agent-workspaces/agent-4-testing
    mkdir -p agent-workspaces/agent-5-ai
    
    # Create symlinks to relevant directories
    ln -sf ../../backend-go agent-workspaces/agent-1-backend/
    ln -sf ../../frontend agent-workspaces/agent-2-frontend/
    ln -sf ../../.github agent-workspaces/agent-3-devops/
    ln -sf ../../tests agent-workspaces/agent-4-testing/
    ln -sf ../../ai agent-workspaces/agent-5-ai/
    
    print_success "Agent workspace directories created"
}

# Main setup function
main() {
    echo "Starting multi-agent development setup..."
    echo ""
    
    check_dependencies
    setup_environment
    install_dependencies
    setup_database
    setup_redis
    create_feature_branches
    setup_dev_tools
    create_agent_workspaces
    
    echo ""
    echo "🎉 Multi-Agent Development Environment Setup Complete!"
    echo "=============================================================="
    echo ""
    echo "📋 Next Steps:"
    echo "1. Review the coordination guide: MULTI_AGENT_COORDINATION.md"
    echo "2. Each agent should check their specific task file:"
    echo "   - Agent 1: AGENT_1_BACKEND_TASKS.md"
    echo "   - Agent 2: AGENT_2_FRONTEND_TASKS.md"
    echo "   - Agent 3: AGENT_3_DEVOPS_TASKS.md"
    echo "   - Agent 4: AGENT_4_TESTING_TASKS.md"
    echo "   - Agent 5: AGENT_5_AI_TASKS.md"
    echo ""
    echo "🚀 To start development:"
    echo "   bun run dev"
    echo ""
    echo "📊 To check status:"
    echo "   docker ps"
    echo "   git branch"
    echo ""
    echo "🆘 For help:"
    echo "   Check MULTI_AGENT_COORDINATION.md for coordination guidelines"
    echo ""
}

# Run main function
main "$@"
