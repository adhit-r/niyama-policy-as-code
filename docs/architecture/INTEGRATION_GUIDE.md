# Niyama Policy as Code - Integration Testing Guide

## Overview
This guide provides comprehensive instructions for testing the Niyama Policy as Code platform with various integrations, RBAC, and organization-specific features.

## Current Status ✅
- **Backend**: Go backend running on port 8000
- **Frontend**: React frontend running on port 3003
- **Save Policy**: ✅ Working (POST /api/v1/policies/save)
- **Test Policy**: ✅ Working (POST /api/v1/policies/test)
- **RBAC**: ✅ Implemented with organization support
- **Templates**: ✅ Working with mock data

## API Endpoints

### Policy Management
```bash
# Save a new policy
curl -X POST http://localhost:8000/api/v1/policies/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kubernetes Security Policy",
    "description": "Ensures all pods have security contexts",
    "content": "package kubernetes.security\n\ndefault allow = false\n\nallow {\n    input.kind == \"Pod\"\n    input.spec.securityContext.runAsNonRoot == true\n}",
    "language": "rego",
    "category": "security",
    "tags": ["kubernetes", "security", "pods"],
    "status": "draft",
    "access_level": "private"
  }'

# Test a policy
curl -X POST http://localhost:8000/api/v1/policies/test \
  -H "Content-Type: application/json" \
  -d '{
    "policy_id": 1,
    "test_input": {
      "kind": "Pod",
      "spec": {
        "securityContext": {
          "runAsNonRoot": true
        }
      }
    }
  }'

# Get all policies
curl http://localhost:8000/api/v1/policies

# Get templates
curl http://localhost:8000/api/v1/templates
```

## Integration Testing Scenarios

### 1. Kubernetes Policy Testing

#### Pod Security Policy
```bash
# Test pod with security context
curl -X POST http://localhost:8000/api/v1/policies/test \
  -H "Content-Type: application/json" \
  -d '{
    "policy_id": 1,
    "test_input": {
      "kind": "Pod",
      "metadata": {
        "name": "secure-pod",
        "namespace": "default"
      },
      "spec": {
        "securityContext": {
          "runAsNonRoot": true,
          "runAsUser": 1000
        },
        "containers": [{
          "name": "app",
          "image": "nginx:latest"
        }]
      }
    }
  }'
```

#### Resource Limits Policy
```bash
# Test resource limits
curl -X POST http://localhost:8000/api/v1/policies/test \
  -H "Content-Type: application/json" \
  -d '{
    "policy_id": 2,
    "test_input": {
      "kind": "Pod",
      "spec": {
        "containers": [{
          "name": "app",
          "resources": {
            "limits": {
              "cpu": "500m",
              "memory": "512Mi"
            },
            "requests": {
              "cpu": "250m",
              "memory": "256Mi"
            }
          }
        }]
      }
    }
  }'
```

### 2. RBAC Testing

#### Organization-Specific Policies
```bash
# Save organization-specific policy
curl -X POST http://localhost:8000/api/v1/policies/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Org Security Policy",
    "description": "Organization-specific security requirements",
    "content": "package org.security\n\ndefault allow = false\n\nallow {\n    input.organization == \"acme-corp\"\n    input.environment == \"production\"\n}",
    "access_level": "org",
    "status": "active"
  }'
```

#### User Role Testing
The system supports the following roles:
- **Owner**: Full access to all policies in organization
- **Admin**: Can manage all policies in organization
- **Editor**: Can edit organization policies
- **Viewer**: Can view organization and public policies
- **Member**: Can only view public policies

### 3. Compliance Framework Integration

#### SOC 2 Compliance
```bash
# SOC 2 Access Control Policy
curl -X POST http://localhost:8000/api/v1/policies/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SOC 2 Access Control",
    "description": "SOC 2 CC6.1 - Logical Access Security",
    "content": "package soc2.access\n\ndefault allow = false\n\nallow {\n    input.user.role in [\"admin\", \"auditor\"]\n    input.resource.sensitivity == \"public\"\n}\n\nallow {\n    input.user.role == \"admin\"\n    input.resource.sensitivity in [\"confidential\", \"restricted\"]\n}",
    "category": "compliance",
    "tags": ["soc2", "access-control", "cc6.1"]
  }'
```

#### HIPAA Compliance
```bash
# HIPAA Data Access Policy
curl -X POST http://localhost:8000/api/v1/policies/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "HIPAA Data Access",
    "description": "HIPAA 164.312(a)(1) - Access Control",
    "content": "package hipaa.access\n\ndefault allow = false\n\nallow {\n    input.user.hipaa_trained == true\n    input.data_type == \"PHI\"\n    input.purpose in [\"treatment\", \"payment\", \"healthcare_operations\"]\n}",
    "category": "compliance",
    "tags": ["hipaa", "phi", "access-control"]
  }'
```

#### GDPR Compliance
```bash
# GDPR Data Processing Policy
curl -X POST http://localhost:8000/api/v1/policies/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GDPR Data Processing",
    "description": "GDPR Article 6 - Lawfulness of Processing",
    "content": "package gdpr.processing\n\ndefault allow = false\n\nallow {\n    input.consent.valid == true\n    input.data_category in [\"personal\", \"sensitive\"]\n    input.purpose in [\"legitimate_interest\", \"consent\", \"contract\"]\n}",
    "category": "compliance",
    "tags": ["gdpr", "data-processing", "consent"]
  }'
```

### 4. Cloud Provider Integration

#### AWS IAM Policy Testing
```bash
# AWS S3 Access Policy
curl -X POST http://localhost:8000/api/v1/policies/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AWS S3 Access Control",
    "description": "S3 bucket access control policy",
    "content": "package aws.s3\n\ndefault allow = false\n\nallow {\n    input.action == \"s3:GetObject\"\n    input.resource.bucket == \"company-data\"\n    input.user.department in [\"engineering\", \"data-science\"]\n}",
    "category": "cloud",
    "tags": ["aws", "s3", "access-control"]
  }'
```

#### Azure RBAC Policy
```bash
# Azure Resource Access Policy
curl -X POST http://localhost:8000/api/v1/policies/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Azure Resource Access",
    "description": "Azure resource group access control",
    "content": "package azure.access\n\ndefault allow = false\n\nallow {\n    input.action in [\"read\", \"write\"]\n    input.resource.type == \"Microsoft.Resources/resourceGroups\"\n    input.user.role in [\"Contributor\", \"Owner\"]\n}",
    "category": "cloud",
    "tags": ["azure", "rbac", "resource-groups"]
  }'
```

### 5. Network Security Policies

#### Firewall Rules
```bash
# Network Access Policy
curl -X POST http://localhost:8000/api/v1/policies/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Network Access Control",
    "description": "Firewall and network access rules",
    "content": "package network.access\n\ndefault allow = false\n\nallow {\n    input.protocol == \"tcp\"\n    input.port in [80, 443, 22]\n    input.source_ip in [\"10.0.0.0/8\", \"192.168.0.0/16\"]\n}",
    "category": "network",
    "tags": ["firewall", "network", "security"]
  }'
```

## Frontend Testing

### Access the Frontend
1. Open browser to `http://localhost:3003`
2. The system should auto-login for development
3. Navigate to different sections:
   - **Dashboard**: `http://localhost:3003/dashboard`
   - **Policies**: `http://localhost:3003/policies`
   - **Templates**: `http://localhost:3003/templates`
   - **Policy Editor**: `http://localhost:3003/policies/new`

### Test Policy Creation
1. Go to Policy Editor
2. Create a new policy using the Monaco editor
3. Click "Save Policy" - should work with the new endpoint
4. Click "Test Policy" - should work with the new endpoint

### Test Template Usage
1. Go to Templates page
2. Click "Use Template" on any template
3. Should load template content in Policy Editor
4. Modify and save as new policy

## Database Integration (Optional)

If you want to test with a real database:

1. **Start PostgreSQL**:
   ```bash
   docker run --name niyama-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=niyama -p 5432:5432 -d postgres:15
   ```

2. **Update .env**:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=password
   DB_NAME=niyama
   ```

3. **Restart backend** - it will automatically create tables and use real database

## Monitoring and Logs

### Backend Logs
```bash
# View backend logs
tail -f /tmp/niyama-backend.log

# Or if running in terminal
# Logs will show in the terminal where you started the backend
```

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Frontend health (if implemented)
curl http://localhost:3003/health
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # Kill processes on ports
   lsof -ti:8000 | xargs kill -9
   lsof -ti:3003 | xargs kill -9
   ```

2. **Backend Not Starting**:
   ```bash
   cd /Users/adhi/axonome/Niyama/backend-go
   go build .
   ./niyama-backend
   ```

3. **Frontend Not Loading**:
   ```bash
   cd /Users/adhi/axonome/Niyama/frontend
   bun run dev
   ```

4. **Database Connection Issues**:
   - The system works without database (uses mock data)
   - For real database, ensure PostgreSQL is running and accessible

## Next Steps

1. **Test all policy scenarios** using the examples above
2. **Integrate with real OPA** for actual policy evaluation
3. **Add more compliance frameworks** (PCI DSS, NIST, CIS)
4. **Implement real authentication** (remove development bypass)
5. **Add monitoring and alerting** for policy violations
6. **Set up CI/CD pipelines** for policy deployment

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify all services are running on correct ports
3. Test API endpoints directly with curl
4. Check browser console for frontend errors

