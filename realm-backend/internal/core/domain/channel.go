package domain

import (
	"time"
	"github.com/google/uuid"
)

type ChannelType string

const (
	ChannelTypeText  ChannelType = "text"
	ChannelTypeVoice ChannelType = "voice"
)

type Channel struct {
	ID          uuid.UUID   `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	RealmID     uuid.UUID   `json:"realm_id" gorm:"not null"`
	CategoryID  *uuid.UUID  `json:"category_id"`
	Name        string      `json:"name" gorm:"not null"`
	Type        ChannelType `json:"type" gorm:"not null"`
	Topic       string      `json:"topic"`
	Position    int         `json:"position"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	
	Realm    Realm     `json:"realm" gorm:"foreignKey:RealmID"`
	Category *Category `json:"category" gorm:"foreignKey:CategoryID"`
	Messages []Message `json:"messages" gorm:"foreignKey:ChannelID"`
}

type Category struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	RealmID   uuid.UUID `json:"realm_id" gorm:"not null"`
	Name      string    `json:"name" gorm:"not null"`
	Position  int       `json:"position"`
	CreatedAt time.Time `json:"created_at"`
	
	Realm    Realm     `json:"realm" gorm:"foreignKey:RealmID"`
	Channels []Channel `json:"channels" gorm:"foreignKey:CategoryID"`
}