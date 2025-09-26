package services

import (
	"github.com/Flack74/realm-backend/internal/core/domain"
	"github.com/Flack74/realm-backend/internal/core/ports"
	"github.com/google/uuid"
)

type userService struct {
	userRepo ports.UserRepository
}

func NewUserService(userRepo ports.UserRepository) ports.UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) CreateUser(authUserID uuid.UUID, username, displayName string) (*domain.RealmUser, error) {
	user := &domain.RealmUser{
		ID:          uuid.New(),
		Username:    username,
		DisplayName: displayName,
		AuthUserID:  authUserID,
		Status:      domain.StatusOnline,
	}
	
	err := s.userRepo.Create(user)
	return user, err
}

func (s *userService) GetUser(id uuid.UUID) (*domain.RealmUser, error) {
	return s.userRepo.GetByID(id)
}

func (s *userService) GetUserByAuthID(authUserID uuid.UUID) (*domain.RealmUser, error) {
	return s.userRepo.GetByAuthUserID(authUserID)
}

func (s *userService) UpdateUser(user *domain.RealmUser) error {
	return s.userRepo.Update(user)
}

func (s *userService) UpdateUserStatus(userID uuid.UUID, status domain.UserStatus) error {
	return s.userRepo.UpdateStatus(userID, status)
}

func (s *userService) UploadAvatar(userID uuid.UUID, file []byte, filename string) (string, error) {
	// TODO: Implement file upload logic
	return "", nil
}