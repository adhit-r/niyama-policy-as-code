package services

import (
	"errors"
	"time"

	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/models"
	"niyama-backend/internal/utils"

	"gorm.io/gorm"
)

type AuthService struct {
	db  *database.Database
	cfg *config.Config
}

func NewAuthService(db *database.Database, cfg *config.Config) *AuthService {
	return &AuthService{
		db:  db,
		cfg: cfg,
	}
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Username  string `json:"username" binding:"required,min=3,max=20"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
}

type AuthResponse struct {
	User   *models.User `json:"user"`
	Tokens *TokenPair   `json:"tokens"`
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func (s *AuthService) Login(req *LoginRequest) (*AuthResponse, error) {
	var user models.User
	if err := s.db.DB.Where("email = ? AND is_active = ?", req.Email, true).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	// Update last login
	now := time.Now()
	user.LastLogin = &now
	s.db.DB.Save(&user)

	// Generate tokens
	accessToken, err := utils.GenerateJWT(&user, s.cfg.JWT.Secret, s.cfg.JWT.AccessExpiration)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateJWT(&user, s.cfg.JWT.Secret, s.cfg.JWT.RefreshExpiration)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User: &user,
		Tokens: &TokenPair{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		},
	}, nil
}

func (s *AuthService) Register(req *RegisterRequest) (*AuthResponse, error) {
	// Check if user already exists
	var existingUser models.User
	if err := s.db.DB.Where("email = ? OR username = ?", req.Email, req.Username).First(&existingUser).Error; err == nil {
		return nil, errors.New("user with this email or username already exists")
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := models.User{
		Email:     req.Email,
		Username:  req.Username,
		Password:  hashedPassword,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      models.GlobalRoleUser,
		IsActive:  true,
	}

	if err := s.db.DB.Create(&user).Error; err != nil {
		return nil, err
	}

	// Generate tokens
	accessToken, err := utils.GenerateJWT(&user, s.cfg.JWT.Secret, s.cfg.JWT.AccessExpiration)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateJWT(&user, s.cfg.JWT.Secret, s.cfg.JWT.RefreshExpiration)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User: &user,
		Tokens: &TokenPair{
			AccessToken:  accessToken,
			RefreshToken: refreshToken,
		},
	}, nil
}

func (s *AuthService) RefreshToken(refreshToken string) (*TokenPair, error) {
	claims, err := utils.ValidateJWT(refreshToken, s.cfg.JWT.Secret)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Get user
	var user models.User
	if err := s.db.DB.First(&user, claims.UserID).Error; err != nil {
		return nil, errors.New("user not found")
	}

	// Generate new tokens
	accessToken, err := utils.GenerateJWT(&user, s.cfg.JWT.Secret, s.cfg.JWT.AccessExpiration)
	if err != nil {
		return nil, err
	}

	newRefreshToken, err := utils.GenerateJWT(&user, s.cfg.JWT.Secret, s.cfg.JWT.RefreshExpiration)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (s *AuthService) GetCurrentUser(userID uint) (*models.User, error) {
	var user models.User
	if err := s.db.DB.First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
