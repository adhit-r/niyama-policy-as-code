# Project Structure & Organization

## Repository Layout

Niyama follows a monorepo structure with clear separation between frontend, backend, infrastructure, and documentation.

```
niyama/
├── .github/                    # GitHub workflows and templates
├── .kiro/                      # Kiro configuration and steering
├── backend/                    # Go backend service
├── frontend/                   # React frontend application
├── infrastructure/             # Infrastructure as Code
├── tests/                      # Cross-system integration tests
├── docs/                       # Comprehensive documentation
├── scripts/                    # Automation and utility scripts
├── config/                     # Environment-specific configurations
├── tools/                      # Development utilities
├── docker-compose.yml          # Local development stack
├── Makefile                    # Development commands
└── package.json                # Root workspace configuration
```

## Backend Structure (`backend/`)

Follows Go project layout standards with clean architecture principles:

```
backend/
├── cmd/                        # Application entry points
│   └── server/                 # Main server application
│       └── main.go            # Server startup and configuration
├── internal/                   # Private application code
│   ├── config/                # Configuration management
│   ├── database/              # Database connection and migrations
│   ├── handlers/              # HTTP request handlers (controllers)
│   ├── middleware/            # HTTP middleware (auth, CORS, etc.)
│   ├── models/                # Data models and structs
│   ├── services/              # Business logic layer
│   └── utils/                 # Utility functions
├── pkg/                       # Public library code (if needed)
├── migrations/                # Database migration files
├── policies/                  # OPA policy files
├── scripts/                   # Backend-specific scripts
├── bin/                       # Compiled binaries (gitignored)
├── go.mod                     # Go module definition
├── go.sum                     # Go module checksums
└── Dockerfile                 # Backend container definition
```

### Backend Conventions

- **Handlers**: HTTP request/response logic only, delegate to services
- **Services**: Business logic and data processing
- **Models**: Database entities and data structures
- **Middleware**: Cross-cutting concerns (auth, logging, CORS)
- **Internal**: Private code that shouldn't be imported externally
- **Pkg**: Public libraries that could be reused

## Frontend Structure (`frontend/`)

Modern React application with TypeScript and component-based architecture:

```
frontend/
├── src/                       # Source code
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components (buttons, modals)
│   │   └── __tests__/        # Component tests
│   ├── pages/                # Route-level page components
│   ├── hooks/                # Custom React hooks
│   ├── contexts/             # React context providers
│   ├── services/             # API client and external services
│   ├── store/                # State management (Zustand stores)
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── styles/               # Global styles and design system
│   ├── i18n/                 # Internationalization
│   │   └── locales/          # Translation files
│   ├── test/                 # Test utilities and setup
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── public/                    # Static assets
├── dist/                      # Build output (gitignored)
├── node_modules/              # Dependencies (gitignored)
├── package.json               # Frontend dependencies and scripts
├── vite.config.ts            # Vite build configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── Dockerfile                # Frontend container definition
```

### Frontend Conventions

- **Components**: Reusable UI components with TypeScript props
- **Pages**: Route-level components that compose smaller components
- **Hooks**: Custom React hooks for shared logic
- **Services**: API clients and external service integrations
- **Store**: Zustand stores for client-side state management
- **Types**: Comprehensive TypeScript definitions for all data structures

## Infrastructure Structure (`infrastructure/`)

Infrastructure as Code with multiple deployment targets:

```
infrastructure/
├── kubernetes/                # Kubernetes manifests
│   ├── backend.yaml          # Backend deployment and service
│   ├── frontend.yaml         # Frontend deployment and service
│   ├── postgres.yaml         # PostgreSQL database
│   ├── redis.yaml            # Redis cache
│   ├── ingress.yaml          # Ingress controller configuration
│   ├── monitoring.yaml       # Prometheus and Grafana
│   └── namespace.yaml        # Kubernetes namespace
├── terraform/                # Terraform configurations (future)
├── helm/                     # Helm charts (future)
└── monitoring/               # Monitoring configurations
    ├── prometheus.yml        # Prometheus configuration
    └── grafana/              # Grafana dashboards
```

## Documentation Structure (`docs/`)

Comprehensive documentation organized by audience and purpose:

```
docs/
├── architecture/             # Technical architecture documents
├── guides/                   # User and developer guides
├── reference/                # API reference and technical specs
├── README.md                 # Documentation index
└── CHANGELOG.md              # Version history
```

## Configuration Structure (`config/`)

Environment-specific configurations:

```
config/
├── development/              # Development environment
│   ├── .env                 # Development variables
│   └── .env.example         # Development template
├── staging/                  # Staging environment
│   └── .env.example         # Staging template
└── production/               # Production environment
    └── .env.example         # Production template
```

## Testing Structure (`tests/`)

Cross-system integration and end-to-end tests:

```
tests/
├── e2e/                      # Playwright end-to-end tests
│   ├── auth.spec.ts         # Authentication flows
│   ├── dashboard.spec.ts    # Dashboard functionality
│   └── policies.spec.ts     # Policy management
└── performance/              # Load and performance tests
    └── load-test.js         # K6 load testing scripts
```

## Naming Conventions

### Files and Directories
- **Kebab-case**: For directories and configuration files (`policy-editor`, `docker-compose.yml`)
- **PascalCase**: For React components (`PolicyEditor.tsx`, `UserManagement.tsx`)
- **camelCase**: For TypeScript files and utilities (`apiClient.ts`, `useAuth.ts`)
- **snake_case**: For database migrations and SQL files (`001_create_users.sql`)

### Code Conventions
- **Go**: Follow standard Go conventions (PascalCase for exports, camelCase for private)
- **TypeScript**: PascalCase for types/interfaces, camelCase for variables/functions
- **React**: PascalCase for components, camelCase for props and hooks
- **CSS**: Tailwind utility classes, custom classes in kebab-case

## Import Organization

### Frontend Imports
```typescript
// 1. External libraries
import React from 'react';
import { useQuery } from 'react-query';

// 2. Internal utilities and types
import { ApiResponse, Policy } from '@/types';
import { apiClient } from '@/services/api';

// 3. Components
import { Button } from '@/components/ui/Button';
import { PolicyEditor } from '@/components/PolicyEditor';
```

### Backend Imports
```go
// 1. Standard library
import (
    "context"
    "fmt"
)

// 2. External dependencies
import (
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

// 3. Internal packages
import (
    "niyama-backend/internal/models"
    "niyama-backend/internal/services"
)
```

## Key Principles

1. **Separation of Concerns**: Clear boundaries between layers (handlers, services, models)
2. **Dependency Direction**: Dependencies flow inward (handlers → services → models)
3. **Testability**: Each layer can be tested independently
4. **Scalability**: Structure supports horizontal scaling and team growth
5. **Maintainability**: Clear conventions make code easy to understand and modify