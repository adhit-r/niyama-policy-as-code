# Installation Guide

This guide will walk you through installing and setting up the Niyama Policy as Code Platform.

## Prerequisites

Before installing Niyama, ensure you have the following prerequisites:

### Required Software
- [Bun](https://bun.sh) >= 1.0.0
- [Docker](https://docker.com) >= 20.10.0
- [Docker Compose](https://docs.docker.com/compose/) >= 2.0.0
- [Git](https://git-scm.com/) >= 2.30.0

### Optional Software
- [Kubernetes](https://kubernetes.io) >= 1.24 (for production deployment)
- [kubectl](https://kubernetes.io/docs/tasks/tools/) >= 1.24
- [Helm](https://helm.sh/) >= 3.8.0

## Installation Methods

### Method 1: Docker Compose (Recommended for Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/adhit-r/niyama-policy-as-code.git
   cd niyama-policy-as-code
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Verify installation**
   ```bash
   # Check service status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   ```

### Method 2: Local Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/adhit-r/niyama-policy-as-code.git
   cd niyama-policy-as-code
   bun install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the backend**
   ```bash
   cd backend-go
   go mod tidy
   go run main.go
   ```

4. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   bun run dev
   ```

### Method 3: Kubernetes Deployment

1. **Prepare Kubernetes cluster**
   ```bash
   # Ensure kubectl is configured
   kubectl cluster-info
   ```

2. **Deploy using Helm**
   ```bash
   helm install niyama ./helm/niyama \
     --set image.tag=latest \
     --set ingress.enabled=true \
     --set ingress.host=niyama.yourdomain.com
   ```

3. **Verify deployment**
   ```bash
   kubectl get pods -l app=niyama
   kubectl get services -l app=niyama
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/niyama
REDIS_URL=redis://localhost:6379

# AI Service
GEMINI_API_KEY=your_gemini_api_key

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Monitoring
INFLUXDB_URL=http://localhost:8086
ELASTICSEARCH_URL=http://localhost:9200

# OPA Configuration
OPA_URL=http://localhost:8181

# Application Settings
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3003
```

### Database Setup

1. **PostgreSQL Setup**
   ```bash
   # Create database
   createdb niyama
   
   # Run migrations
   cd backend-go
   go run main.go migrate
   ```

2. **Redis Setup**
   ```bash
   # Start Redis server
   redis-server
   
   # Test connection
   redis-cli ping
   ```

## Verification

After installation, verify that all components are working:

1. **Access the application**
   - Frontend: http://localhost:3003
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

2. **Check health endpoints**
   ```bash
   curl http://localhost:8000/health
   curl http://localhost:8000/api/v1/health
   ```

3. **Test API endpoints**
   ```bash
   # Get templates
   curl http://localhost:8000/api/v1/templates
   
   # Get metrics
   curl http://localhost:8000/api/v1/monitoring/metrics
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Ensure ports 3003, 8000, 5432, 6379, 8086, 9200, 8181 are available
   - Check for running services: `lsof -i :PORT`

2. **Database connection issues**
   - Verify PostgreSQL is running: `pg_isready`
   - Check connection string in `.env`
   - Ensure database exists and user has permissions

3. **Docker issues**
   - Check Docker daemon: `docker info`
   - Restart Docker if needed: `sudo systemctl restart docker`
   - Check container logs: `docker-compose logs SERVICE_NAME`

4. **Frontend build issues**
   - Clear node modules: `rm -rf node_modules && bun install`
   - Check Node.js version compatibility
   - Verify environment variables

### Getting Help

- Check the [Troubleshooting Guide](Troubleshooting)
- Review [GitHub Issues](https://github.com/adhit-r/niyama-policy-as-code/issues)
- Join [GitHub Discussions](https://github.com/adhit-r/niyama-policy-as-code/discussions)

## Next Steps

After successful installation:

1. Read the [Getting Started Guide](Getting-Started)
2. Explore the [Dashboard Overview](Dashboard-Overview)
3. Try the [Policy Editor Guide](Policy-Editor-Guide)
4. Review [Security Best Practices](Security-Best-Practices)

---

*For production deployment, see the [Deployment Guide](Deployment-Guide).*

