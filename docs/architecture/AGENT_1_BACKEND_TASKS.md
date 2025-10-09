# Agent 1: Backend Infrastructure Specialist

## 🎯 **Mission**
Transform the Niyama backend from mock data to a production-ready, scalable system with proper database integration, authentication, and API development.

## 📋 **Week 1 Sprint Tasks**

### **Day 1-2: Database Foundation**
- [ ] **Set up PostgreSQL connection**
  - Configure GORM with PostgreSQL
  - Set up connection pooling
  - Implement connection health checks
  - Add database configuration management

- [ ] **Create core database models**
  ```go
  // User model with RBAC
  type User struct {
      ID             uint           `json:"id" gorm:"primaryKey"`
      Email          string         `json:"email" gorm:"uniqueIndex;not null"`
      Username       string         `json:"username" gorm:"uniqueIndex;not null"`
      Password       string         `json:"-" gorm:"not null"`
      FirstName      string         `json:"first_name"`
      LastName       string         `json:"last_name"`
      Role           GlobalUserRole `json:"role" gorm:"default:user"`
      IsActive       bool           `json:"is_active" gorm:"default:true"`
      LastLogin      *time.Time     `json:"last_login"`
      DefaultOrgID   *uint          `json:"default_org_id"`
      DefaultOrg     *Organization  `json:"default_org" gorm:"foreignKey:DefaultOrgID"`
      CreatedAt      time.Time      `json:"created_at"`
      UpdatedAt      time.Time      `json:"updated_at"`
      DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
  }

  // Organization model for multi-tenancy
  type Organization struct {
      ID          uint           `json:"id" gorm:"primaryKey"`
      Name        string         `json:"name" gorm:"not null"`
      Slug        string         `json:"slug" gorm:"uniqueIndex;not null"`
      Description string         `json:"description"`
      Settings    datatypes.JSON `json:"settings"`
      IsActive    bool           `json:"is_active" gorm:"default:true"`
      CreatedAt   time.Time      `json:"created_at"`
      UpdatedAt   time.Time      `json:"updated_at"`
      DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
  }

  // Policy model with proper relationships
  type Policy struct {
      ID             uint           `json:"id" gorm:"primaryKey"`
      Name           string         `json:"name" gorm:"not null"`
      Description    string         `json:"description"`
      Content        string         `json:"content" gorm:"type:text"`
      Language       string         `json:"language" gorm:"default:rego"`
      Category       string         `json:"category"`
      AccessLevel    AccessLevel    `json:"access_level" gorm:"default:private"`
      Status         Status         `json:"status" gorm:"default:draft"`
      AuthorID       uint           `json:"author_id"`
      Author         User           `json:"author" gorm:"foreignKey:AuthorID"`
      OrganizationID uint           `json:"organization_id"`
      Organization   Organization   `json:"organization" gorm:"foreignKey:OrganizationID"`
      Tags           datatypes.JSON `json:"tags"`
      Metadata       datatypes.JSON `json:"metadata"`
      CreatedAt      time.Time      `json:"created_at"`
      UpdatedAt      time.Time      `json:"updated_at"`
      DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
  }
  ```

### **Day 3-4: Authentication & RBAC**
- [ ] **Implement JWT authentication**
  - Create JWT service with proper token generation
  - Implement refresh token mechanism
  - Add token validation middleware
  - Set up secure cookie handling

- [ ] **Set up RBAC system**
  ```go
  // Role definitions
  type GlobalUserRole string
  const (
      GlobalRoleAdmin GlobalUserRole = "admin"
      GlobalRoleUser  GlobalUserRole = "user"
      GlobalRoleGuest GlobalUserRole = "guest"
  )

  // Organization-specific roles
  type Role string
  const (
      RoleAdmin       Role = "admin"
      RoleEditor      Role = "editor"
      RoleViewer      Role = "viewer"
      RoleCompliance  Role = "compliance"
  )

  // Permission system
  type Permission string
  const (
      PermissionPolicyCreate    Permission = "policy:create"
      PermissionPolicyRead      Permission = "policy:read"
      PermissionPolicyUpdate    Permission = "policy:update"
      PermissionPolicyDelete    Permission = "policy:delete"
      PermissionPolicyExecute   Permission = "policy:execute"
      PermissionUserManage      Permission = "user:manage"
      PermissionOrgManage       Permission = "org:manage"
      PermissionComplianceView  Permission = "compliance:view"
  )
  ```

- [ ] **Create authentication middleware**
  - JWT validation middleware
  - Role-based access control middleware
  - Organization context middleware
  - Rate limiting middleware

### **Day 5-7: API Development**
- [ ] **Implement user management endpoints**
  ```go
  // User endpoints
  POST   /api/v1/auth/register
  POST   /api/v1/auth/login
  POST   /api/v1/auth/refresh
  POST   /api/v1/auth/logout
  GET    /api/v1/users/profile
  PUT    /api/v1/users/profile
  GET    /api/v1/users
  POST   /api/v1/users
  PUT    /api/v1/users/:id
  DELETE /api/v1/users/:id
  ```

- [ ] **Implement policy management endpoints**
  ```go
  // Policy endpoints
  GET    /api/v1/policies
  POST   /api/v1/policies
  GET    /api/v1/policies/:id
  PUT    /api/v1/policies/:id
  DELETE /api/v1/policies/:id
  POST   /api/v1/policies/:id/evaluate
  POST   /api/v1/policies/:id/test
  GET    /api/v1/policies/:id/versions
  POST   /api/v1/policies/:id/versions
  ```

- [ ] **Implement organization management**
  ```go
  // Organization endpoints
  GET    /api/v1/organizations
  POST   /api/v1/organizations
  GET    /api/v1/organizations/:id
  PUT    /api/v1/organizations/:id
  DELETE /api/v1/organizations/:id
  GET    /api/v1/organizations/:id/members
  POST   /api/v1/organizations/:id/members
  PUT    /api/v1/organizations/:id/members/:userId
  DELETE /api/v1/organizations/:id/members/:userId
  ```

## 🔧 **Technical Implementation**

### **Database Configuration**
```go
// config/database.go
type DatabaseConfig struct {
    Host     string `env:"DB_HOST" envDefault:"localhost"`
    Port     int    `env:"DB_PORT" envDefault:"5432"`
    User     string `env:"DB_USER" envDefault:"niyama"`
    Password string `env:"DB_PASSWORD" envDefault:"niyama"`
    Name     string `env:"DB_NAME" envDefault:"niyama"`
    SSLMode  string `env:"DB_SSL_MODE" envDefault:"disable"`
    MaxConns int    `env:"DB_MAX_CONNS" envDefault:"25"`
    MinConns int    `env:"DB_MIN_CONNS" envDefault:"5"`
}
```

### **Authentication Service**
```go
// services/auth.go
type AuthService struct {
    db          *gorm.DB
    jwtSecret   string
    tokenExpiry time.Duration
}

func (s *AuthService) Login(email, password string) (*AuthResponse, error) {
    // Implementation
}

func (s *AuthService) Register(userData RegisterRequest) (*AuthResponse, error) {
    // Implementation
}

func (s *AuthService) ValidateToken(token string) (*Claims, error) {
    // Implementation
}
```

### **RBAC Middleware**
```go
// middleware/rbac.go
func RequirePermission(permission Permission) gin.HandlerFunc {
    return func(c *gin.Context) {
        user := GetUserFromContext(c)
        if !user.HasPermission(permission) {
            c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
            c.Abort()
            return
        }
        c.Next()
    }
}
```

## 📊 **Success Criteria**

### **Week 1 Deliverables**
- [ ] PostgreSQL database fully integrated
- [ ] All core models created and migrated
- [ ] JWT authentication working
- [ ] RBAC system implemented
- [ ] All API endpoints functional
- [ ] Database seeding complete
- [ ] API documentation updated

### **Quality Metrics**
- [ ] All endpoints return proper HTTP status codes
- [ ] Input validation on all endpoints
- [ ] Proper error handling and logging
- [ ] Database queries optimized
- [ ] Security headers implemented
- [ ] Rate limiting configured

## 🚨 **Blockers & Dependencies**

### **Dependencies on Other Agents**
- **Agent 2**: Frontend needs to consume new API endpoints
- **Agent 3**: DevOps needs to set up PostgreSQL in Docker
- **Agent 4**: Testing needs to test new endpoints
- **Agent 5**: AI features need to integrate with new policy model

### **Potential Blockers**
- Database connection issues
- JWT secret configuration
- Environment variable setup
- Docker PostgreSQL setup

## 📚 **Resources**

### **Documentation**
- [GORM Documentation](https://gorm.io/docs/)
- [JWT Go Implementation](https://github.com/golang-jwt/jwt)
- [Gin Framework](https://gin-gonic.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### **Code Examples**
- Check existing handlers in `backend-go/internal/handlers/`
- Reference models in `backend-go/internal/models/`
- Use existing middleware patterns in `backend-go/internal/middleware/`

---

**Agent**: Backend Infrastructure Specialist  
**Sprint**: Week 1  
**Status**: Ready to start  
**Next Update**: Daily progress updates in MULTI_AGENT_COORDINATION.md
