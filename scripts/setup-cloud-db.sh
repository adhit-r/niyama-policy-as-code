#!/bin/bash

# Cloud Database Setup Script for Niyama
# This script helps set up a cloud PostgreSQL database

set -e

echo "🌐 Niyama Cloud Database Setup"
echo "================================"

# Check if required tools are installed
check_requirements() {
    echo "🔍 Checking requirements..."
    
    if ! command -v psql &> /dev/null; then
        echo "❌ PostgreSQL client (psql) not found"
        echo "Please install PostgreSQL client tools"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        echo "❌ curl not found"
        echo "Please install curl"
        exit 1
    fi
    
    echo "✅ Requirements check passed"
}

# Display cloud database options
show_options() {
    echo ""
    echo "🚀 Choose a cloud database provider:"
    echo ""
    echo "1. Neon (Recommended) - Serverless PostgreSQL"
    echo "   - Free tier: 3GB storage, 10GB transfer"
    echo "   - Auto-scaling, branching, point-in-time recovery"
    echo "   - Setup: 5 minutes"
    echo ""
    echo "2. Supabase - Full-stack platform"
    echo "   - Free tier: 500MB database, 2GB bandwidth"
    echo "   - Real-time features, built-in auth"
    echo "   - Setup: 10 minutes"
    echo ""
    echo "3. Railway - Simple deployment"
    echo "   - $5/month for database"
    echo "   - Simple setup, good for startups"
    echo "   - Setup: 5 minutes"
    echo ""
    echo "4. AWS RDS - Enterprise grade"
    echo "   - $15+/month for small instance"
    echo "   - Highly available, enterprise features"
    echo "   - Setup: 30 minutes"
    echo ""
    echo "5. Manual setup - You provide connection details"
    echo ""
}

# Setup Neon database
setup_neon() {
    echo "🔧 Setting up Neon database..."
    echo ""
    echo "1. Go to https://neon.tech"
    echo "2. Sign up for a free account"
    echo "3. Create a new project"
    echo "4. Copy the connection string"
    echo ""
    echo "Your connection string should look like:"
    echo "postgresql://username:password@host:port/database?sslmode=require"
    echo ""
    read -p "Enter your Neon connection string: " NEON_URL
    
    if [[ $NEON_URL == postgresql://* ]]; then
        echo "✅ Valid connection string detected"
        update_env_file "$NEON_URL"
    else
        echo "❌ Invalid connection string format"
        exit 1
    fi
}

# Setup Supabase database
setup_supabase() {
    echo "🔧 Setting up Supabase database..."
    echo ""
    echo "1. Go to https://supabase.com"
    echo "2. Sign up for a free account"
    echo "3. Create a new project"
    echo "4. Go to Settings > Database"
    echo "5. Copy the connection string"
    echo ""
    read -p "Enter your Supabase connection string: " SUPABASE_URL
    
    if [[ $SUPABASE_URL == postgresql://* ]]; then
        echo "✅ Valid connection string detected"
        update_env_file "$SUPABASE_URL"
    else
        echo "❌ Invalid connection string format"
        exit 1
    fi
}

# Setup Railway database
setup_railway() {
    echo "🔧 Setting up Railway database..."
    echo ""
    echo "1. Go to https://railway.app"
    echo "2. Sign up for an account"
    echo "3. Create a new PostgreSQL service"
    echo "4. Copy the connection string from the service"
    echo ""
    read -p "Enter your Railway connection string: " RAILWAY_URL
    
    if [[ $RAILWAY_URL == postgresql://* ]]; then
        echo "✅ Valid connection string detected"
        update_env_file "$RAILWAY_URL"
    else
        echo "❌ Invalid connection string format"
        exit 1
    fi
}

# Manual setup
setup_manual() {
    echo "🔧 Manual database setup..."
    echo ""
    read -p "Enter database host: " DB_HOST
    read -p "Enter database port (default 5432): " DB_PORT
    read -p "Enter database name: " DB_NAME
    read -p "Enter database user: " DB_USER
    read -s -p "Enter database password: " DB_PASSWORD
    echo ""
    read -p "Use SSL? (y/n): " USE_SSL
    
    DB_PORT=${DB_PORT:-5432}
    SSL_MODE="disable"
    if [[ $USE_SSL == "y" || $USE_SSL == "Y" ]]; then
        SSL_MODE="require"
    fi
    
    # Build connection string
    if [[ $SSL_MODE == "require" ]]; then
        DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?sslmode=require"
    else
        DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    fi
    
    update_env_file "$DATABASE_URL" "$DB_HOST" "$DB_PORT" "$DB_NAME" "$DB_USER" "$DB_PASSWORD" "$SSL_MODE"
}

# Update .env file with database configuration
update_env_file() {
    local DATABASE_URL="$1"
    local DB_HOST="${2:-}"
    local DB_PORT="${3:-}"
    local DB_NAME="${4:-}"
    local DB_USER="${5:-}"
    local DB_PASSWORD="${6:-}"
    local SSL_MODE="${7:-require}"
    
    echo "📝 Updating .env file..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        cp env.example .env
    fi
    
    # Update database configuration
    sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
    if [ -n "$DB_HOST" ]; then
        sed -i.bak "s|DB_HOST=.*|DB_HOST=$DB_HOST|" .env
    fi
    if [ -n "$DB_PORT" ]; then
        sed -i.bak "s|DB_PORT=.*|DB_PORT=$DB_PORT|" .env
    fi
    if [ -n "$DB_NAME" ]; then
        sed -i.bak "s|DB_NAME=.*|DB_NAME=$DB_NAME|" .env
    fi
    if [ -n "$DB_USER" ]; then
        sed -i.bak "s|DB_USER=.*|DB_USER=$DB_USER|" .env
    fi
    if [ -n "$DB_PASSWORD" ]; then
        sed -i.bak "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" .env
    fi
    sed -i.bak "s|DB_SSL_MODE=.*|DB_SSL_MODE=$SSL_MODE|" .env
    
    # Clean up backup file
    rm -f .env.bak
    
    echo "✅ .env file updated"
}

# Test database connection
test_connection() {
    echo "🔍 Testing database connection..."
    
    # Load environment variables
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        echo "❌ DATABASE_URL not found in .env file"
        exit 1
    fi
    
    # Test connection
    if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Database connection successful!"
    else
        echo "❌ Database connection failed!"
        echo "Please check your connection details and try again."
        exit 1
    fi
}

# Run database migrations and seeding
setup_database() {
    echo "🔄 Setting up database schema and data..."
    
    cd backend-go
    
    # Run migrations
    echo "📊 Running database migrations..."
    go run main.go -migrate
    
    # Seed initial data
    echo "🌱 Seeding initial data..."
    go run main.go -seed
    
    cd ..
    
    echo "✅ Database setup complete!"
}

# Main script
main() {
    check_requirements
    show_options
    
    read -p "Choose an option (1-5): " choice
    
    case $choice in
        1)
            setup_neon
            ;;
        2)
            setup_supabase
            ;;
        3)
            setup_railway
            ;;
        4)
            echo "🔧 AWS RDS setup requires manual configuration"
            echo "Please follow the AWS RDS documentation and update your .env file manually"
            exit 0
            ;;
        5)
            setup_manual
            ;;
        *)
            echo "❌ Invalid option"
            exit 1
            ;;
    esac
    
    test_connection
    setup_database
    
    echo ""
    echo "🎉 Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Start the backend: cd backend-go && go run main.go"
    echo "2. Start the frontend: cd frontend && bun run dev"
    echo "3. Access the application at http://localhost:3000"
    echo ""
    echo "Default admin credentials:"
    echo "  Email: admin@niyama.dev"
    echo "  Password: admin123"
}

# Run main function
main "$@"
