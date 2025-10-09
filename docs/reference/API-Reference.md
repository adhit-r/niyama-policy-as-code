# API Reference

This document provides comprehensive API documentation for the Niyama Policy as Code Platform.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

Niyama uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "data": {},
  "message": "Success message",
  "status": "success",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

Error responses:

```json
{
  "error": "Error message",
  "status": "error",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Endpoints

### Health Check

#### GET /health
Check the health status of the API server.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### Templates

#### GET /templates
Retrieve all available policy templates.

**Query Parameters:**
- `framework` (optional): Filter by compliance framework
- `language` (optional): Filter by policy language
- `category` (optional): Filter by category

**Response:**
```json
{
  "templates": [
    {
      "id": "template-1",
      "name": "Kubernetes Security Policy",
      "description": "Ensures all pods have security contexts",
      "framework": "Kubernetes",
      "language": "rego",
      "category": "Security",
      "content": "package kubernetes.security\n\ndefault allow = false\n\nallow {\n    input.kind == \"Pod\"\n    input.spec.securityContext.runAsNonRoot == true\n}",
      "tags": ["kubernetes", "security", "pods"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### GET /templates/{id}
Retrieve a specific template by ID.

**Response:**
```json
{
  "template": {
    "id": "template-1",
    "name": "Kubernetes Security Policy",
    "description": "Ensures all pods have security contexts",
    "framework": "Kubernetes",
    "language": "rego",
    "category": "Security",
    "content": "package kubernetes.security\n\ndefault allow = false\n\nallow {\n    input.kind == \"Pod\"\n    input.spec.securityContext.runAsNonRoot == true\n}",
    "tags": ["kubernetes", "security", "pods"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Policies

#### GET /policies
Retrieve all policies for the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by policy status
- `category` (optional): Filter by category
- `limit` (optional): Number of results to return
- `offset` (optional): Number of results to skip

**Response:**
```json
{
  "policies": [
    {
      "id": 1,
      "name": "Production Security Policy",
      "description": "Security policy for production environment",
      "content": "package production.security\n\ndefault allow = false\n\nallow {\n    input.environment == \"production\"\n    input.security_level == \"high\"\n}",
      "language": "rego",
      "category": "Security",
      "status": "active",
      "version": 1,
      "author_id": 1,
      "organization_id": 1,
      "is_active": true,
      "is_public": false,
      "access_level": "org",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### POST /policies
Create a new policy.

**Request Body:**
```json
{
  "name": "New Security Policy",
  "description": "Description of the policy",
  "content": "package security\n\ndefault allow = false\n\nallow {\n    input.user.role == \"admin\"\n}",
  "language": "rego",
  "category": "Security",
  "tags": ["security", "admin"],
  "access_level": "private"
}
```

**Response:**
```json
{
  "message": "Policy created successfully",
  "policy": {
    "id": 2,
    "name": "New Security Policy",
    "description": "Description of the policy",
    "content": "package security\n\ndefault allow = false\n\nallow {\n    input.user.role == \"admin\"\n}",
    "language": "rego",
    "category": "Security",
    "status": "draft",
    "version": 1,
    "author_id": 1,
    "organization_id": 1,
    "is_active": true,
    "is_public": false,
    "access_level": "private",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /policies/save
Save a policy (alias for POST /policies).

#### POST /policies/test
Test a policy against input data.

**Request Body:**
```json
{
  "policy_id": 1,
  "test_input": {
    "kind": "Pod",
    "spec": {
      "securityContext": {
        "runAsNonRoot": true
      }
    }
  }
}
```

**Response:**
```json
{
  "message": "Policy evaluation completed",
  "evaluation": {
    "id": 1,
    "policy_id": 1,
    "input": "{\"kind\":\"Pod\",\"spec\":{\"securityContext\":{\"runAsNonRoot\":true}}}",
    "output": "{\"decision\":\"allow\",\"reason\":\"Policy evaluation successful\",\"details\":{\"resource\":\"pod\",\"namespace\":\"default\"}}",
    "decision": "allow",
    "duration": 150,
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### AI Services

#### POST /ai/generate-policy
Generate a policy using AI.

**Request Body:**
```json
{
  "description": "Create a policy that ensures all containers run as non-root user",
  "framework": "Kubernetes",
  "language": "rego",
  "category": "Security"
}
```

**Response:**
```json
{
  "policy": {
    "name": "Container Non-Root Policy",
    "description": "Ensures all containers run as non-root user",
    "content": "package kubernetes.security\n\ndefault allow = false\n\nallow {\n    input.kind == \"Pod\"\n    input.spec.containers[_].securityContext.runAsNonRoot == true\n}",
    "language": "rego",
    "category": "Security",
    "framework": "Kubernetes",
    "confidence": 0.95
  },
  "source": "gemini"
}
```

#### POST /ai/optimize-policy
Optimize an existing policy using AI.

**Request Body:**
```json
{
  "policy_content": "package security\n\ndefault allow = false\n\nallow {\n    input.user.role == \"admin\"\n}",
  "optimization_goal": "performance"
}
```

**Response:**
```json
{
  "optimized_policy": {
    "content": "package security\n\ndefault allow = false\n\nallow {\n    input.user.role == \"admin\"\n    count(input.user.permissions) > 0\n}",
    "improvements": [
      "Added permission validation",
      "Improved performance with early return"
    ],
    "confidence": 0.88
  }
}
```

### Monitoring

#### GET /monitoring/metrics
Get system metrics.

**Response:**
```json
{
  "metrics": {
    "active_policies": 15,
    "violations": 3,
    "compliance_score": 85,
    "evaluations_today": 1250,
    "system_health": {
      "api_server": "healthy",
      "database": "healthy",
      "opa_engine": "healthy",
      "ai_service": "healthy"
    }
  }
}
```

#### GET /monitoring/alerts
Get recent alerts.

**Query Parameters:**
- `limit` (optional): Number of alerts to return
- `severity` (optional): Filter by severity level

**Response:**
```json
{
  "alerts": [
    {
      "id": 1,
      "title": "Policy Violation Detected",
      "message": "Container running as root user detected",
      "severity": "high",
      "policy_id": 1,
      "resource": "pod/nginx-deployment-abc123",
      "namespace": "default",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Invalid or missing authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Server error |

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @niyama/policy-sdk
```

```javascript
import { NiyamaClient } from '@niyama/policy-sdk';

const client = new NiyamaClient({
  baseUrl: 'http://localhost:8000/api/v1',
  apiKey: 'your-api-key'
});

// Generate a policy
const policy = await client.ai.generatePolicy({
  description: 'Kubernetes security policy',
  framework: 'Kubernetes'
});
```

### Go
```bash
go get github.com/adhit-r/niyama-policy-as-code/sdk/go
```

```go
package main

import (
    "github.com/adhit-r/niyama-policy-as-code/sdk/go"
)

func main() {
    client := niyama.NewClient("http://localhost:8000/api/v1", "your-api-key")
    
    policy, err := client.AI.GeneratePolicy(niyama.GeneratePolicyRequest{
        Description: "Kubernetes security policy",
        Framework:   "Kubernetes",
    })
}
```

## Webhooks

Niyama supports webhooks for real-time notifications:

### Policy Violation Webhook
```json
{
  "event": "policy.violation",
  "data": {
    "policy_id": 1,
    "resource": "pod/nginx-deployment-abc123",
    "namespace": "default",
    "violation_details": {
      "rule": "runAsNonRoot",
      "expected": true,
      "actual": false
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Policy Update Webhook
```json
{
  "event": "policy.updated",
  "data": {
    "policy_id": 1,
    "version": 2,
    "changes": ["content", "description"],
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Examples

### Complete Policy Creation Flow

```bash
# 1. Generate policy with AI
curl -X POST http://localhost:8000/api/v1/ai/generate-policy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Kubernetes security policy for non-root containers",
    "framework": "Kubernetes",
    "language": "rego"
  }'

# 2. Save the generated policy
curl -X POST http://localhost:8000/api/v1/policies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Kubernetes Non-Root Policy",
    "description": "Ensures containers run as non-root",
    "content": "package kubernetes.security\n\ndefault allow = false\n\nallow {\n    input.kind == \"Pod\"\n    input.spec.containers[_].securityContext.runAsNonRoot == true\n}",
    "language": "rego",
    "category": "Security"
  }'

# 3. Test the policy
curl -X POST http://localhost:8000/api/v1/policies/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "policy_id": 1,
    "test_input": {
      "kind": "Pod",
      "spec": {
        "containers": [{
          "securityContext": {
            "runAsNonRoot": true
          }
        }]
      }
    }
  }'
```

---

*For more examples and advanced usage, see the [API Examples](API-Examples) page.*

