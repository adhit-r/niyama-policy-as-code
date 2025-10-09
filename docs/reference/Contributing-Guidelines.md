# Contributing Guidelines

Thank you for your interest in contributing to Niyama! This guide will help you get started with contributing to the project.

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) >= 1.0.0
- [Docker](https://docker.com) >= 20.10.0
- [Git](https://git-scm.com/) >= 2.30.0
- [Go](https://golang.org/) >= 1.21 (for backend development)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/niyama-policy-as-code.git
   cd niyama-policy-as-code
   ```

2. **Set up the development environment**
   ```bash
   # Install dependencies
   bun install
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start development services
   docker-compose up -d
   ```

3. **Start the development servers**
   ```bash
   # Backend (Go)
   cd backend-go
   go mod tidy
   go run main.go
   
   # Frontend (React) - in a new terminal
   cd frontend
   bun run dev
   ```

## 📋 Contribution Process

### 1. Create an Issue
Before starting work, please:
- Check existing issues to avoid duplicates
- Create a new issue describing your proposed changes
- Wait for maintainer approval before starting work

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

### 3. Make Changes
- Follow the coding standards (see below)
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🎨 Coding Standards

### Frontend (React/TypeScript)

#### Code Style
- Use TypeScript for all new code
- Follow React best practices and hooks
- Use functional components over class components
- Implement proper error boundaries

#### Styling
- Use Tailwind CSS for styling
- Follow the brutalist design system
- Maintain orange accent color consistency
- Ensure high contrast for accessibility

#### Component Structure
```typescript
import React from 'react';
import { ComponentProps } from '../types';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onAction 
}) => {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <button 
        className="btn-primary"
        onClick={onAction}
      >
        Action
      </button>
    </div>
  );
};
```

### Backend (Go)

#### Code Style
- Follow Go conventions and idioms
- Use meaningful variable and function names
- Implement proper error handling
- Add comprehensive comments for public APIs

#### Project Structure
```
backend-go/
├── internal/
│   ├── handlers/     # HTTP handlers
│   ├── services/     # Business logic
│   ├── models/       # Data models
│   ├── middleware/   # HTTP middleware
│   └── utils/        # Utility functions
├── main.go
└── go.mod
```

#### Handler Example
```go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type PolicyHandler struct {
    service *services.PolicyService
}

func (h *PolicyHandler) GetPolicies(c *gin.Context) {
    policies, err := h.service.GetPolicies()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "policies": policies,
        "count":    len(policies),
    })
}
```

## 🧪 Testing

### Frontend Testing
```bash
# Run tests
bun run test

# Run tests with coverage
bun run test:coverage

# Run tests in watch mode
bun run test:watch
```

### Backend Testing
```bash
# Run tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests with race detection
go test -race ./...
```

### Test Requirements
- Write unit tests for all new functionality
- Maintain minimum 80% code coverage
- Include integration tests for API endpoints
- Add end-to-end tests for critical user flows

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for complex functions
- Document all public APIs
- Include examples in documentation
- Update README for significant changes

### Wiki Updates
- Update relevant wiki pages
- Add new pages for new features
- Keep installation and setup guides current
- Document breaking changes

## 🔍 Code Review Process

### For Contributors
1. Ensure all tests pass
2. Update documentation
3. Request review from maintainers
4. Address feedback promptly
5. Keep PRs focused and small

### For Reviewers
1. Check code quality and standards
2. Verify tests and documentation
3. Test functionality manually
4. Provide constructive feedback
5. Approve when ready

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, browser, versions)
5. **Screenshots or logs** if applicable

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS 13.0]
- Browser: [e.g., Chrome 119]
- Version: [e.g., 1.0.0]

## Additional Context
Any other context about the problem.
```

## ✨ Feature Requests

When requesting features, please include:

1. **Clear description** of the feature
2. **Use case** and motivation
3. **Proposed implementation** (if you have ideas)
4. **Alternatives considered**
5. **Additional context**

### Feature Request Template
```markdown
## Feature Description
Brief description of the feature.

## Use Case
Why is this feature needed?

## Proposed Implementation
How would you like to see this implemented?

## Alternatives
What alternatives have you considered?

## Additional Context
Any other context or screenshots.
```

## 🏷️ Labels and Milestones

We use labels to categorize issues and PRs:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority items
- `priority: low` - Low priority items

## 📞 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Wiki**: For documentation and guides
- **Code Review**: For questions about specific PRs

## 📄 License

By contributing to Niyama, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to Niyama! 🎉

