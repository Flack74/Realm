package domain

import (
	"time"
	"github.com/google/uuid"
)

type Realm struct {
	ID          uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string    `json:"name" gorm:"not null"`
	Description string    `json:"description"`
	IconURL     string    `json:"icon_url"`
	OwnerID     uuid.UUID `json:"owner_id" gorm:"not null"`
	InviteCode  string    `json:"invite_code" gorm:"uniqueIndex"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	
	Owner    RealmUser      `json:"owner" gorm:"foreignKey:OwnerID"`
	Members  []RealmMember  `json:"members" gorm:"foreignKey:RealmID"`
	Channels []Channel      `json:"channels" gorm:"foreignKey:RealmID"`
	Roles    []Role         `json:"roles" gorm:"foreignKey:RealmID"`
}

type RealmMember struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	RealmID   uuid.UUID `json:"realm_id" gorm:"not null"`
	UserID    uuid.UUID `json:"user_id" gorm:"not null"`
	Nickname  string    `json:"nickname"`
	JoinedAt  time.Time `json:"joined_at"`
	
	Realm RealmUser `json:"realm" gorm:"foreignKey:RealmID"`
	User  RealmUser `json:"user" gorm:"foreignKey:UserID"`
	Roles []Role    `json:"roles" gorm:"many2many:member_roles;"`
}

type Role struct {
	ID          uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	RealmID     uuid.UUID `json:"realm_id" gorm:"not null"`
	Name        string    `json:"name" gorm:"not null"`
	Color       string    `json:"color"`
	Position    int       `json:"position"`
	Permissions int64     `json:"permissions"`
	CreatedAt   time.Time `json:"created_at"`
	
	Realm Realm `json:"realm" gorm:"foreignKey:RealmID"`
}