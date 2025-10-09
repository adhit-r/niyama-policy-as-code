---
inclusion: always
---

# Technology Stack & Development Guidelines

## Architecture Patterns

Niyama follows clean architecture with strict layer separation:
- **Handlers** → **Services** → **Models** (dependency flow inward)
- API-first design with comprehensive error handling
- Security-first approach with JWT + RBAC
- Performance through Redis caching and connection pooling

## Technology Stack

### Backend (Go 1.21+)
- **Framework**: Gin with custom middleware chain
- **Database**: PostgreSQL + GORM (auto-migrations enabled)
- **Cache**: Redis for sessions and computed results
- **Auth**: JWT with refresh token rotation
- **Policy Engine**: Open Policy Agent (OPA) integration
- **AI**: Google Gemini Pro API for policy generation
- **Monitoring**: Prometheus metrics with structured logging

### Frontend (React 18 + TypeScript)
- **Build**: Vite with hot reload and proxy to backend:8000
- **Styling**: Tailwind CSS with design system tokens
- **State**: Zustand stores + React Query for server state
- **Routing**: React Router v6 with protected route guards
- **Editor**: Monaco Editor for OPA policy editing
- **Package Manager**: Bun (preferred), npm fallback

## Mandatory Code Patterns

### Go Backend Structure
```go
// Handler pattern - delegate to services only
func (h *PolicyHandler) CreatePolicy(c *gin.Context) {
    var req CreatePolicyRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    policy, err := h.policyService.Create(c.Request.Context(), req)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(201, policy)
}

// Service pattern - business logic with context
func (s *PolicyService) Create(ctx context.Context, req CreatePolicyRequest) (*models.Policy, error) {
    // Validation, business logic, database operations
}

// Model pattern - GORM with soft deletes
type Policy struct {
    ID        uint           `json:"id" gorm:"primarykey"`
    Name      string         `json:"name" gorm:"not null;uniqueIndex"`
    Content   string         `json:"content" gorm:"type:text"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}
```

### React Frontend Structure
```typescript
// Component pattern - TypeScript props with error boundaries
interface PolicyEditorProps {
  policy: Policy;
  onSave: (policy: Policy) => Promise<void>;
}

export const PolicyEditor: React.FC<PolicyEditorProps> = ({ policy, onSave }) => {
  // Use custom hooks for logic
  const { isLoading, error, mutate } = usePolicyMutation();
  
  // Error boundary wrapper required for all pages
  return (
    <ErrorBoundary>
      {/* Component implementation */}
    </ErrorBoundary>
  );
};

// Store pattern - Zustand with TypeScript
interface PolicyStore {
  policies: Policy[];
  selectedPolicy: Policy | null;
  setPolicies: (policies: Policy[]) => void;
  selectPolicy: (policy: Policy) => void;
}

export const usePolicyStore = create<PolicyStore>((set) => ({
  policies: [],
  selectedPolicy: null,
  setPolicies: (policies) => set({ policies }),
  selectPolicy: (policy) => set({ selectedPolicy: policy }),
}));
```

### API Response Format
All API responses must follow this structure:
```json
{
  "data": { /* actual response data */ },
  "message": "Success message",
  "status": "success|error",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## File Naming Conventions

### Backend Files
- **Handlers**: `policy.go`, `user.go` (singular, lowercase)
- **Services**: `policy.go`, `auth.go` (singular, lowercase)  
- **Models**: `policy.go`, `user.go` (singular, lowercase)
- **Tests**: `*_test.go` (Go convention)

### Frontend Files
- **Components**: `PolicyEditor.tsx`, `UserManagement.tsx` (PascalCase)
- **Pages**: `Dashboard.tsx`, `Settings.tsx` (PascalCase)
- **Hooks**: `useAuth.ts`, `usePolicies.ts` (camelCase with 'use' prefix)
- **Stores**: `policyStore.ts`, `authStore.ts` (camelCase with 'Store' suffix)
- **Types**: `index.ts` (centralized type definitions)

## Required Import Order

### Go Imports
```go
import (
    // 1. Standard library
    "context"
    "fmt"
    
    // 2. External dependencies  
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    
    // 3. Internal packages
    "niyama-backend/internal/models"
    "niyama-backend/internal/services"
)
```

### TypeScript Imports
```typescript
// 1. External libraries
import React from 'react';
import { useQuery } from 'react-query';

// 2. Internal utilities and types
import { Policy, ApiResponse } from '@/types';
import { apiClient } from '@/services/api';

// 3. Components (UI first, then feature components)
import { Button, Modal } from '@/components/ui';
import { PolicyEditor } from '@/components/PolicyEditor';
```

## Development Workflow

### Environment Setup
```bash
make setup          # Initialize development environment
make dev           # Start both services with hot reload
make test          # Run all tests before committing
```

### Service Ports (Fixed Allocation)
- **Backend API**: 8000 (Gin server)
- **Frontend Dev**: 3001 (Vite dev server, proxies to backend)
- **PostgreSQL**: 5432 (local database)
- **Redis**: 6379 (session cache)
- **OPA Server**: 8181 (policy evaluation)

### Configuration Hierarchy
1. `backend/.env` - Backend-specific variables
2. `config/development/.env` - Local development overrides
3. Environment templates in `config/{staging,production}/`

## Mandatory Code Standards

### Error Handling Patterns
```go
// Go: Always return structured errors with context
func (s *PolicyService) GetPolicy(ctx context.Context, id uint) (*models.Policy, error) {
    var policy models.Policy
    if err := s.db.WithContext(ctx).First(&policy, id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, fmt.Errorf("policy not found: %w", err)
        }
        return nil, fmt.Errorf("failed to get policy: %w", err)
    }
    return &policy, nil
}
```

```typescript
// TypeScript: Use Result pattern for error handling
interface ApiResult<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export const usePolicyQuery = (id: string) => {
  return useQuery<Policy, Error>({
    queryKey: ['policy', id],
    queryFn: () => apiClient.getPolicy(id),
    onError: (error) => {
      toast.error(`Failed to load policy: ${error.message}`);
    },
  });
};
```

### Database Operations
```go
// Always use transactions for multi-table operations
func (s *PolicyService) CreateWithTemplate(ctx context.Context, req CreatePolicyRequest) error {
    return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        policy := &models.Policy{Name: req.Name, Content: req.Content}
        if err := tx.Create(policy).Error; err != nil {
            return err
        }
        
        template := &models.Template{PolicyID: policy.ID, Name: req.TemplateName}
        return tx.Create(template).Error
    })
}

// Use soft deletes for audit trails
type Policy struct {
    ID        uint           `gorm:"primarykey"`
    DeletedAt gorm.DeletedAt `gorm:"index"` // Required for audit compliance
}
```

### Authentication & Authorization
```go
// JWT middleware pattern
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(401, gin.H{"error": "authorization required"})
            c.Abort()
            return
        }
        
        claims, err := m.jwtService.ValidateToken(token)
        if err != nil {
            c.JSON(401, gin.H{"error": "invalid token"})
            c.Abort()
            return
        }
        
        c.Set("user_id", claims.UserID)
        c.Set("role", claims.Role)
        c.Next()
    }
}
```

```typescript
// Protected route pattern
export const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/signin" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/unauthorized" />;
  
  return <>{children}</>;
};
```

### State Management Patterns
```typescript
// Zustand store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: async (credentials) => {
        const response = await apiClient.login(credentials);
        set({ user: response.user, token: response.token });
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' }
  )
);

// React Query for server state
export const usePoliciesQuery = () => {
  return useQuery({
    queryKey: ['policies'],
    queryFn: apiClient.getPolicies,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

## Performance Requirements

### Frontend Optimization
- Code splitting: `React.lazy()` for route-level components
- Memoization: `React.memo()` for expensive components
- Virtual scrolling: For large data tables (>100 rows)
- Image optimization: WebP format with fallbacks

### Backend Optimization  
- Connection pooling: Max 25 connections to PostgreSQL
- Redis caching: 1-hour TTL for policy evaluations
- Database indexing: All foreign keys and frequently queried fields
- Response compression: Gzip for responses >1KB

## Testing Requirements

### Unit Test Coverage
- **Go Services**: Minimum 80% coverage with table-driven tests
- **React Components**: Test user interactions and error states
- **API Endpoints**: Test all success and error scenarios

### Integration Testing
- Database operations with test containers
- API endpoints with real database
- Authentication flows end-to-end

### E2E Testing (Playwright)
- Critical user journeys (login, policy creation, compliance reporting)
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Mobile responsiveness testing