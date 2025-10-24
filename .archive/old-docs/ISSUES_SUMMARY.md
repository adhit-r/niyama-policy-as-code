# Niyama Codebase - Issues Summary & Quick Reference

## 🎯 Quick Overview

**Total Issues Found:** 20  
**Critical Issues:** 3  
**High Priority Issues:** 8  
**Medium Priority Issues:** 7  
**Low Priority Issues:** 2

---

## 🔴 CRITICAL SECURITY ISSUES (Fix Immediately)

| # | Issue | File | Risk | Fix |
|---|-------|------|------|-----|
| 1 | Hardcoded JWT Secret | `backend/internal/config/config.go:73` | Exposes signing key | Use `getEnvRequired()` function |
| 2 | Hardcoded DB Credentials | `backend/internal/config/config.go:61-66` | Database compromise | Require all DB env vars in production |
| 3 | Hardcoded K8s Secrets | `infrastructure/kubernetes/backend.yaml:10` | Secrets in version control | Use sealed-secrets or external-secrets |
| 4 | Insecure Clerk Key Validation | `frontend/src/App.tsx:30-31` | Auth bypass possible | Create proper config validation module |

---

## 🟠 HIGH PRIORITY ISSUES

| # | Issue | File | Impact | Category |
|---|-------|------|--------|----------|
| 5 | Hardcoded Port Numbers | Multiple files | Config management broken | Environment |
| 8 | Missing Config Validation | `backend/internal/config/config.go` | Bad config in production | Configuration |
| 10 | log.Fatal() Error Handling | `backend/cmd/server/main.go:41,56,65,68,98` | Poor error reporting & cleanup | Quality |
| 11 | Template CRUD - TODO | `backend/internal/handlers/template.go:62-71` | Endpoints not implemented | Functionality |
| 12 | Compliance CRUD - TODO | `backend/internal/handlers/compliance.go:20-32` | Endpoints not implemented | Functionality |
| 13 | RBAC DB Queries - TODO | `backend/internal/middleware/rbac.go:105,113` | Authorization broken | Functionality |
| 15 | Hardcoded API URLs | `frontend/src/pages/PolicyEditor.tsx:65,111` | Cannot change API endpoint | Functionality |

---

## 🟡 MEDIUM PRIORITY ISSUES

| # | Issue | File | Impact | Category |
|---|-------|------|--------|----------|
| 6 | Hardcoded API Timeout | `frontend/src/services/api.ts:20` | Cannot customize timeouts | Configuration |
| 7 | Hardcoded Retry Config | `frontend/src/services/api.ts:39` | Cannot tune retry behavior | Configuration |
| 9 | Console.log Leaks Info | `frontend/src/App.tsx:34-38` | Sensitive data visible | Development Quality |
| 14 | Missing Rate Limiting | `backend/internal/middleware/security.go:9` | No DDoS protection | Functionality |
| 16 | alert() Instead of Toast | `frontend/src/pages/PolicyEditor.tsx:48`, `Scheduler.tsx:155` | Poor UX | Functionality |
| 17 | Mock Data in Components | `frontend/src/components/PolicyEditor/PolicyEditor.tsx:71,208` | Not using real API | Functionality |
| 18 | No Form Error Handling | `frontend/src/pages/Settings.tsx:59+` | Poor validation UX | Functionality |
| 20 | Missing Input Validation | Multiple files | Security vulnerability | Functionality |

---

## 🔵 LOW PRIORITY ISSUES

| # | Issue | File | Impact | Category |
|---|-------|------|--------|----------|
| 19 | Hardcoded Lighthouse URL | `lighthouserc.js:4` | Testing not configurable | Configuration |

---

## 🚀 Implementation Roadmap

### Week 1: Security Hardening
- [ ] Fix JWT secret handling (Issue #1)
- [ ] Fix DB credentials validation (Issue #2)
- [ ] Remove hardcoded K8s secrets (Issue #3)
- [ ] Improve Clerk key validation (Issue #4)
- [ ] Add config validation for production (Issue #8)

### Week 2: Critical Functionality
- [ ] Implement template CRUD (Issue #11)
- [ ] Implement compliance CRUD (Issue #12)
- [ ] Implement RBAC database queries (Issue #13)
- [ ] Remove hardcoded API URLs (Issue #15)

### Week 3: Configuration Management
- [ ] Centralize port configuration (Issue #5)
- [ ] Make API timeout configurable (Issue #6)
- [ ] Make retry logic configurable (Issue #7)
- [ ] Configure Lighthouse testing (Issue #19)

### Week 4: Code Quality & Polish
- [ ] Replace console.log with logger (Issue #9)
- [ ] Fix error handling (Issue #10)
- [ ] Implement rate limiting (Issue #14)
- [ ] Replace alert() with toast (Issue #16)
- [ ] Replace mock data with API calls (Issue #17)
- [ ] Add form error handling (Issue #18)
- [ ] Add input validation (Issue #20)

---

## 📁 Files Most Affected

### Backend
- `backend/internal/config/config.go` - Issues #1, #2, #8
- `backend/cmd/server/main.go` - Issue #10
- `backend/internal/handlers/template.go` - Issue #11
- `backend/internal/handlers/compliance.go` - Issue #12
- `backend/internal/middleware/rbac.go` - Issue #13
- `backend/internal/middleware/security.go` - Issue #14

### Frontend
- `frontend/src/App.tsx` - Issues #4, #9
- `frontend/src/services/api.ts` - Issues #6, #7
- `frontend/src/pages/PolicyEditor.tsx` - Issues #15, #16, #17
- `frontend/src/pages/Scheduler.tsx` - Issue #16
- `frontend/src/pages/Settings.tsx` - Issue #18
- `frontend/vite.config.ts` - Issue #5

### Infrastructure
- `infrastructure/kubernetes/backend.yaml` - Issue #3
- `docker-compose.yml` - Issue #5
- `lighthouserc.js` - Issue #19

---

## 🔧 Key Utilities to Create

### Backend
- `backend/internal/utils/errors.go` - Graceful error handling
- `backend/internal/config/validation.go` - Configuration validation
- `backend/internal/middleware/rate_limit.go` - Rate limiting
- `backend/internal/services/rbac.go` - RBAC service

### Frontend
- `frontend/src/utils/logger.ts` - Structured logging
- `frontend/src/config/api.ts` - API configuration
- `frontend/src/config/auth.ts` - Authentication configuration
- `frontend/src/constants/endpoints.ts` - API endpoints
- `frontend/src/utils/validation.ts` - Input validation
- `frontend/src/components/FormField.tsx` - Reusable form component

---

## ✅ Testing Checklist

Before marking issues as resolved:

- [ ] No hardcoded credentials in code
- [ ] All configuration via environment variables
- [ ] Proper error handling without process crashes
- [ ] Logs don't expose sensitive information
- [ ] All CRUD endpoints return proper responses
- [ ] API URLs configurable
- [ ] Form validation with error messages
- [ ] Input sanitization applied
- [ ] Rate limiting works
- [ ] Unit tests added for new functions
- [ ] Integration tests for API endpoints
- [ ] E2E tests updated

---

## 🔐 Security Checklist

- [ ] JWT secret: 32+ character random string
- [ ] DB password: 16+ character with special chars
- [ ] Env vars required in production
- [ ] CORS properly configured
- [ ] SSL/TLS required in production
- [ ] Secrets not in version control
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak system info
- [ ] Logs encrypted if stored

---

## 📝 References

For detailed fix implementations, see: `ISSUES_AND_FIXES.md`

For code examples and specific changes, see each issue section in the main document.

---

**Last Updated:** 2025-10-20  
**Status:** Ready for Implementation  
**Next Step:** Prioritize Phase 1 issues and begin fixes
