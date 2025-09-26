package repositories

import (
	"github.com/Flack74/realm-backend/internal/core/domain"
	"github.com/Flack74/realm-backend/internal/core/ports"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) ports.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *domain.RealmUser) error {
	return r.db.Create(user).Error
}

func (r *userRepository) GetByID(id uuid.UUID) (*domain.RealmUser, error) {
	var user domain.RealmUser
	err := r.db.First(&user, "id = ?", id).Error
	return &user, err
}

func (r *userRepository) GetByAuthUserID(authUserID uuid.UUID) (*domain.RealmUser, error) {
	var user domain.RealmUser
	err := r.db.First(&user, "auth_user_id = ?", authUserID).Error
	return &user, err
}

func (r *userRepository) GetByUsername(username string) (*domain.RealmUser, error) {
	var user domain.RealmUser
	err := r.db.First(&user, "username = ?", username).Error
	return &user, err
}

func (r *userRepository) Update(user *domain.RealmUser) error {
	return r.db.Save(user).Error
}

func (r *userRepository) UpdateStatus(userID uuid.UUID, status domain.UserStatus) error {
	return r.db.Model(&domain.RealmUser{}).Where("id = ?", userID).Update("status", status).Error
}