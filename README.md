# Niyama

**Policy as Code Platform**

A comprehensive Policy as Code platform that enables organizations to create, enforce, and monitor security and compliance policies across their infrastructure with AI-powered policy generation and seamless compliance framework mapping.

---

## Overview

Niyama provides a modern, enterprise-ready solution for Policy as Code with a focus on developer experience, security, and compliance. Built with a brutalist design philosophy, it offers a clean, professional interface that scales from development to production environments.

<div align="center">
  <img src=".playwright-mcp/dashboard-screenshot.png" alt="Niyama Dashboard" width="800" />
  <p><em>Dashboard Overview - Real-time metrics and system health monitoring</em></p>
</div>

---

## Key Features

### Modern Brutalist UI Design
- **Professional Orange-Themed Interface**: Clean, consistent orange branding throughout
- **Left Sidebar Navigation**: Intuitive navigation with active state highlighting  
- **Inline Code Branding**: "niyama" styled as professional monospace code text
- **Perfect Contrast**: High-contrast design with black text on white backgrounds
- **Enterprise-Ready**: Professional appearance designed for business environments

### AI-Powered Policy Generation
- **Google Gemini Integration**: Natural language to policy conversion
- **Real-time Policy Testing**: Instant policy evaluation with test inputs
- **Policy Optimization**: AI-powered policy improvement suggestions
- **Compliance Gap Analysis**: Automated identification of policy gaps

### Comprehensive Dashboard
- **Real-time Metrics**: Active policies, violations, compliance scores, evaluations
- **System Health Monitoring**: API server, database, OPA engine, AI service status
- **Quick Actions**: One-click access to common tasks
- **Recent Alerts**: Latest policy violations and system notifications

### Advanced Policy Management
- **Monaco Editor**: Syntax highlighting and advanced editing capabilities
- **Template Library**: Pre-built policy templates for common use cases
- **Policy Testing**: Built-in test input and evaluation results
- **Version Control**: Policy versioning and change tracking

### Enterprise Security & Compliance
- **Comprehensive Compliance Mapping**: SOC 2, HIPAA, GDPR, ISO 27001/42001, PCI DSS, NIST, CIS
- **Real-time Policy Enforcement**: OPA and Gatekeeper integration for Kubernetes
- **Advanced Monitoring**: Real-time violation detection and alerting
- **Zero-trust Architecture**: Enterprise-grade security with SOC 2 Type II compliance

---

## User Interface

### Policy Editor
<div align="center">
  <img src=".playwright-mcp/policy-editor-screenshot.png" alt="Policy Editor" width="800" />
  <p><em>Advanced policy editor with syntax highlighting and real-time testing</em></p>
</div>

### Template Library
<div align="center">
  <img src=".playwright-mcp/templates-screenshot.png" alt="Template Library" width="800" />
  <p><em>Pre-built policy templates for common use cases</em></p>
</div>

---

## Architecture

Niyama follows a modern microservices architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Policy Engine │
│   (React)       │◄──►│   (Go/Gin)      │◄──►│   (OPA)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Design System │    │   AI Service    │    │   Gatekeeper    │
│   (Tailwind)    │    │   (Gemini)      │    │   (K8s)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety and modern development
- **Tailwind CSS** for utility-first styling and design system
- **Monaco Editor** for advanced code editing capabilities
- **Lucide React** for consistent iconography
- **Vite** for fast development and optimized builds

### Backend
- **Go** with Gin web framework for high-performance API services
- **GORM** for database ORM and migrations
- **PostgreSQL** for reliable metadata storage
- **InfluxDB** for time-series metrics storage
- **Elasticsearch** for audit logs and search capabilities
- **Redis** for caching and session management
- **JWT** for secure authentication

### Infrastructure
- **Docker** for containerization and consistent deployments
- **Kubernetes** for orchestration and scaling
- **OPA** for policy evaluation engine
- **Gatekeeper** for Kubernetes policy enforcement

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.0.0
- [Docker](https://docker.com) and [Docker Compose](https://docs.docker.com/compose/)
- [Kubernetes](https://kubernetes.io) (for production deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/adhit-r/niyama-policy-as-code.git
   cd niyama-policy-as-code
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   bun run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3003
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Docker Setup

1. **Build and start services**
   ```bash
   bun run docker:build
   bun run docker:up
   ```

2. **Stop services**
   ```bash
   bun run docker:down
   ```

### Kubernetes Deployment

1. **Deploy to Kubernetes**
   ```bash
   bun run k8s:deploy
   ```

2. **Delete deployment**
   ```bash
   bun run k8s:delete
   ```

---

## Project Structure

```
niyama/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend-go/              # Go backend API
│   ├── internal/
│   │   ├── handlers/       # HTTP handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   ├── middleware/     # HTTP middleware
│   │   ├── config/         # Configuration
│   │   ├── database/       # Database connection
│   │   └── utils/          # Utility functions
│   ├── main.go             # Application entry point
│   └── go.mod              # Go module definition
├── k8s/                    # Kubernetes manifests
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker configuration
└── package.json           # Root package.json
```

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/niyama
REDIS_URL=redis://localhost:6379

# AI Service
GEMINI_API_KEY=your_gemini_api_key

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Monitoring
INFLUXDB_URL=http://localhost:8086
ELASTICSEARCH_URL=http://localhost:9200

# OPA
OPA_URL=http://localhost:8181

# Application
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3003
```

---

## Testing

```bash
# Run all tests
bun run test

# Run backend tests
bun run test:backend

# Run frontend tests
bun run test:frontend

# Run tests with coverage
bun run test:coverage
```

---

## Monitoring

- **Metrics**: InfluxDB + Grafana for comprehensive monitoring
- **Logs**: Elasticsearch + Kibana for log aggregation and analysis
- **APM**: Application performance monitoring with custom dashboards
- **Health Checks**: Built-in health check endpoints for all services

---

## Security

- **Authentication**: JWT with refresh tokens for secure session management
- **Authorization**: Role-based access control (RBAC) for fine-grained permissions
- **Encryption**: TLS 1.3 in transit, AES-256 at rest for data protection
- **Security Headers**: Comprehensive security headers for web security
- **Input Validation**: Comprehensive input sanitization and validation

---

## Documentation

- [Installation Guide](.wiki/Installation-Guide)
- [API Reference](.wiki/API-Reference)
- [Contributing Guidelines](.wiki/Contributing-Guidelines)
- [Project Wiki](.wiki/Home)

---

## Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](.wiki/Contributing-Guidelines) for details on how to get started.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- **Documentation**: [Project Wiki](.wiki/Home)
- **Issues**: [GitHub Issues](https://github.com/adhit-r/niyama-policy-as-code/issues)
- **Discussions**: [GitHub Discussions](https://github.com/adhit-r/niyama-policy-as-code/discussions)

---

## Roadmap

- [x] **Phase 1**: MVP & Foundation (Months 1-6)
- [ ] **Phase 2**: Enhanced Features (Months 7-12)
- [ ] **Phase 3**: Scale & Optimize (Months 13-18)
- [ ] **Phase 4**: Market Leadership (Months 19-24)

See the [PRD](policy-as-code-prd.md) for detailed roadmap information.

---

<div align="center">
  <p><strong>Built with modern technologies for enterprise-grade Policy as Code</strong></p>
  <p>Made with ❤️ by the Niyama team</p>
</div>