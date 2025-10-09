package services

import (
	"errors"
	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
	"niyama-backend/internal/models"
	"niyama-backend/internal/utils"

	"gorm.io/gorm"
)

type UserService struct {
	db  *database.Database
	cfg *config.Config
}

func NewUserService(db *database.Database, cfg *config.Config) *UserService {
	return &UserService{
		db:  db,
		cfg: cfg,
	}
}

type CreateUserRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Username  string `json:"username" binding:"required,min=3,max=20"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Role      string `json:"role"`
}

type UpdateUserRequest struct {
	Email     *string `json:"email,omitempty"`
	Username  *string `json:"username,omitempty"`
	FirstName *string `json:"first_name,omitempty"`
	LastName  *string `json:"last_name,omitempty"`
	Role      *string `json:"role,omitempty"`
	IsActive  *bool   `json:"is_active,omitempty"`
}

func (s *UserService) GetUsers(limit, offset int) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Get total count
	if err := s.db.DB.Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get users with pagination
	if err := s.db.DB.Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := s.db.DB.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := s.db.DB.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return &user, nil
}

func (s *UserService) CreateUser(req *CreateUserRequest) (*models.User, error) {
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

	// Determine role
	role := models.GlobalRoleUser
	if req.Role != "" {
		role = models.GlobalUserRole(req.Role)
		if !role.IsValid() {
			return nil, errors.New("invalid role")
		}
	}

	// Create user
	user := models.User{
		Email:     req.Email,
		Username:  req.Username,
		Password:  hashedPassword,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Role:      role,
		IsActive:  true,
	}

	if err := s.db.DB.Create(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *UserService) UpdateUser(id uint, req *UpdateUserRequest) (*models.User, error) {
	var user models.User
	if err := s.db.DB.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	// Check for email/username conflicts if updating
	if req.Email != nil && *req.Email != user.Email {
		var existingUser models.User
		if err := s.db.DB.Where("email = ? AND id != ?", *req.Email, id).First(&existingUser).Error; err == nil {
			return nil, errors.New("user with this email already exists")
		}
		user.Email = *req.Email
	}

	if req.Username != nil && *req.Username != user.Username {
		var existingUser models.User
		if err := s.db.DB.Where("username = ? AND id != ?", *req.Username, id).First(&existingUser).Error; err == nil {
			return nil, errors.New("user with this username already exists")
		}
		user.Username = *req.Username
	}

	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}

	if req.LastName != nil {
		user.LastName = *req.LastName
	}

	if req.Role != nil {
		role := models.GlobalUserRole(*req.Role)
		if !role.IsValid() {
			return nil, errors.New("invalid role")
		}
		user.Role = role
	}

	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}

	if err := s.db.DB.Save(&user).Error; err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *UserService) DeleteUser(id uint) error {
	var user models.User
	if err := s.db.DB.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	// Soft delete
	if err := s.db.DB.Delete(&user).Error; err != nil {
		return err
	}

	return nil
}

func (s *UserService) GetUserOrganizations(userID uint) ([]models.Organization, error) {
	var organizations []models.Organization

	if err := s.db.DB.Joins("JOIN user_organization_roles ON organizations.id = user_organization_roles.organization_id").
		Where("user_organization_roles.user_id = ?", userID).
		Find(&organizations).Error; err != nil {
		return nil, err
	}

	return organizations, nil
}
