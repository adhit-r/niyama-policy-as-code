package services

import (
	"testing"
	"time"

	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/models"
	"niyama-backend/internal/utils"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)

	// Auto-migrate models
	err = db.AutoMigrate(
		&models.User{},
		&models.Organization{},
		&models.UserOrganizationRole{},
		&models.Policy{},
		&models.PolicyTemplate{},
		&models.PolicyEvaluation{},
		&models.ComplianceFramework{},
		&models.ComplianceControl{},
		&models.PolicyComplianceMapping{},
		&models.ComplianceReport{},
	)
	require.NoError(t, err)

	return db
}

func TestAuthService_Login(t *testing.T) {
	db := setupTestDB(t)
	cfg := &config.Config{
		JWT: config.JWTConfig{
			Secret:            "test-secret",
			AccessExpiration:  time.Hour,
			RefreshExpiration: time.Hour * 24,
		},
	}

	authService := NewAuthService(&database.Database{DB: db}, cfg)

	// Create test user
	hashedPassword, err := utils.HashPassword("password123")
	require.NoError(t, err)

	user := &models.User{
		Email:     "test@example.com",
		Username:  "testuser",
		Password:  hashedPassword,
		FirstName: "Test",
		LastName:  "User",
		Role:      models.GlobalRoleUser,
		IsActive:  true,
	}
	err = db.Create(user).Error
	require.NoError(t, err)

	tests := []struct {
		name    string
		request LoginRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid login",
			request: LoginRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			wantErr: false,
		},
		{
			name: "invalid email",
			request: LoginRequest{
				Email:    "wrong@example.com",
				Password: "password123",
			},
			wantErr: true,
			errMsg:  "invalid credentials",
		},
		{
			name: "invalid password",
			request: LoginRequest{
				Email:    "test@example.com",
				Password: "wrongpassword",
			},
			wantErr: true,
			errMsg:  "invalid credentials",
		},
		{
			name: "inactive user",
			request: LoginRequest{
				Email:    "test@example.com",
				Password: "password123",
			},
			wantErr: true,
			errMsg:  "invalid credentials",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// For inactive user test, deactivate the user
			if tt.name == "inactive user" {
				user.IsActive = false
				db.Save(user)
			}

			response, err := authService.Login(&tt.request)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.errMsg)
				assert.Nil(t, response)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, response)
				assert.NotNil(t, response.User)
				assert.NotNil(t, response.Tokens)
				assert.NotEmpty(t, response.Tokens.AccessToken)
				assert.NotEmpty(t, response.Tokens.RefreshToken)
				assert.Equal(t, "test@example.com", response.User.Email)
			}

			// Reset user to active for next test
			user.IsActive = true
			db.Save(user)
		})
	}
}

func TestAuthService_Register(t *testing.T) {
	db := setupTestDB(t)
	cfg := &config.Config{
		JWT: config.JWTConfig{
			Secret:            "test-secret",
			AccessExpiration:  time.Hour,
			RefreshExpiration: time.Hour * 24,
		},
	}

	authService := NewAuthService(&database.Database{DB: db}, cfg)

	tests := []struct {
		name    string
		request RegisterRequest
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid registration",
			request: RegisterRequest{
				Email:     "newuser@example.com",
				Username:  "newuser",
				Password:  "password123",
				FirstName: "New",
				LastName:  "User",
			},
			wantErr: false,
		},
		{
			name: "duplicate email",
			request: RegisterRequest{
				Email:     "newuser@example.com",
				Username:  "anotheruser",
				Password:  "password123",
				FirstName: "Another",
				LastName:  "User",
			},
			wantErr: true,
			errMsg:  "user with this email or username already exists",
		},
		{
			name: "duplicate username",
			request: RegisterRequest{
				Email:     "different@example.com",
				Username:  "newuser",
				Password:  "password123",
				FirstName: "Different",
				LastName:  "User",
			},
			wantErr: true,
			errMsg:  "user with this email or username already exists",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			response, err := authService.Register(&tt.request)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.errMsg)
				assert.Nil(t, response)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, response)
				assert.NotNil(t, response.User)
				assert.NotNil(t, response.Tokens)
				assert.NotEmpty(t, response.Tokens.AccessToken)
				assert.NotEmpty(t, response.Tokens.RefreshToken)
				assert.Equal(t, tt.request.Email, response.User.Email)
				assert.Equal(t, tt.request.Username, response.User.Username)
				assert.Equal(t, tt.request.FirstName, response.User.FirstName)
				assert.Equal(t, tt.request.LastName, response.User.LastName)
				assert.Equal(t, models.GlobalRoleUser, response.User.Role)
				assert.True(t, response.User.IsActive)
			}
		})
	}
}

func TestAuthService_RefreshToken(t *testing.T) {
	db := setupTestDB(t)
	cfg := &config.Config{
		JWT: config.JWTConfig{
			Secret:            "test-secret",
			AccessExpiration:  time.Hour,
			RefreshExpiration: time.Hour * 24,
		},
	}

	authService := NewAuthService(&database.Database{DB: db}, cfg)

	// Create test user
	user := &models.User{
		Email:     "test@example.com",
		Username:  "testuser",
		Password:  "hashedpassword",
		FirstName: "Test",
		LastName:  "User",
		Role:      models.GlobalRoleUser,
		IsActive:  true,
	}
	err := db.Create(user).Error
	require.NoError(t, err)

	// Generate refresh token
	refreshToken, err := utils.GenerateJWT(user, cfg.JWT.Secret, cfg.JWT.RefreshExpiration)
	require.NoError(t, err)

	tests := []struct {
		name         string
		refreshToken string
		wantErr      bool
		errMsg       string
	}{
		{
			name:         "valid refresh token",
			refreshToken: refreshToken,
			wantErr:      false,
		},
		{
			name:         "invalid refresh token",
			refreshToken: "invalid-token",
			wantErr:      true,
			errMsg:       "invalid refresh token",
		},
		{
			name:         "empty refresh token",
			refreshToken: "",
			wantErr:      true,
			errMsg:       "invalid refresh token",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tokens, err := authService.RefreshToken(tt.refreshToken)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.errMsg)
				assert.Nil(t, tokens)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, tokens)
				assert.NotEmpty(t, tokens.AccessToken)
				assert.NotEmpty(t, tokens.RefreshToken)
				assert.NotEqual(t, refreshToken, tokens.RefreshToken) // Should be new token
			}
		})
	}
}

func TestAuthService_GetCurrentUser(t *testing.T) {
	db := setupTestDB(t)
	cfg := &config.Config{}

	authService := NewAuthService(&database.Database{DB: db}, cfg)

	// Create test user
	user := &models.User{
		Email:     "test@example.com",
		Username:  "testuser",
		Password:  "hashedpassword",
		FirstName: "Test",
		LastName:  "User",
		Role:      models.GlobalRoleUser,
		IsActive:  true,
	}
	err := db.Create(user).Error
	require.NoError(t, err)

	tests := []struct {
		name    string
		userID  uint
		wantErr bool
		errMsg  string
	}{
		{
			name:    "valid user ID",
			userID:  user.ID,
			wantErr: false,
		},
		{
			name:    "invalid user ID",
			userID:  999,
			wantErr: true,
			errMsg:  "record not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := authService.GetCurrentUser(tt.userID)

			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, user.ID, result.ID)
				assert.Equal(t, user.Email, result.Email)
				assert.Equal(t, user.Username, result.Username)
			}
		})
	}
}
