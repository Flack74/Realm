package domain

import (
	"time"
	"github.com/google/uuid"
)

type UserStatus string

const (
	StatusOnline       UserStatus = "online"
	StatusIdle         UserStatus = "idle"
	StatusDoNotDisturb UserStatus = "dnd"
	StatusInvisible    UserStatus = "invisible"
)

type RealmUser struct {
	ID           uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Username     string    `json:"username" gorm:"uniqueIndex;not null"`
	DisplayName  string    `json:"display_name"`
	AvatarURL    string    `json:"avatar_url"`
	Status       UserStatus `json:"status" gorm:"default:'offline'"`
	StatusText   string    `json:"status_text"`
	AuthUserID   uuid.UUID `json:"auth_user_id" gorm:"uniqueIndex;not null"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Friend struct {
	ID         uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	UserID     uuid.UUID `json:"user_id" gorm:"not null"`
	FriendID   uuid.UUID `json:"friend_id" gorm:"not null"`
	Status     string    `json:"status" gorm:"default:'pending'"` // pending, accepted, blocked
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	
	User   RealmUser `json:"user" gorm:"foreignKey:UserID"`
	Friend RealmUser `json:"friend" gorm:"foreignKey:FriendID"`
}