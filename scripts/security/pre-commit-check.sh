#!/bin/bash

# Pre-commit security check for Niyama
# This script checks for secrets and sensitive data before committing

echo "🔒 Running Niyama security pre-commit check..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check for real API keys and secrets
echo "🔍 Checking for exposed secrets..."

# Check for Clerk keys
# Check for real API keys (exclude common placeholder patterns)
if grep -r "pk_test_[A-Za-z0-9]" --exclude-dir=node_modules --exclude="*.md" --exclude="*.example" . 2>/dev/null | grep -v "placeholder\|your.*key\|test.*key\|example" | grep -q .; then
    echo -e "${RED}❌ Found real Clerk publishable keys! These should not be committed.${NC}"
    ERRORS=$((ERRORS + 1))
fi

if grep -r "sk_test_[A-Za-z0-9]" --exclude-dir=node_modules --exclude="*.md" --exclude="*.example" . 2>/dev/null | grep -v "placeholder\|your.*key\|test.*key\|example" | grep -q .; then
    echo -e "${RED}❌ Found real Clerk secret keys! These should NEVER be committed.${NC}"
    ERRORS=$((ERRORS + 1))
fi

if grep -r "whsec_[A-Za-z0-9]" --exclude-dir=node_modules --exclude="*.md" --exclude="*.example" . 2>/dev/null | grep -v "placeholder\|your.*secret\|test.*secret\|example" | grep -q .; then
    echo -e "${RED}❌ Found real Clerk webhook secrets! These should NEVER be committed.${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check for other API keys
if grep -r "AIza[A-Za-z0-9]" --exclude-dir=node_modules --exclude="*.md" --exclude="*.example" . 2>/dev/null; then
    echo -e "${RED}❌ Found Google API keys! These should not be committed.${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check for database passwords
if grep -r "password.*=" --exclude-dir=node_modules --exclude="*.md" --exclude="*.example" . | grep -v "your-password" | grep -v "placeholder" 2>/dev/null; then
    echo -e "${YELLOW}⚠️ Found potential database passwords. Please verify these are not real credentials.${NC}"
fi

# Check for .env files with real data
if [ -f "frontend/.env" ]; then
    if grep "pk_test_[A-Za-z0-9]" frontend/.env 2>/dev/null | grep -v "placeholder\|your.*key\|test.*key\|example" | grep -q .; then
        echo -e "${RED}❌ frontend/.env contains real Clerk keys!${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi

if [ -f "backend/.env" ]; then
    if grep "sk_test_[A-Za-z0-9]" backend/.env 2>/dev/null | grep -v "placeholder\|your.*key\|test.*key\|example" | grep -q .; then
        echo -e "${RED}❌ backend/.env contains real Clerk keys!${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check .gitignore coverage
echo "🛡️ Checking .gitignore coverage..."

if ! grep -q "frontend/\.env" .gitignore; then
    echo -e "${YELLOW}⚠️ frontend/.env not in .gitignore${NC}"
fi

if ! grep -q "backend/\.env" .gitignore; then
    echo -e "${YELLOW}⚠️ backend/.env not in .gitignore${NC}"
fi

# Check for hardcoded secrets in code
echo "🔍 Checking for hardcoded secrets in source code..."

# Check TypeScript/JavaScript files
if find frontend/src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "pk_test_\|sk_test_\|whsec_" 2>/dev/null | xargs grep "pk_test_\|sk_test_\|whsec_" | grep -v "placeholder\|your.*key\|test.*key\|example" | grep -q .; then
    echo -e "${RED}❌ Found hardcoded secrets in source code!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check Go files
if find backend -name "*.go" | xargs grep -l "pk_test_\|sk_test_\|whsec_" 2>/dev/null | xargs grep "pk_test_\|sk_test_\|whsec_" | grep -v "placeholder\|your.*key\|test.*key\|example" | grep -q .; then
    echo -e "${RED}❌ Found hardcoded secrets in Go code!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Final result
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Security check passed! No secrets detected.${NC}"
    echo -e "${GREEN}🚀 Safe to commit to GitHub.${NC}"
    exit 0
else
    echo -e "${RED}❌ Security check failed! Found $ERRORS security issues.${NC}"
    echo -e "${RED}🛑 DO NOT commit until these issues are resolved.${NC}"
    echo ""
    echo "To fix:"
    echo "1. Remove real API keys from code and config files"
    echo "2. Use .env.example files with placeholder values"
    echo "3. Ensure .env files are in .gitignore"
    echo "4. Use environment variables for real secrets"
    exit 1
fi