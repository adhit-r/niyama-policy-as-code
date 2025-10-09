#!/bin/bash

# Database Setup Script for Niyama
# This script sets up the database with initial data

set -e

echo "🚀 Setting up Niyama Database..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-niyama}
DB_USER=${DB_USER:-niyama}
DB_PASSWORD=${DB_PASSWORD:-niyama}

echo "📊 Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Test database connection
echo "🔍 Testing database connection..."
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; then
    echo "❌ Database connection failed!"
    echo "Please ensure PostgreSQL is running and accessible."
    exit 1
fi

echo "✅ Database connection successful!"

# Create database if it doesn't exist
echo "📝 Creating database if it doesn't exist..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database already exists"

# Run migrations
echo "🔄 Running database migrations..."
go run main.go migrate

# Seed initial data
echo "🌱 Seeding initial data..."
go run main.go seed

echo "✅ Database setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Update your .env file with the database credentials"
echo "  2. Start the backend server: go run main.go"
echo "  3. Test the API endpoints"

