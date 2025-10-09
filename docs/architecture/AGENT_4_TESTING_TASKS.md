# Agent 4: Testing & Quality Specialist

## 🎯 **Mission**
Establish comprehensive testing framework, implement automated testing at all levels, ensure code quality, and maintain high standards for the Niyama platform.

## 📋 **Week 1 Sprint Tasks**

### **Day 1-2: Testing Framework Setup**
- [ ] **Frontend Testing Setup**
  ```json
  // package.json testing dependencies
  {
    "devDependencies": {
      "@testing-library/react": "^13.4.0",
      "@testing-library/jest-dom": "^5.16.5",
      "@testing-library/user-event": "^14.4.3",
      "jest": "^29.5.0",
      "jest-environment-jsdom": "^29.5.0",
      "vitest": "^0.32.0",
      "@vitejs/plugin-react": "^4.0.0",
      "jsdom": "^22.1.0"
    }
  }
  ```

  ```typescript
  // vitest.config.ts
  import { defineConfig } from 'vitest/config'
  import react from '@vitejs/plugin-react'
  
  export default defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: true,
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*'
        ]
      }
    }
  })
  ```

- [ ] **Backend Testing Setup**
  ```go
  // backend-go/internal/testing/setup.go
  package testing
  
  import (
      "testing"
      "gorm.io/driver/sqlite"
      "gorm.io/gorm"
      "niyama-backend/internal/database"
  )
  
  func SetupTestDB(t *testing.T) *gorm.DB {
      db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
      if err != nil {
          t.Fatalf("Failed to connect to test database: %v", err)
      }
      
      // Auto-migrate all models
      database.AutoMigrate(db)
      
      return db
  }
  
  func CleanupTestDB(db *gorm.DB) {
      sqlDB, _ := db.DB()
      sqlDB.Close()
  }
  ```

### **Day 3-4: Unit Testing Implementation**
- [ ] **Frontend Component Tests**
  ```typescript
  // src/components/__tests__/Button.test.tsx
  import { render, screen, fireEvent } from '@testing-library/react'
  import { Button } from '../Button'
  
  describe('Button Component', () => {
    it('renders with correct text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })
  
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      fireEvent.click(screen.getByText('Click me'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  
    it('applies correct variant classes', () => {
      render(<Button variant="primary">Primary</Button>)
      expect(screen.getByText('Primary')).toHaveClass('btn-primary')
    })
  })
  ```

- [ ] **Backend Service Tests**
  ```go
  // backend-go/internal/services/auth_test.go
  package services
  
  import (
      "testing"
      "github.com/stretchr/testify/assert"
      "niyama-backend/internal/testing"
  )
  
  func TestAuthService_Login(t *testing.T) {
      db := testing.SetupTestDB(t)
      defer testing.CleanupTestDB(db)
      
      authService := NewAuthService(db, "test-secret")
      
      // Create test user
      user := &models.User{
          Email:    "test@example.com",
          Username: "testuser",
          Password: "hashedpassword",
      }
      db.Create(user)
      
      // Test login
      result, err := authService.Login("test@example.com", "password")
      
      assert.NoError(t, err)
      assert.NotNil(t, result)
      assert.NotEmpty(t, result.Token)
  }
  ```

### **Day 5-7: Integration & E2E Testing**
- [ ] **API Integration Tests**
  ```go
  // backend-go/internal/handlers/auth_test.go
  package handlers
  
  import (
      "bytes"
      "encoding/json"
      "net/http"
      "net/http/httptest"
      "testing"
      "github.com/gin-gonic/gin"
      "github.com/stretchr/testify/assert"
  )
  
  func TestAuthHandler_Login(t *testing.T) {
      // Setup
      gin.SetMode(gin.TestMode)
      router := gin.New()
      authHandler := NewAuthHandler(mockAuthService)
      router.POST("/api/v1/auth/login", authHandler.Login)
      
      // Test data
      loginData := map[string]string{
          "email":    "test@example.com",
          "password": "password123",
      }
      jsonData, _ := json.Marshal(loginData)
      
      // Request
      req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(jsonData))
      req.Header.Set("Content-Type", "application/json")
      
      w := httptest.NewRecorder()
      router.ServeHTTP(w, req)
      
      // Assertions
      assert.Equal(t, http.StatusOK, w.Code)
      
      var response map[string]interface{}
      json.Unmarshal(w.Body.Bytes(), &response)
      assert.Contains(t, response, "token")
  }
  ```

- [ ] **E2E Testing with Playwright**
  ```typescript
  // tests/e2e/auth.spec.ts
  import { test, expect } from '@playwright/test'
  
  test.describe('Authentication Flow', () => {
    test('user can login successfully', async ({ page }) => {
      await page.goto('/login')
      
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.click('[data-testid="login-button"]')
      
      await expect(page).toHaveURL('/dashboard')
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    })
  
    test('user sees error for invalid credentials', async ({ page }) => {
      await page.goto('/login')
      
      await page.fill('[data-testid="email-input"]', 'invalid@example.com')
      await page.fill('[data-testid="password-input"]', 'wrongpassword')
      await page.click('[data-testid="login-button"]')
      
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
      await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials')
    })
  })
  ```

## 🔧 **Technical Implementation**

### **Test Configuration**
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

### **Test Utilities**
```typescript
// src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### **Performance Testing**
```typescript
// tests/performance/api.spec.ts
import { test, expect } from '@playwright/test'

test.describe('API Performance', () => {
  test('policies endpoint responds within 200ms', async ({ request }) => {
    const startTime = Date.now()
    
    const response = await request.get('/api/v1/policies')
    
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    expect(response.status()).toBe(200)
    expect(responseTime).toBeLessThan(200)
  })
  
  test('dashboard loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    
    const endTime = Date.now()
    const loadTime = endTime - startTime
    
    expect(loadTime).toBeLessThan(2000)
  })
})
```

## 📊 **Success Criteria**

### **Week 1 Deliverables**
- [ ] Testing framework setup complete
- [ ] Unit tests for all components
- [ ] Integration tests for all APIs
- [ ] E2E tests for critical user flows
- [ ] Performance tests implemented
- [ ] Code coverage > 80%
- [ ] CI/CD integration complete

### **Quality Metrics**
- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] E2E test coverage > 70%
- [ ] Performance benchmarks met
- [ ] No flaky tests
- [ ] Test execution time < 5 minutes
- [ ] Accessibility tests passing

## 🚨 **Blockers & Dependencies**

### **Dependencies on Other Agents**
- **Agent 1**: Backend APIs for integration testing
- **Agent 2**: Frontend components for unit testing
- **Agent 3**: CI/CD pipeline for test automation
- **Agent 5**: AI features for testing

### **Potential Blockers**
- Test data setup
- Mock service configuration
- E2E test environment setup
- Performance testing infrastructure

## 📚 **Resources**

### **Documentation**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Go Testing](https://golang.org/pkg/testing/)
- [Testify](https://github.com/stretchr/testify)

### **Tools**
- [Vitest](https://vitest.dev/) - Fast unit test framework
- [Playwright](https://playwright.dev/) - E2E testing
- [Coverage](https://github.com/istanbuljs/nyc) - Code coverage
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Performance testing

---

**Agent**: Testing & Quality Specialist  
**Sprint**: Week 1  
**Status**: Ready to start  
**Next Update**: Daily progress updates in MULTI_AGENT_COORDINATION.md
