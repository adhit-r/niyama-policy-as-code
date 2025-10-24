# Issue Fix Implementation Checklist

## 🔴 Phase 1: CRITICAL SECURITY FIXES (Week 1)

### Issue #1: Hardcoded JWT Secret
- [ ] Create `getEnvRequired()` function in config
- [ ] Update config to use `getEnvRequired()` for JWT_SECRET
- [ ] Add validation that JWT_SECRET is not default value
- [ ] Document required env var in `.env.example`
- [ ] Add error message if JWT_SECRET not set in production
- [ ] Test with missing JWT_SECRET in production mode
- [ ] Update deployment docs

**Affected Files:**
- `backend/internal/config/config.go`
- `backend/.env.example`
- Deployment documentation

**Testing:**
```bash
# Test 1: Missing JWT_SECRET in production
ENVIRONMENT=production go run cmd/server/main.go
# Expected: Exit with error message

# Test 2: With JWT_SECRET set
JWT_SECRET=my-secure-key ENVIRONMENT=production go run cmd/server/main.go
# Expected: Server starts normally
```

---

### Issue #2: Hardcoded DB Credentials
- [ ] Create `getEnvRequired()` and `getIntEnvRequired()` functions
- [ ] Update all database config fields to be required
- [ ] Set DB_SSL_MODE default to 'require' in production
- [ ] Create proper `.env.example` with all required vars
- [ ] Add validation module for config
- [ ] Test database connection with invalid credentials
- [ ] Document all required DB env vars
- [ ] Update docker-compose.yml to show examples

**Affected Files:**
- `backend/internal/config/config.go`
- `backend/internal/config/validation.go` (new)
- `backend/.env.example`
- `docker-compose.yml`

**Testing:**
```bash
# Test 1: Missing DB_PASSWORD in production
ENVIRONMENT=production go run cmd/server/main.go
# Expected: Exit with error about missing DB_PASSWORD

# Test 2: With all required vars
DB_HOST=localhost DB_PORT=5432 DB_USER=admin DB_PASSWORD=secure DB_NAME=niyama \
  ENVIRONMENT=production go run cmd/server/main.go
# Expected: Server starts and connects to DB
```

---

### Issue #3: Hardcoded K8s Secrets
- [ ] Create `.gitignore` in `infrastructure/secrets/`
- [ ] Create `secrets.example.yaml` template
- [ ] Remove hardcoded secrets from `backend.yaml`
- [ ] Remove hardcoded secrets from `postgres.yaml`
- [ ] Remove hardcoded secrets from `monitoring.yaml`
- [ ] Document secret management strategy
- [ ] Add pre-commit hook to prevent secrets in K8s files
- [ ] Update deployment guide with secret management

**Affected Files:**
- `infrastructure/kubernetes/backend.yaml`
- `infrastructure/kubernetes/postgres.yaml`
- `infrastructure/kubernetes/monitoring.yaml`
- `infrastructure/secrets/.gitignore` (new)
- `infrastructure/secrets/secrets.example.yaml` (new)

**Testing:**
```bash
# Test 1: Verify no base64 secrets in YAML
grep -r "base64 encoded" infrastructure/kubernetes/
# Expected: No matches

# Test 2: Verify .gitignore works
cd infrastructure/secrets
echo "test-secret" > test-secret.yaml
git add test-secret.yaml
# Expected: Rejected by .gitignore
```

---

### Issue #4: Insecure Clerk Key Validation
- [ ] Create `frontend/src/config/auth.ts`
- [ ] Implement proper key validation logic
- [ ] Update `frontend/src/App.tsx` to use new config
- [ ] Remove hardcoded placeholder comparisons
- [ ] Add unit tests for auth config
- [ ] Update `.env.example` with Clerk key info
- [ ] Document Clerk setup process
- [ ] Test with missing key in development
- [ ] Test with invalid key format
- [ ] Test with valid key

**Affected Files:**
- `frontend/src/config/auth.ts` (new)
- `frontend/src/App.tsx`
- `frontend/.env.example`
- Documentation

**Testing:**
```bash
# Test 1: Development without Clerk key
VITE_CLERK_PUBLISHABLE_KEY="" npm run dev
# Expected: App loads in dev mode

# Test 2: Invalid Clerk key format
VITE_CLERK_PUBLISHABLE_KEY="invalid-key" npm run dev
# Expected: Warnings, app loads in dev mode

# Test 3: Valid Clerk key
VITE_CLERK_PUBLISHABLE_KEY="pk_test_abc123..." npm run dev
# Expected: Clerk auth enabled
```

---

### Issue #8: Missing Config Validation
- [ ] Create `backend/internal/config/validation.go`
- [ ] Implement `ConfigValidator` struct
- [ ] Add production environment checks
- [ ] Add staging environment checks
- [ ] Add validation for required fields
- [ ] Update `main.go` to call validator
- [ ] Add unit tests for validator
- [ ] Document configuration requirements

**Affected Files:**
- `backend/internal/config/validation.go` (new)
- `backend/cmd/server/main.go`

**Testing:**
```bash
# Test 1: Production with missing JWT secret
JWT_SECRET="" ENVIRONMENT=production go run cmd/server/main.go
# Expected: Validation error

# Test 2: Production with insecure DB SSL
DB_SSL_MODE=disable ENVIRONMENT=production go run cmd/server/main.go
# Expected: Validation error

# Test 3: Development mode (should pass with defaults)
ENVIRONMENT=development go run cmd/server/main.go
# Expected: May warn but continues
```

---

## 🟠 Phase 2: HIGH PRIORITY FIXES (Week 2)

### Issue #10: Error Handling with log.Fatal
- [ ] Create `backend/internal/utils/errors.go`
- [ ] Implement `ExitWithError()` function
- [ ] Replace all `log.Fatal()` calls
- [ ] Add proper cleanup on exit
- [ ] Update error messages for clarity
- [ ] Add exit code mapping
- [ ] Test graceful shutdown

**Affected Files:**
- `backend/internal/utils/errors.go` (new)
- `backend/cmd/server/main.go`
- All handlers that currently use `log.Fatal()`

**Testing:**
```bash
# Test 1: Migration failure
go run cmd/server/main.go -migrate
# Expected: Proper error message, exit code 1

# Test 2: Normal operation
go run cmd/server/main.go
# Expected: Graceful exit on interrupt
```

---

### Issue #11: Template CRUD - TODO Endpoints
- [ ] Implement `CreateTemplate()` handler
- [ ] Implement `UpdateTemplate()` handler
- [ ] Implement `DeleteTemplate()` handler
- [ ] Add input validation
- [ ] Create template service methods
- [ ] Add database operations
- [ ] Add error handling
- [ ] Write unit tests
- [ ] Test API endpoints

**Affected Files:**
- `backend/internal/handlers/template.go`
- `backend/internal/services/template.go`
- `backend/internal/models/template.go`

**API Testing:**
```bash
# Test 1: Create template
curl -X POST http://localhost:8000/api/v1/templates \
  -H "Content-Type: application/json" \
  -d '{"name":"test","content":"package main","language":"rego"}'
# Expected: 201 with created template

# Test 2: Update template
curl -X PUT http://localhost:8000/api/v1/templates/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"updated"}'
# Expected: 200 with updated template

# Test 3: Delete template
curl -X DELETE http://localhost:8000/api/v1/templates/1
# Expected: 200 with success message
```

---

### Issue #12: Compliance CRUD - TODO Endpoints
- [ ] Implement `GetFrameworks()` handler
- [ ] Implement `GetFramework()` handler
- [ ] Implement `GetReports()` handler
- [ ] Implement `GenerateReport()` handler
- [ ] Add compliance service methods
- [ ] Add database queries
- [ ] Add input validation
- [ ] Add error handling
- [ ] Write unit tests
- [ ] Test API endpoints

**Affected Files:**
- `backend/internal/handlers/compliance.go`
- `backend/internal/services/compliance.go`
- `backend/internal/models/compliance.go`

---

### Issue #13: RBAC DB Queries - TODO
- [ ] Create `backend/internal/services/rbac.go`
- [ ] Implement `UserHasPermissionInOrg()`
- [ ] Implement `UserHasRoleInOrg()`
- [ ] Add permission mapping
- [ ] Update RBAC middleware to use service
- [ ] Create database models for org roles
- [ ] Add migration for org role tables
- [ ] Write unit tests
- [ ] Test RBAC enforcement

**Affected Files:**
- `backend/internal/services/rbac.go` (new)
- `backend/internal/middleware/rbac.go`
- `backend/internal/models/organization.go`
- `backend/migrations/` (new migration)

---

### Issue #15: Hardcoded API URLs
- [ ] Create `frontend/src/constants/endpoints.ts`
- [ ] Create `frontend/src/config/api.ts`
- [ ] Update all API calls to use centralized config
- [ ] Replace all hardcoded URLs
- [ ] Update `.env.example`
- [ ] Test with different API endpoints
- [ ] Verify proxy in dev mode works

**Affected Files:**
- `frontend/src/constants/endpoints.ts` (new)
- `frontend/src/config/api.ts`
- `frontend/src/pages/PolicyEditor.tsx`
- `frontend/src/services/api.ts`
- `frontend/.env.example`

**Testing:**
```bash
# Test 1: Change API endpoint
VITE_API_URL=http://api.staging.example.com npm run dev
# Expected: All requests go to staging

# Test 2: Default endpoint
npm run dev
# Expected: Uses localhost:8000
```

---

## 🟡 Phase 3: MEDIUM PRIORITY FIXES (Week 3)

### Issue #5: Hardcoded Port Numbers
- [ ] Create environment variable system for ports
- [ ] Update `frontend/vite.config.ts`
- [ ] Update `docker-compose.yml`
- [ ] Update `playwright.config.ts`
- [ ] Create `.env.example` with port vars
- [ ] Test with custom ports
- [ ] Update documentation

**Affected Files:**
- `frontend/vite.config.ts`
- `docker-compose.yml`
- `playwright.config.ts`
- `frontend/.env.example`
- `backend/.env.example`

**Testing:**
```bash
# Test 1: Custom ports
FRONTEND_PORT=4000 BACKEND_PORT=9000 docker-compose up
# Expected: Frontend on 4000, Backend on 9000

# Test 2: Frontend dev with custom port
VITE_DEV_PORT=3002 npm run dev
# Expected: Starts on port 3002
```

---

### Issue #6: Hardcoded API Timeout
- [ ] Add timeout configuration to API config
- [ ] Create `frontend/src/config/api.ts`
- [ ] Update `.env.example`
- [ ] Update API service to use config
- [ ] Test with custom timeout values
- [ ] Document timeout configuration

**Affected Files:**
- `frontend/src/config/api.ts`
- `frontend/src/services/api.ts`
- `frontend/.env.example`

---

### Issue #7: Hardcoded Retry Logic
- [ ] Create retry configuration
- [ ] Make retry count configurable
- [ ] Make backoff multiplier configurable
- [ ] Make max delay configurable
- [ ] Update `.env.example`
- [ ] Test retry behavior

**Affected Files:**
- `frontend/src/config/api.ts`
- `frontend/src/services/api.ts`
- `frontend/.env.example`

---

### Issue #9: Console.log Leaks Info
- [ ] Create `frontend/src/utils/logger.ts`
- [ ] Implement LogLevel enum
- [ ] Replace all `console.log()` calls
- [ ] Replace all `console.error()` calls
- [ ] Replace all `console.warn()` calls
- [ ] Add unit tests
- [ ] Verify no sensitive info logged

**Affected Files:**
- `frontend/src/utils/logger.ts` (new)
- `frontend/src/App.tsx`
- `frontend/src/services/api.ts`
- All other components using console

**Testing:**
```bash
# Test 1: Development mode
VITE_MODE=development npm run dev
# Check browser console, should see debug logs

# Test 2: Production mode
npm run build
# Check built code, should not have debug logs
```

---

## 🔵 Phase 4: POLISH & QUALITY (Week 4)

### Issue #14: Missing Rate Limiting
- [ ] Create `backend/internal/middleware/rate_limit.go`
- [ ] Implement rate limiter
- [ ] Add to router
- [ ] Configure limits per endpoint
- [ ] Add to `.env.example`
- [ ] Write unit tests
- [ ] Load test to verify

**Affected Files:**
- `backend/internal/middleware/rate_limit.go` (new)
- `backend/cmd/server/main.go`
- `backend/.env.example`

---

### Issue #16: Replace alert() with Toast
- [ ] Find all `alert()` calls
- [ ] Replace with `toast.error()`, `toast.success()`, `toast.info()`
- [ ] Test notifications appear correctly
- [ ] Verify styling matches design system

**Affected Files:**
- `frontend/src/pages/PolicyEditor.tsx`
- `frontend/src/pages/Scheduler.tsx`
- `frontend/src/pages/Templates.tsx`
- Other pages using alert()

---

### Issue #17: Remove Mock Data
- [ ] Replace mock data with API calls
- [ ] Use React Query for data fetching
- [ ] Add loading states
- [ ] Add error handling
- [ ] Write tests

**Affected Files:**
- `frontend/src/components/PolicyEditor/PolicyEditor.tsx`
- Other components with mock data

---

### Issue #18: Form Error Handling
- [ ] Create `FormField` component
- [ ] Add validation feedback
- [ ] Update all form pages
- [ ] Add error messages
- [ ] Style error states

**Affected Files:**
- `frontend/src/pages/Settings.tsx`
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/SignUp.tsx`
- Other form pages

---

### Issue #20: Input Validation
- [ ] Create validation utility functions
- [ ] Add backend middleware for validation
- [ ] Add frontend validation
- [ ] Create unit tests
- [ ] Document validation rules

**Affected Files:**
- `frontend/src/utils/validation.ts` (new)
- `backend/internal/middleware/validation.go` (new)
- All API endpoints
- All form components

---

### Issue #19: Lighthouse Configuration
- [ ] Make URL configurable
- [ ] Make run count configurable
- [ ] Update documentation

**Affected Files:**
- `lighthouserc.js`
- `.env.example`

---

## 📋 Pre-Implementation Checklist

Before starting fixes:

- [ ] Create feature branches for each phase
- [ ] Set up local test environment
- [ ] Review all related code
- [ ] Check dependencies needed
- [ ] Prepare test data
- [ ] Document changes
- [ ] Set up CI/CD for testing

---

## ✅ Post-Implementation Checklist

After each fix:

- [ ] Code follows project style guide
- [ ] All tests pass locally
- [ ] No console errors/warnings
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Security implications reviewed
- [ ] Performance impact checked
- [ ] Ready for code review

---

## 🔄 CI/CD Integration

Add to CI pipeline:

```bash
# Security checks
- staticcheck ./...
- gosec ./...
- npm audit --audit-level=moderate

# Configuration validation
- go run cmd/server/main.go -validate-config

# Tests
- go test -v ./...
- npm run test

# Linting
- golangci-lint run
- npm run lint

# Build verification
- go build -o /tmp/niyama cmd/server/main.go
- npm run build
```

---

**Total Estimated Effort:** 4 weeks  
**Team Size:** 2-3 developers  
**Testing Effort:** 40% of development time  
**Documentation Effort:** 10% of development time
