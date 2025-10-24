# Niyama Policy as Code Platform - AI Coding Guidelines

## 🎯 Project Overview

Niyama is a production-ready Policy as Code platform combining Go backend, React frontend, and multi-agent development workflows. Focus on enterprise-grade security, compliance, and AI-powered policy generation.

## 🏗️ Architecture & Key Components

### Backend (Go + GORM + PostgreSQL)
- **Entry Point**: `backend/cmd/server/main.go` - supports `-migrate`, `-seed`, `-env` flags
- **Structure**: Clean architecture with `internal/` for private code, `pkg/` for public
- **Config**: Environment-based loading via `internal/config/config.go`
- **Database**: GORM models in `internal/models/`, migrations in `migrations/`
- **Authentication**: JWT-based with Clerk integration, roles in `models/user.go`
- **API**: Gin framework with handlers in `internal/handlers/`, middleware in `internal/middleware/`

### Frontend (React + TypeScript + Tailwind)
- **Auth Strategy**: Clerk for production, development mode bypass when no key
- **State**: Zustand for global state, React Query for server state
- **Styling**: New Brutalist design system (`design-system.json`) with Tailwind
- **Components**: Organized by feature in `src/components/`, pages in `src/pages/`
- **API Layer**: Centralized in `src/services/api.ts` with interceptors and retry logic

### Multi-Agent Workflow
- **5 Specialized Agents**: Backend, Frontend, DevOps, Testing, AI - each with dedicated branches
- **Coordination**: Via `docs/architecture/MULTI_AGENT_COORDINATION.md`
- **Git Strategy**: Feature branches per agent, coordinated merging

## 🛠️ Development Patterns

### Essential Commands
```bash
make dev              # Full dev environment (both backend + frontend)
make dev-backend      # Go server with auto-reload
make dev-frontend     # React dev server on :3001
make test             # All tests (Go + React + E2E)
make setup            # Initial environment setup
```

### Go Backend Patterns
- **Config Loading**: Environment-specific `.env` files in `config/{env}/`
- **Database**: Connection pooling, optional Redis cache, graceful degradation
- **Models**: GORM with JSON tags, soft deletes, role-based permissions
- **Error Handling**: Structured responses, logging via standard library
- **Services**: Business logic in `internal/services/`, handlers are thin

### React Frontend Patterns
- **Component Architecture**: Compound components with slots pattern
- **Error Boundaries**: Wrap major sections, graceful fallbacks
- **Type Safety**: Strict TypeScript, Zod for runtime validation
- **API Integration**: Axios with interceptors, retry logic, pagination helpers
- **State Management**: Zustand stores in `src/store/`, React Query for server state

### Design System
- **Brutalist Theme**: High contrast, minimal borders, bold typography
- **Colors**: Black/white primary, orange accent (#ff6b35)
- **Components**: Consistent prop patterns, accessibility-first
- **Responsive**: Mobile-first approach with Tailwind breakpoints

## 🔧 Key Integration Points

### Authentication Flow
1. Clerk handles auth in production (`VITE_CLERK_PUBLISHABLE_KEY`)
2. Development bypass when key missing/placeholder
3. JWT tokens verified by Go backend middleware
4. Role-based permissions in database models

### Database & Migrations
- **GORM Migrations**: Auto-migrate on startup with `-migrate` flag
- **Models**: Defined in `internal/models/`, relationships via GORM associations  
- **Seeding**: Optional with `-seed` flag for development data

### AI Integration
- **Gemini API**: Policy generation via `internal/services/ai.go`
- **Rate Limiting**: Built-in request throttling and caching
- **Prompt Engineering**: Context-aware policy generation with compliance mapping

### Policy Engine
- **OPA Integration**: Policy evaluation via `pkg/opa/`
- **Template System**: Pre-built policies in `policies/` directory
- **Validation**: Both client and server-side policy validation

## 🧪 Testing Strategy

### Test Organization  
- **Backend**: `*_test.go` alongside source files, use testify
- **Frontend**: Vitest for units, React Testing Library for components
- **E2E**: Playwright tests in `tests/e2e/`, cross-browser coverage
- **Integration**: Database tests use in-memory SQLite

### Quality Gates
- **Linting**: golangci-lint for Go, ESLint for TypeScript
- **Type Safety**: Strict TypeScript, Go vet checks
- **Security**: Trivy scans in CI, dependency vulnerability checks
- **Coverage**: >85% for critical paths, quality over quantity

## 🚀 Deployment & Infrastructure

### Docker Strategy
- **Multi-stage Builds**: Separate build and runtime stages
- **Security**: Non-root user, minimal base images
- **Environments**: development, staging, production configs

### Kubernetes Patterns
- **Manifests**: In `infrastructure/kubernetes/`, environment-specific overlays
- **Secrets**: External secrets management, no hardcoded values
- **Monitoring**: Prometheus metrics, health checks on `/health`

## 📋 Common Gotchas

1. **Environment Loading**: Use `loadEnvironmentConfig()` before config initialization
2. **Database Connections**: Handle graceful degradation when DB unavailable
3. **Clerk Auth**: Check for valid publishable key before enabling auth
4. **CORS**: Development allows localhost:3001, production requires proper origins
5. **Migrations**: Always test migrations both up and down
6. **Frontend Types**: Keep API types in sync between Go structs and TypeScript interfaces

## 🎨 Code Style Guidelines

### Go Conventions
- Standard Go formatting (gofmt)
- Package names: lowercase, no underscores
- Interfaces: -er suffix when possible
- Error handling: explicit, wrap with context

### TypeScript/React
- Functional components with hooks
- Props interfaces co-located with components  
- Consistent file naming: PascalCase for components, camelCase for utilities
- Import organization: external, internal, relative

When making changes, always consider the multi-agent workflow and maintain consistency with the established patterns. Prioritize security, performance, and maintainability in all implementations.