# MVP Implementation Test Guide

## Quick Win #1: Real OPA Policy Evaluation ✅

### Test Policy Evaluation
```bash
# Start services
docker-compose up -d

# Test policy evaluation
curl -X POST http://localhost:8000/api/v1/policies/test \
  -H "Content-Type: application/json" \
  -d '{
    "policy_id": 1,
    "test_input": {
      "kind": "Pod",
      "spec": {
        "containers": [{"name": "app", "securityContext": {"runAsUser": 0}}]
      }
    }
  }'
# Should return deny with message about root user
```

## Quick Win #2: CI/CD Validation Webhook ✅

### Test IaC Validation
```bash
# Validate a K8s manifest
curl -X POST http://localhost:8000/api/v1/validate/iac \
  -H "Content-Type: application/json" \
  -d '{
    "files": [{
      "path": "deployment.yaml",
      "type": "kubernetes",
      "content": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: test\nspec:\n  template:\n    spec:\n      containers:\n      - name: app\n        securityContext:\n          runAsUser: 0"
    }]
  }'
# Should return violations with remediation
```

## Quick Win #3: Basic Evidence Export ✅

### Test Evidence Export
```bash
# Export CSV
curl -X GET "http://localhost:8000/api/v1/evidence/export?framework=SOC2&format=csv" \
  -o evidence.csv
# Should download CSV file
```

## Frontend Testing

1. **Policy Testing** (1 min)
   - Open policy editor
   - Write Rego policy
   - Test against sample K8s pod
   - Show real OPA decision

2. **CI Validation** (2 min)
   - Show Kubernetes deployment YAML
   - Send to validation API
   - Display violations with severity
   - Show remediation suggestions

3. **Compliance Export** (2 min)
   - Navigate to compliance dashboard
   - Click "Export SOC2 Evidence"
   - Download CSV
   - Open in Excel showing controls & status

## Implementation Summary

### ✅ Completed Features

1. **Real OPA Integration**
   - Created `backend/pkg/opa/client.go` with policy upload and evaluation
   - Updated `PolicyService.TestPolicy()` to use real OPA instead of mocks
   - Added OPA configuration to config.go

2. **CI/CD Validation API**
   - Created `ValidatorService` for IaC file validation
   - Added `/validate/iac` endpoint with Kubernetes/Terraform support
   - Implemented violation detection with severity and remediation

3. **Evidence Export**
   - Created `EvidenceService` for compliance control mapping
   - Added CSV export functionality for SOC2/HIPAA frameworks
   - Added export buttons to Compliance.tsx frontend

4. **GitHub Action**
   - Created `.github/actions/niyama-validate/action.yml` for CI integration

### 🔧 Technical Implementation

- **Backend**: Go with Gin framework, OPA client, PostgreSQL, Redis
- **Frontend**: React with TypeScript, export functionality
- **Infrastructure**: Docker Compose with OPA, Prometheus, PostgreSQL, Redis
- **CI/CD**: GitHub Actions for policy validation

### 📁 Files Created/Modified

**New Files:**
- `backend/pkg/opa/client.go`
- `backend/internal/services/validator.go`
- `backend/internal/services/evidence.go`
- `backend/internal/handlers/validator.go`
- `backend/internal/handlers/evidence.go`
- `.github/actions/niyama-validate/action.yml`

**Modified Files:**
- `backend/internal/services/policy.go` (real OPA integration)
- `backend/internal/services/services.go` (wired up new services)
- `backend/internal/handlers/handlers.go` (added new handlers)
- `backend/cmd/server/main.go` (added routes)
- `frontend/src/pages/Compliance.tsx` (added export buttons)

### 🎯 MVP Deliverables

After implementation, you now have:

✅ **Working OPA Integration** - Real policy evaluation with decision logs
✅ **CI/CD Validation API** - Validate IaC files and get violations  
✅ **Evidence Export** - CSV reports for SOC2/HIPAA compliance

### 🚀 Next Steps (Post-MVP)

- Add Cloud Custodian for remediation
- Implement runtime scanning (AWS/Azure/GCP)
- Build drift detection
- Create policy marketplace
- Add PDF report generation

