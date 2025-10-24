# Niyama Codebase - Complete Issue Report & Fixes

## Overview
This document details all identified issues across the Niyama codebase, categorized by severity and type, with specific fix recommendations.

---

## 🔴 SECURITY ISSUES (Immediate Fix Required)

### Issue #1: Hardcoded JWT Secret
**Severity:** CRITICAL  
**File:** `backend/internal/config/config.go` (line 73)  
**Problem:**
```go
Secret: getEnv("JWT_SECRET", "your_super_secret_jwt_key_here"),
```
**Impact:** Exposes default JWT secret in production if env var not set

**Fix:**
```go
func Load() *Config {
    // ... other config
    JWT: JWTConfig{
        Secret:            getEnvRequired("JWT_SECRET"), // Fail on missing
        AccessExpiration:  getDurationEnv("JWT_EXPIRES_IN", "7d"),
        RefreshExpiration: getDurationEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
    },
}

func getEnvRequired(key string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    if os.Getenv("ENVIRONMENT") == "production" {
        log.Fatalf("❌ Required environment variable not set: %s", key)
    }
    return ""
}
```

---

### Issue #2: Hardcoded Database Credentials
**Severity:** CRITICAL  
**File:** `backend/internal/config/config.go` (lines 61-66)  
**Problem:**
```go
URL:      getEnv("DATABASE_URL", "postgresql://niyama:niyama@localhost:5432/niyama"),
User:     getEnv("DB_USER", "niyama"),
Password: getEnv("DB_PASSWORD", "niyama"),
```
**Impact:** Default credentials exposed if environment variables not configured

**Fix:**
```go
Database: DatabaseConfig{
    URL:      getEnvRequired("DATABASE_URL"),
    Host:     getEnvRequired("DB_HOST"),
    Port:     getIntEnvRequired("DB_PORT"),
    User:     getEnvRequired("DB_USER"),
    Password: getEnvRequired("DB_PASSWORD"),
    Name:     getEnvRequired("DB_NAME"),
    SSLMode:  getEnv("DB_SSL_MODE", "require"), // Default to secure
    MaxConns: getIntEnv("DB_MAX_CONNS", 25),
    MinConns: getIntEnv("DB_MIN_CONNS", 5),
},

func getIntEnvRequired(key string) int {
    value := os.Getenv(key)
    if value == "" {
        if os.Getenv("ENVIRONMENT") == "production" {
            log.Fatalf("❌ Required environment variable not set: %s", key)
        }
        return 0
    }
    intValue, err := strconv.Atoi(value)
    if err != nil {
        log.Fatalf("❌ Invalid integer for %s: %s", key, value)
    }
    return intValue
}
```

---

### Issue #3: Hardcoded Kubernetes Secrets
**Severity:** CRITICAL  
**File:** `infrastructure/kubernetes/backend.yaml` (line 10)  
**Problem:**
```yaml
jwt-secret: dGVzdC1zZWNyZXQta2V5 # base64 encoded "test-secret-key"
```
**Impact:** Secrets exposed in version control

**Fix:**
Create `infrastructure/secrets/.gitignore`:
```
*
!.gitignore
!secrets.example.yaml
```

Create `infrastructure/secrets/secrets.example.yaml`:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: niyama-secrets
  namespace: niyama
type: Opaque
stringData:
  jwt-secret: "REPLACE_WITH_SECURE_KEY"
  gemini-api-key: "REPLACE_WITH_YOUR_KEY"
  database-password: "REPLACE_WITH_SECURE_PASSWORD"
```

Update `infrastructure/kubernetes/backend.yaml`:
```yaml
# Remove hardcoded secrets, use kustomization or sealed-secrets
apiVersion: v1
kind: Secret
metadata:
  name: niyama-secrets
  namespace: niyama
type: Opaque
data:
  jwt-secret: ${JWT_SECRET_BASE64}
  gemini-api-key: ${GEMINI_API_KEY_BASE64}
```

---

### Issue #4: Hardcoded Clerk API Keys with Insecure Fallbacks
**Severity:** HIGH  
**File:** `frontend/src/App.tsx` (lines 30-31)  
**Problem:**
```tsx
const useAuth = !!clerkPubKey && 
                clerkPubKey !== 'pk_test_placeholder' && 
                clerkPubKey !== 'pk_test_your_clerk_publishable_key_here' &&
                clerkPubKey.trim() !== '';
```
**Impact:** Insecure comparison logic; hardcoded placeholder values visible in code

**Fix:**
Create `frontend/src/config/auth.ts`:
```typescript
export interface AuthConfig {
  enabled: boolean;
  clerkPublishableKey: string;
  devMode: boolean;
}

export function getAuthConfig(): AuthConfig {
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isDevelopment = import.meta.env.DEV;
  
  // In production, require valid Clerk key
  if (!isDevelopment && !clerkKey) {
    throw new Error('❌ VITE_CLERK_PUBLISHABLE_KEY is required in production');
  }
  
  const isValidClerkKey = clerkKey && 
                          clerkKey.startsWith('pk_') && 
                          clerkKey.length > 20;
  
  return {
    enabled: isValidClerkKey,
    clerkPublishableKey: clerkKey || '',
    devMode: isDevelopment && !isValidClerkKey,
  };
}
```

Update `frontend/src/App.tsx`:
```tsx
import { getAuthConfig } from './config/auth';

const authConfig = getAuthConfig();

if (authConfig.devMode) {
  console.warn('⚠️  Running in development mode without authentication');
}

function App() {
  if (!authConfig.enabled) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <Layout>
              <Routes>
                {/* Dev mode routes */}
              </Routes>
            </Layout>
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }
  
  // Production mode with Clerk
  return (
    <ClerkProvider publishableKey={authConfig.clerkPublishableKey}>
      {/* Production routes */}
    </ClerkProvider>
  );
}
```

---

## 🟠 ENVIRONMENT CONFIGURATION (High Priority)

### Issue #5: Hardcoded Port Numbers Throughout Infrastructure
**Severity:** HIGH  
**Files:** Multiple
- `frontend/vite.config.ts` (line 14): port 3000
- `frontend/vite.config.ts` (line 17): proxy to localhost:8000
- `docker-compose.yml` (line 11, 46): ports 8000, 3001
- `playwright.config.ts` (line 25): baseURL localhost:3001

**Fix:**
Create `frontend/.env.example`:
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_DEV_PORT=3001
VITE_DEV_HOST=localhost
```

Update `frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: parseInt(process.env.VITE_DEV_PORT || '3001'),
    host: process.env.VITE_DEV_HOST || 'localhost',
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // ... rest of config
});
```

Update `playwright.config.ts`:
```typescript
export default defineConfig({
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3001',
  },
  webServer: {
    command: 'npm run dev',
    url: process.env.PLAYWRIGHT_TEST_FRONTEND_URL || 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
  // ... rest of config
});
```

Update `docker-compose.yml`:
```yaml
services:
  backend:
    environment:
      - PORT=${BACKEND_PORT:-8000}
  frontend:
    environment:
      - VITE_API_URL=http://backend:${BACKEND_PORT:-8000}/api/v1
      - VITE_DEV_PORT=${FRONTEND_PORT:-3001}
    ports:
      - "${FRONTEND_PORT:-3001}:80"
```

---

### Issue #6: Hardcoded API Timeout Values
**Severity:** MEDIUM  
**File:** `frontend/src/services/api.ts` (line 20)  
**Problem:**
```typescript
timeout: 30000,
```

**Fix:**
Create `frontend/src/config/api.ts`:
```typescript
export const API_CONFIG = {
  timeout: parseInt(process.env.VITE_API_TIMEOUT || '30000'),
  retryCount: parseInt(process.env.VITE_API_RETRY_COUNT || '3'),
  retryDelay: parseInt(process.env.VITE_API_RETRY_DELAY || '1000'),
  baseURL: process.env.VITE_API_URL || '/api/v1',
};

export const isProduction = import.meta.env.PROD;
```

Update `frontend/src/services/api.ts`:
```typescript
import { API_CONFIG } from '../config/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // ... rest of initialization
  }
}
```

Update `frontend/.env.example`:
```
VITE_API_TIMEOUT=30000
VITE_API_RETRY_COUNT=3
VITE_API_RETRY_DELAY=1000
```

---

### Issue #7: Hardcoded Retry Logic Configuration
**Severity:** MEDIUM  
**File:** `frontend/src/services/api.ts` (line 39)  
**Problem:**
```typescript
if (config._retryCount >= 3 || !error.response || error.response.status < 500) {
  // hardcoded retry count of 3
}
const delay = Math.pow(2, config._retryCount) * 1000; // hardcoded exponential backoff
```

**Fix:**
Update `frontend/src/config/api.ts`:
```typescript
export const RETRY_CONFIG = {
  maxRetries: parseInt(process.env.VITE_API_RETRY_COUNT || '3'),
  initialDelay: parseInt(process.env.VITE_API_RETRY_DELAY || '1000'),
  backoffMultiplier: parseFloat(process.env.VITE_API_BACKOFF_MULTIPLIER || '2'),
  maxDelay: parseInt(process.env.VITE_API_MAX_DELAY || '30000'),
  retryableStatuses: [408, 429, 500, 502, 503, 504], // Configurable
};
```

Update `frontend/src/services/api.ts`:
```typescript
async (error: AxiosError) => {
  const config = error.config as any;
  
  const shouldRetry = 
    config._retryCount < RETRY_CONFIG.maxRetries &&
    error.response &&
    RETRY_CONFIG.retryableStatuses.includes(error.response.status);
  
  if (!shouldRetry) {
    if (error.response?.status === 401) {
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }

  config._retryCount = (config._retryCount || 0) + 1;
  const exponentialDelay = Math.pow(
    RETRY_CONFIG.backoffMultiplier, 
    config._retryCount
  ) * RETRY_CONFIG.initialDelay;
  const delay = Math.min(exponentialDelay, RETRY_CONFIG.maxDelay);
  
  console.log(`Retrying request (attempt ${config._retryCount}/${RETRY_CONFIG.maxRetries}) after ${delay}ms`);
  
  await new Promise(resolve => setTimeout(resolve, delay));
  return this.api(config);
}
```

---

### Issue #8: Missing Environment Validation
**Severity:** HIGH  
**File:** `backend/internal/config/config.go`  
**Problem:** No validation that required environment variables are set in production

**Fix:**
Create `backend/internal/config/validation.go`:
```go
package config

import (
	"fmt"
	"log"
	"os"
	"strings"
)

type ConfigValidator struct {
	config      *Config
	environment string
}

func NewValidator(cfg *Config) *ConfigValidator {
	return &ConfigValidator{
		config:      cfg,
		environment: cfg.Environment,
	}
}

func (v *ConfigValidator) Validate() error {
	if v.environment == "production" {
		return v.validateProduction()
	} else if v.environment == "staging" {
		return v.validateStaging()
	}
	return nil
}

func (v *ConfigValidator) validateProduction() error {
	errors := []string{}

	// Required in production
	if v.config.JWT.Secret == "" || v.config.JWT.Secret == "your_super_secret_jwt_key_here" {
		errors = append(errors, "JWT_SECRET must be set to a secure value in production")
	}

	if v.config.Database.Password == "" || v.config.Database.Password == "niyama" {
		errors = append(errors, "DB_PASSWORD must be set to a secure value in production")
	}

	if v.config.Database.SSLMode != "require" {
		errors = append(errors, "DB_SSL_MODE must be 'require' in production")
	}

	if v.config.AI.GeminiAPIKey == "" {
		errors = append(errors, "GEMINI_API_KEY must be set in production")
	}

	if len(errors) > 0 {
		return fmt.Errorf("production environment validation failed:\n- %s", strings.Join(errors, "\n- "))
	}

	return nil
}

func (v *ConfigValidator) validateStaging() error {
	// Staging rules can be less strict than production
	if v.config.Database.SSLMode == "" {
		log.Println("⚠️  Warning: DB_SSL_MODE not set in staging")
	}
	return nil
}
```

Update `backend/cmd/server/main.go`:
```go
func main() {
	// ... existing code ...
	
	cfg := config.Load()
	
	// Validate configuration
	validator := config.NewValidator(cfg)
	if err := validator.Validate(); err != nil {
		log.Fatalf("❌ Configuration validation failed: %v", err)
	}
	
	// ... rest of initialization ...
}
```

---

## 🟡 DEVELOPMENT QUALITY (Medium Priority)

### Issue #9: Console.log Statements Exposing Sensitive Information
**Severity:** MEDIUM  
**File:** `frontend/src/App.tsx` (lines 34-38)  
**Problem:**
```tsx
console.log('🔧 Clerk key:', clerkPubKey);
console.log('🔧 Use auth:', useAuth);
if (!useAuth) {
  console.log('🔓 Running in development mode without authentication');
}
```
**Impact:** Sensitive info exposed in browser console

**Fix:**
Create `frontend/src/utils/logger.ts`:
```typescript
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN;
  }

  error(message: string, ...args: any[]) {
    console.error(`❌ ${message}`, ...args);
  }

  warn(message: string, ...args: any[]) {
    if (this.level >= LogLevel.WARN) {
      console.warn(`⚠️  ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.level >= LogLevel.INFO) {
      console.info(`ℹ️  ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(`🔧 ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
```

Update `frontend/src/App.tsx`:
```tsx
import { logger } from './utils/logger';
import { getAuthConfig } from './config/auth';

const authConfig = getAuthConfig();

if (authConfig.devMode) {
  logger.warn('Running in development mode without authentication');
}

// Remove direct console.log statements
// Use logger instead
```

Update `frontend/src/services/api.ts`:
```typescript
// Replace console.error with logger
// Replace console.log with logger.debug
import { logger } from '../utils/logger';

async (error: AxiosError) => {
  // ... code ...
  logger.debug(`Retrying request (attempt ${config._retryCount}/${RETRY_CONFIG.maxRetries})`);
  // ... rest
}
```

---

### Issue #10: Improper Error Handling with log.Fatal
**Severity:** HIGH  
**File:** `backend/cmd/server/main.go` (lines 41, 56, 65, 68, 98)  
**Problem:**
```go
log.Fatal("Database connection required for migration/seeding")
log.Fatalf("❌ Database seeding failed: %v", err)
```
**Impact:** Abrupt process termination without cleanup; poor error reporting

**Fix:**
Create `backend/internal/utils/errors.go`:
```go
package utils

import (
	"fmt"
	"os"
)

type ExitError struct {
	Code    int
	Message string
	Err     error
}

func (e *ExitError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

func ExitWithError(code int, message string, err error) {
	fmt.Fprintf(os.Stderr, "❌ %s\n", message)
	if err != nil {
		fmt.Fprintf(os.Stderr, "   Details: %v\n", err)
	}
	os.Exit(code)
}

func ExitWithSuccess(message string) {
	fmt.Printf("✓ %s\n", message)
	os.Exit(0)
}
```

Update `backend/cmd/server/main.go`:
```go
package main

import (
	"log"
	"os"
	"path/filepath"

	"niyama-backend/internal/cache"
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/handlers"
	"niyama-backend/internal/middleware"
	"niyama-backend/internal/services"
	"niyama-backend/internal/utils"
	"niyama-backend/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Parse command line flags
	var (
		migrate = flag.Bool("migrate", false, "Run database migrations")
		seed    = flag.Bool("seed", false, "Seed database with initial data")
		env     = flag.String("env", "development", "Environment (development, staging, production)")
	)
	flag.Parse()

	// Load environment-specific configuration
	loadEnvironmentConfig(*env)

	// Load configuration
	cfg := config.Load()

	// Validate configuration
	validator := config.NewValidator(cfg)
	if err := validator.Validate(); err != nil {
		utils.ExitWithError(1, "Configuration validation failed", err)
	}

	// Initialize database connections
	db, err := database.Initialize(cfg)
	if err != nil {
		log.Printf("⚠️  Database connection failed: %v", err)
		if *migrate || *seed {
			utils.ExitWithError(1, "Database connection required for migration/seeding", err)
		}
		log.Println("Running in development mode without database")
		db = nil
	}

	// Handle migrations
	if *migrate {
		if db == nil {
			utils.ExitWithError(1, "Cannot run migrations without database connection", nil)
		}
		if err := database.RunMigrations(db); err != nil {
			utils.ExitWithError(1, "Database migration failed", err)
		}
		utils.ExitWithSuccess("Database migrations completed successfully")
	}

	// Handle seeding
	if *seed {
		if db == nil {
			utils.ExitWithError(1, "Cannot seed database without connection", nil)
		}
		if err := database.SeedDatabase(db); err != nil {
			utils.ExitWithError(1, "Database seeding failed", err)
		}
		utils.ExitWithSuccess("Database seeded successfully")
	}

	// Initialize cache
	_, err = cache.NewCache(cfg.Redis.URL)
	if err != nil {
		log.Printf("⚠️  Cache initialization failed: %v", err)
		// Continue - cache is optional
	}

	// ... rest of initialization ...

	// Start server
	if err := router.Run(":" + cfg.Port); err != nil {
		utils.ExitWithError(1, "Failed to start server", err)
	}
}
```

---

## 🔵 FUNCTIONALITY ISSUES (Basic Features Missing/Incomplete)

### Issue #11: Template Management - TODO Endpoints
**Severity:** HIGH  
**File:** `backend/internal/handlers/template.go` (lines 62-71)  
**Problem:**
```go
func (h *TemplateHandler) CreateTemplate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Create template - TODO"})
}

func (h *TemplateHandler) UpdateTemplate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Update template - TODO"})
}

func (h *TemplateHandler) DeleteTemplate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Delete template - TODO"})
}
```

**Fix:**
First, create template model if not exists. Update `backend/internal/handlers/template.go`:
```go
func (h *TemplateHandler) CreateTemplate(c *gin.Context) {
	var template models.PolicyTemplate
	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate required fields
	if template.Name == "" || template.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name and content are required"})
		return
	}

	created, err := h.service.CreateTemplate(&template)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create template"})
		return
	}

	c.JSON(http.StatusCreated, created)
}

func (h *TemplateHandler) UpdateTemplate(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	var template models.PolicyTemplate
	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	updated, err := h.service.UpdateTemplate(id, &template)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update template"})
		return
	}

	c.JSON(http.StatusOK, updated)
}

func (h *TemplateHandler) DeleteTemplate(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}

	if err := h.service.DeleteTemplate(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete template"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Template deleted successfully"})
}
```

---

### Issue #12: Compliance Framework - TODO Endpoints
**Severity:** HIGH  
**File:** `backend/internal/handlers/compliance.go` (lines 20-32)  
**Problem:**
```go
func (h *ComplianceHandler) GetFrameworks(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get frameworks - TODO"})
}

func (h *ComplianceHandler) GetFramework(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get framework - TODO"})
}

func (h *ComplianceHandler) GetReports(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get reports - TODO"})
}

func (h *ComplianceHandler) GenerateReport(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Generate report - TODO"})
}
```

**Fix:** Similar to template handlers - implement proper CRUD operations with validation

---

### Issue #13: RBAC Missing Database Implementation
**Severity:** HIGH  
**File:** `backend/internal/middleware/rbac.go` (lines 105, 113)  
**Problem:**
```go
// TODO: Implement database query for organization permissions
return false

// TODO: Implement database query for organization roles
return false
```

**Fix:**
Create `backend/internal/services/rbac.go`:
```go
package services

import (
	"niyama-backend/internal/models"

	"gorm.io/gorm"
)

type RBACService struct {
	db *gorm.DB
}

func NewRBACService(db *gorm.DB) *RBACService {
	return &RBACService{db: db}
}

func (s *RBACService) UserHasPermissionInOrg(userID, orgID uint, permission models.Permission) bool {
	// Query user's role in organization
	var userOrgRole models.UserOrganizationRole
	result := s.db.Where("user_id = ? AND organization_id = ?", userID, orgID).
		First(&userOrgRole)

	if result.Error != nil {
		return false
	}

	// Check if role has permission
	permissions := getRolePermissions(userOrgRole.Role)
	for _, p := range permissions {
		if p == permission {
			return true
		}
	}
	return false
}

func (s *RBACService) UserHasRoleInOrg(userID, orgID uint, role models.Role) bool {
	var userOrgRole models.UserOrganizationRole
	result := s.db.Where("user_id = ? AND organization_id = ? AND role = ?", userID, orgID, role).
		First(&userOrgRole)

	return result.Error == nil
}

func getRolePermissions(role models.Role) []models.Permission {
	// Define permissions for each role
	permissionMap := map[models.Role][]models.Permission{
		models.RoleAdmin: {
			models.PermissionRead, models.PermissionWrite, 
			models.PermissionDelete, models.PermissionManageUsers,
		},
		models.RoleDeveloper: {
			models.PermissionRead, models.PermissionWrite,
		},
		models.RoleViewer: {
			models.PermissionRead,
		},
	}
	
	if perms, exists := permissionMap[role]; exists {
		return perms
	}
	return []models.Permission{}
}
```

Update `backend/internal/middleware/rbac.go`:
```go
package middleware

import (
	"net/http"
	"strconv"

	"niyama-backend/internal/models"
	"niyama-backend/internal/services"

	"github.com/gin-gonic/gin"
)

var rbacService *services.RBACService

func InitRBACMiddleware(service *services.RBACService) {
	rbacService = service
}

// ... rest of middleware ...

func hasOrgPermission(userID, orgID uint, permission models.Permission) bool {
	if rbacService == nil {
		return false
	}
	return rbacService.UserHasPermissionInOrg(userID, orgID, permission)
}

func hasOrgRole(userID, orgID uint, role models.Role) bool {
	if rbacService == nil {
		return false
	}
	return rbacService.UserHasRoleInOrg(userID, orgID, role)
}
```

---

### Issue #14: Missing Rate Limiting Implementation
**Severity:** MEDIUM  
**File:** `backend/internal/middleware/security.go` (line 9)  
**Problem:**
```go
func RateLimit() gin.HandlerFunc {
	// Simple rate limiting implementation
	// TODO: Implement proper rate limiting
	return func(c *gin.Context) {
		c.Next()
	}
}
```

**Fix:**
Create `backend/internal/middleware/rate_limit.go`:
```go
package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type RateLimiter struct {
	requestsPerMinute int
	mu                sync.RWMutex
	clients           map[string]*ClientRateLimit
}

type ClientRateLimit struct {
	requests  []time.Time
	lastReset time.Time
}

func NewRateLimiter(requestsPerMinute int) *RateLimiter {
	limiter := &RateLimiter{
		requestsPerMinute: requestsPerMinute,
		clients:           make(map[string]*ClientRateLimit),
	}

	// Cleanup old entries every 10 minutes
	go func() {
		ticker := time.NewTicker(10 * time.Minute)
		defer ticker.Stop()

		for range ticker.C {
			limiter.cleanup()
		}
	}()

	return limiter
}

func (rl *RateLimiter) Allow(clientID string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	client, exists := rl.clients[clientID]

	if !exists {
		rl.clients[clientID] = &ClientRateLimit{
			requests:  []time.Time{now},
			lastReset: now,
		}
		return true
	}

	// Reset if more than a minute has passed
	if now.Sub(client.lastReset) > time.Minute {
		client.requests = []time.Time{now}
		client.lastReset = now
		return true
	}

	// Check request count
	if len(client.requests) < rl.requestsPerMinute {
		client.requests = append(client.requests, now)
		return true
	}

	return false
}

func (rl *RateLimiter) cleanup() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	for clientID, client := range rl.clients {
		if now.Sub(client.lastReset) > 2*time.Minute {
			delete(rl.clients, clientID)
		}
	}
}

// Middleware function
func RateLimitMiddleware(requestsPerMinute int) gin.HandlerFunc {
	limiter := NewRateLimiter(requestsPerMinute)

	return func(c *gin.Context) {
		clientIP := c.ClientIP()

		if !limiter.Allow(clientIP) {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Rate limit exceeded. Maximum " + fmt.Sprintf("%d", requestsPerMinute) + " requests per minute",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
```

---

### Issue #15: Frontend - Hardcoded API URLs in Fetch Calls
**Severity:** HIGH  
**File:** `frontend/src/pages/PolicyEditor.tsx` (lines 65, 111)  
**Problem:**
```tsx
const response = await fetch('http://localhost:8000/api/v1/policies/save', {

const response = await fetch('http://localhost:8000/api/v1/policies/test', {
```

**Fix:**
Create `frontend/src/constants/endpoints.ts`:
```typescript
export const API_ENDPOINTS = {
  POLICIES: {
    SAVE: '/policies/save',
    TEST: '/policies/test',
    LIST: '/policies',
    GET: (id: string) => `/policies/${id}`,
    UPDATE: (id: string) => `/policies/${id}`,
    DELETE: (id: string) => `/policies/${id}`,
  },
  TEMPLATES: {
    LIST: '/templates',
    GET: (id: string) => `/templates/${id}`,
  },
  COMPLIANCE: {
    FRAMEWORKS: '/compliance/frameworks',
    REPORTS: '/compliance/reports',
  },
};
```

Update `frontend/src/pages/PolicyEditor.tsx`:
```tsx
import { API_ENDPOINTS } from '../constants/endpoints';
import { API_CONFIG } from '../config/api';

const handleSavePolicy = async () => {
  // ... validation ...
  
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.POLICIES.SAVE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // ... body ...
    }),
  });
};

const handleTestPolicy = async () => {
  // ... validation ...
  
  const response = await fetch(`${API_CONFIG.baseURL}${API_ENDPOINTS.POLICIES.TEST}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // ... body ...
    }),
  });
};
```

---

### Issue #16: Frontend - Using alert() Instead of Toast Notifications
**Severity:** MEDIUM  
**File:** `frontend/src/pages/PolicyEditor.tsx` (line 48)  
**Problem:**
```tsx
alert('Please enter a policy name');
alert('Please enter policy code');
```
**File:** `frontend/src/pages/Scheduler.tsx` (line 155)  
**Problem:**
```tsx
alert(`Scan triggered successfully! Scan ID: ${result.scan_id}`);
```

**Fix:**
Replace all `alert()` calls with toast notifications:
```tsx
import toast from 'react-hot-toast';

// Replace:
// alert('Please enter a policy name');
// With:
toast.error('Please enter a policy name');

// Replace:
// alert(`Scan triggered successfully! Scan ID: ${result.scan_id}`);
// With:
toast.success(`Scan triggered successfully! Scan ID: ${result.scan_id}`);
```

---

### Issue #17: Frontend - Mock Data and Placeholder Values
**Severity:** MEDIUM  
**File:** `frontend/src/components/PolicyEditor/PolicyEditor.tsx` (lines 71, 208, 220)  
**Problem:**
```tsx
// Mock policy metadata - in real app, fetch from API
const mockValidation: ValidationResult = {
  // mock data
};
setValidation(mockValidation);
```

**Fix:**
Create proper API calls or use React Query:
```tsx
import { useQuery, useMutation } from 'react-query';
import { apiService } from '../services/api';

export const PolicyEditor: React.FC = () => {
  // Fetch policy validation from API
  const { data: validation, isLoading: validationLoading } = useQuery(
    ['validatePolicy', policyCode],
    () => apiService.validatePolicy(policyCode),
    { enabled: policyCode.length > 0, staleTime: 5000 }
  );

  const { mutate: testPolicy, isLoading: testing } = useMutation(
    (testData: any) => apiService.testPolicy(policyId, testData),
    {
      onSuccess: (result) => {
        setTestResult(result);
        toast.success('Policy test completed');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to test policy');
      },
    }
  );

  // ... rest of component
};
```

---

### Issue #18: Frontend - Inconsistent Error Handling in Components
**Severity:** MEDIUM  
**File:** `frontend/src/pages/Settings.tsx` (line 59)  
**Problem:**
```tsx
<input className="input" defaultValue="john.doe@company.com" />
```
No error state handling or validation feedback

**Fix:**
Create reusable form component with error handling:
```tsx
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  value,
  onChange,
  type = 'text',
}) => {
  return (
    <div>
      <label className="form-label">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`input ${error ? 'border-red-500' : ''}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};
```

---

### Issue #19: Lighthouse Configuration - Hardcoded Port
**Severity:** LOW  
**File:** `lighthouserc.js` (line 4)  
**Problem:**
```javascript
url: ['http://localhost:3003'],
```

**Fix:**
```javascript
module.exports = {
  ci: {
    collect: {
      url: [process.env.LIGHTHOUSE_URL || 'http://localhost:3001'],
      numberOfRuns: parseInt(process.env.LIGHTHOUSE_RUNS || '3'),
      settings: {
        chromeFlags: '--no-sandbox --disable-setuid-sandbox',
      },
    },
    // ... rest
  },
};
```

---

### Issue #20: Missing Input Validation and Sanitization
**Severity:** MEDIUM  
**File:** Multiple files  
**Problem:** No consistent input validation across API endpoints and frontend forms

**Fix:**
Create validation middleware for Go backend:
```go
package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func ValidateInput() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Validate content type for POST/PUT requests
		if c.Request.Method == http.MethodPost || c.Request.Method == http.MethodPut {
			contentType := c.Request.Header.Get("Content-Type")
			if !strings.Contains(contentType, "application/json") {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Content-Type must be application/json",
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}
```

Create validation utilities for frontend:
```typescript
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 10000); // Limit length
}

export function validatePolicyName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Policy name is required' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'Policy name must be less than 100 characters' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return { valid: false, error: 'Policy name can only contain alphanumeric characters, hyphens, and underscores' };
  }
  return { valid: true };
}
```

---

## Summary Table

| Issue # | Category | Severity | Component | Status |
|---------|----------|----------|-----------|--------|
| 1 | Security | CRITICAL | Backend Config | Open |
| 2 | Security | CRITICAL | Backend Config | Open |
| 3 | Security | CRITICAL | K8s Manifests | Open |
| 4 | Security | HIGH | Frontend Auth | Open |
| 5 | Configuration | HIGH | Multi-file | Open |
| 6 | Configuration | MEDIUM | Frontend API | Open |
| 7 | Configuration | MEDIUM | Frontend API | Open |
| 8 | Configuration | HIGH | Backend Config | Open |
| 9 | Quality | MEDIUM | Frontend | Open |
| 10 | Quality | HIGH | Backend | Open |
| 11 | Functionality | HIGH | Backend API | Open |
| 12 | Functionality | HIGH | Backend API | Open |
| 13 | Functionality | HIGH | Backend RBAC | Open |
| 14 | Functionality | MEDIUM | Backend Security | Open |
| 15 | Functionality | HIGH | Frontend Pages | Open |
| 16 | Functionality | MEDIUM | Frontend Pages | Open |
| 17 | Functionality | MEDIUM | Frontend Components | Open |
| 18 | Functionality | MEDIUM | Frontend Pages | Open |
| 19 | Configuration | LOW | Testing | Open |
| 20 | Functionality | MEDIUM | API & Frontend | Open |

---

## Implementation Priority

### Phase 1 (CRITICAL - Do First)
- Issues #1, #2, #3, #4 (Security)
- Issues #8, #10 (Configuration & Error Handling)

### Phase 2 (HIGH - Do Next)
- Issues #5, #13, #14, #15 (Configuration & Functionality)
- Issue #11, #12 (Missing CRUD)

### Phase 3 (MEDIUM - Next Sprint)
- Issues #6, #7, #9 (Configuration & Quality)
- Issues #16, #17, #18, #20 (Frontend Functionality)

### Phase 4 (LOW - Polish)
- Issue #19 (Testing Configuration)
