# Niyama - Policy as Code Platform

A comprehensive Policy as Code platform that enables organizations to create, enforce, and monitor security and compliance policies across their infrastructure while providing seamless mapping to major compliance frameworks.

![Dashboard](screenshots/dashboard.png)

## 🚀 Features

### 🎨 **Modern Brutalist UI Design**
- **Professional Orange-Themed Interface**: Clean, consistent orange branding throughout
- **Left Sidebar Navigation**: Intuitive navigation with active state highlighting
- **Inline Code Branding**: "niyama" styled as professional monospace code text
- **Perfect Contrast**: High-contrast design with black text on white backgrounds
- **Enterprise-Ready**: Professional appearance without unnecessary emojis

### 🤖 **AI-Powered Policy Generation**
- **Google Gemini Integration**: Natural language to policy conversion
- **Real-time Policy Testing**: Instant policy evaluation with test inputs
- **Policy Optimization**: AI-powered policy improvement suggestions

### 📊 **Comprehensive Dashboard**
- **Real-time Metrics**: Active policies, violations, compliance scores, evaluations
- **System Health Monitoring**: API server, database, OPA engine, AI service status
- **Quick Actions**: One-click access to common tasks
- **Recent Alerts**: Latest policy violations and system notifications

### 🛡️ **Policy Management**
- **Advanced Policy Editor**: Monaco editor with syntax highlighting
- **Template Library**: Pre-built policy templates for common use cases
- **Policy Testing**: Built-in test input and evaluation results
- **Version Control**: Policy versioning and change tracking

### 🔒 **Compliance & Security**
- **Comprehensive Compliance Mapping**: SOC 2, HIPAA, GDPR, ISO 27001/42001, PCI DSS, NIST, CIS
- **Real-time Policy Enforcement**: OPA and Gatekeeper integration for Kubernetes
- **Advanced Monitoring**: Real-time violation detection and alerting
- **Enterprise Security**: Zero-trust architecture with SOC 2 Type II compliance

## 🎨 UI Showcase

### Dashboard Overview
The dashboard provides a comprehensive overview of your Policy as Code platform with real-time metrics, system health monitoring, and quick access to common tasks.

### Policy Editor
Advanced policy editor with syntax highlighting, real-time testing, and AI-powered policy generation capabilities.

### Template Library
Pre-built policy templates for common use cases across different frameworks and compliance standards.

## 🏗️ Architecture

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

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Monaco Editor** for policy editing
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Go** with Gin web framework
- **GORM** for database ORM
- **PostgreSQL** for metadata storage
- **InfluxDB** for metrics
- **Elasticsearch** for audit logs
- **Redis** for caching
- **JWT** for authentication

### Infrastructure
- **Docker** for containerization
- **Kubernetes** for orchestration
- **OPA** for policy evaluation
- **Gatekeeper** for K8s policy enforcement

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) >= 1.0.0
- [Docker](https://docker.com) and [Docker Compose](https://docs.docker.com/compose/)
- [Kubernetes](https://kubernetes.io) (for deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/niyama.git
   cd niyama
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

## 📁 Project Structure

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

## 🔧 Configuration

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
FRONTEND_URL=http://localhost:3000
```

## 🧪 Testing

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

## 📊 Monitoring

- **Metrics**: InfluxDB + Grafana
- **Logs**: Elasticsearch + Kibana
- **APM**: Application performance monitoring
- **Health Checks**: Built-in health check endpoints

## 🔒 Security

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Security Headers**: Comprehensive security headers
- **Input Validation**: Comprehensive input sanitization

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guide](docs/security.md)
- [Contributing Guide](docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.niyama.dev](https://docs.niyama.dev)
- **Issues**: [GitHub Issues](https://github.com/your-org/niyama/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/niyama/discussions)
- **Email**: support@niyama.dev

## 🗺️ Roadmap

- [x] **Phase 1**: MVP & Foundation (Months 1-6)
- [ ] **Phase 2**: Enhanced Features (Months 7-12)
- [ ] **Phase 3**: Scale & Optimize (Months 13-18)
- [ ] **Phase 4**: Market Leadership (Months 19-24)

See the [PRD](policy-as-code-prd.md) for detailed roadmap information.

