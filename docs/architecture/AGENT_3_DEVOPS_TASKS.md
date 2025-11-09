# Agent 3: DevOps & Infrastructure Specialist

## 🎯 **Mission**
Set up production-ready infrastructure, CI/CD pipelines, monitoring, and security for the Niyama platform to ensure scalable, secure, and reliable deployment.

## 📋 **Week 1 Sprint Tasks**

### **Day 1-2: CI/CD Pipeline Setup**
- [ ] **GitHub Actions Workflow**
  ```yaml
  # .github/workflows/ci.yml
  name: CI/CD Pipeline
  
  on:
    push:
      branches: [ main, develop ]
    pull_request:
      branches: [ main ]
  
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Setup Go
          uses: actions/setup-go@v4
          with:
            go-version: '1.21'
        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '18'
        - name: Install dependencies
          run: |
            cd backend-go && go mod download
            cd ../frontend && npm ci
        - name: Run tests
          run: |
            cd backend-go && go test ./...
            cd ../frontend && npm test
        - name: Build
          run: |
            cd backend-go && go build -o niyama-backend
            cd ../frontend && npm run build
  
    security:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Run Trivy vulnerability scanner
          uses: aquasecurity/trivy-action@master
          with:
            scan-type: 'fs'
            scan-ref: '.'
        - name: Run Snyk security scan
          uses: snyk/actions/node@master
          env:
            SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  
    deploy:
      needs: [test, security]
      runs-on: ubuntu-latest
      if: github.ref == 'refs/heads/main'
      steps:
        - uses: actions/checkout@v4
        - name: Deploy to staging
          run: |
            # Deploy to staging environment
        - name: Deploy to production
          run: |
            # Deploy to production environment
  ```

- [ ] **Docker Optimization**
  ```dockerfile
  # Multi-stage build for backend
  FROM golang:1.21-alpine AS builder
  WORKDIR /app
  COPY go.mod go.sum ./
  RUN go mod download
  COPY . .
  RUN CGO_ENABLED=0 GOOS=linux go build -o niyama-backend
  
  FROM alpine:latest
  RUN apk --no-cache add ca-certificates
  WORKDIR /root/
  COPY --from=builder /app/niyama-backend .
  EXPOSE 8000
  CMD ["./niyama-backend"]
  ```

### **Day 3-4: Infrastructure Setup**
- [ ] **Kubernetes Manifests**
  ```yaml
  # k8s/namespace.yaml
  apiVersion: v1
  kind: Namespace
  metadata:
    name: niyama
  
  # k8s/postgres.yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: postgres
    namespace: niyama
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: postgres
    template:
      metadata:
        labels:
          app: postgres
      spec:
        containers:
        - name: postgres
          image: postgres:15
          env:
          - name: POSTGRES_DB
            value: niyama
          - name: POSTGRES_USER
            value: niyama
          - name: POSTGRES_PASSWORD
            valueFrom:
              secretKeyRef:
                name: postgres-secret
                key: password
          ports:
          - containerPort: 5432
          volumeMounts:
          - name: postgres-storage
            mountPath: /var/lib/postgresql/data
        volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
  
  # k8s/backend.yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: niyama-backend
    namespace: niyama
  spec:
    replicas: 3
    selector:
      matchLabels:
        app: niyama-backend
    template:
      metadata:
        labels:
          app: niyama-backend
      spec:
        containers:
        - name: niyama-backend
          image: niyama/backend:latest
          ports:
          - containerPort: 8000
          env:
          - name: DATABASE_URL
            valueFrom:
              secretKeyRef:
                name: niyama-secrets
                key: database-url
          - name: JWT_SECRET
            valueFrom:
              secretKeyRef:
                name: niyama-secrets
                key: jwt-secret
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
  ```

- [ ] **Environment Configuration**
  ```yaml
  # k8s/configmap.yaml
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: niyama-config
    namespace: niyama
  data:
    NODE_ENV: "production"
    LOG_LEVEL: "info"
    API_PORT: "8000"
    FRONTEND_URL: "https://niyama.dev"
  
  # k8s/secrets.yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: niyama-secrets
    namespace: niyama
  type: Opaque
  data:
    database-url: <base64-encoded-database-url>
    jwt-secret: <base64-encoded-jwt-secret>
    gemini-api-key: <base64-encoded-gemini-api-key>
  ```

### **Day 5-7: Monitoring & Security**
- [ ] **Monitoring Setup**
  ```yaml
  # k8s/monitoring.yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: prometheus
    namespace: niyama
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: prometheus
    template:
      metadata:
        labels:
          app: prometheus
      spec:
        containers:
        - name: prometheus
          image: prom/prometheus:latest
          ports:
          - containerPort: 9090
          volumeMounts:
          - name: prometheus-config
            mountPath: /etc/prometheus
        volumes:
        - name: prometheus-config
          configMap:
            name: prometheus-config
  
  # k8s/grafana.yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: grafana
    namespace: niyama
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: grafana
    template:
      metadata:
        labels:
          app: grafana
      spec:
        containers:
        - name: grafana
          image: grafana/grafana:latest
          ports:
          - containerPort: 3000
          env:
          - name: GF_SECURITY_ADMIN_PASSWORD
            valueFrom:
              secretKeyRef:
                name: grafana-secret
                key: admin-password
  ```

- [ ] **Security Configuration**
  ```yaml
  # k8s/network-policy.yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    name: niyama-network-policy
    namespace: niyama
  spec:
    podSelector: {}
    policyTypes:
    - Ingress
    - Egress
    ingress:
    - from:
      - namespaceSelector:
          matchLabels:
            name: niyama
    egress:
    - to:
      - namespaceSelector:
          matchLabels:
            name: niyama
    - to: []
      ports:
      - protocol: TCP
        port: 53
      - protocol: UDP
        port: 53
  ```

## 🔧 **Technical Implementation**

### **Docker Compose for Development**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: niyama
      POSTGRES_USER: niyama
      POSTGRES_PASSWORD: niyama
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  backend:
    build:
      context: ./backend-go
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgres://niyama:niyama@postgres:5432/niyama
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
    environment:
      VITE_API_URL: http://localhost:8000
    depends_on:
      - backend

volumes:
  postgres_data:
```

### **Security Scanning**
```bash
# Security scanning script
#!/bin/bash
echo "Running security scans..."

# Trivy vulnerability scan
trivy image niyama/backend:latest
trivy image niyama/frontend:latest

# Snyk security scan
snyk test
snyk monitor

# OWASP ZAP security scan
docker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:8000

echo "Security scans completed."
```

### **Monitoring Configuration**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'niyama-backend'
    static_configs:
      - targets: ['niyama-backend:8000']
    metrics_path: /metrics
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

## 📊 **Success Criteria**

### **Week 1 Deliverables**
- [ ] GitHub Actions CI/CD pipeline functional
- [ ] Docker multi-stage builds optimized
- [ ] Kubernetes manifests created
- [ ] Monitoring setup complete
- [ ] Security scanning configured
- [ ] Environment management setup
- [ ] Documentation updated

### **Quality Metrics**
- [ ] Build time < 5 minutes
- [ ] Deployment time < 2 minutes
- [ ] Security scan passing
- [ ] Monitoring dashboards functional
- [ ] Zero critical vulnerabilities
- [ ] 99.9% uptime target
- [ ] Auto-scaling configured

## 🚨 **Blockers & Dependencies**

### **Dependencies on Other Agents**
- **Agent 1**: Backend application for containerization
- **Agent 2**: Frontend application for containerization
- **Agent 4**: Testing framework for CI/CD integration
- **Agent 5**: AI services for monitoring

### **Potential Blockers**
- Kubernetes cluster access
- Docker registry setup
- SSL certificate configuration
- Monitoring tool licensing
- Security scanning tool access

## 📚 **Resources**

### **Documentation**
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

### **Tools**
- [Trivy](https://trivy.dev/) - Vulnerability scanner
- [Snyk](https://snyk.io/) - Security scanning
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing
- [Helm](https://helm.sh/) - Kubernetes package manager

---

**Agent**: DevOps & Infrastructure Specialist  
**Sprint**: Week 1  
**Status**: Ready to start  
**Next Update**: Daily progress updates in MULTI_AGENT_COORDINATION.md
