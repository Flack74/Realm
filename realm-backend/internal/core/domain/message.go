package domain

import (
	"time"
	"github.com/google/uuid"
)

type MessageType string

const (
	MessageTypeText   MessageType = "text"
	MessageTypeImage  MessageType = "image"
	MessageTypeFile   MessageType = "file"
	MessageTypeSystem MessageType = "system"
)

type Message struct {
	ID          uuid.UUID   `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	ChannelID   uuid.UUID   `json:"channel_id" gorm:"not null"`
	UserID      uuid.UUID   `json:"user_id" gorm:"not null"`
	Content     string      `json:"content"`
	Type        MessageType `json:"type" gorm:"default:'text'"`
	EditedAt    *time.Time  `json:"edited_at"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	
	Channel     Channel           `json:"channel" gorm:"foreignKey:ChannelID"`
	User        RealmUser         `json:"user" gorm:"foreignKey:UserID"`
	Reactions   []MessageReaction `json:"reactions" gorm:"foreignKey:MessageID"`
	Attachments []Attachment      `json:"attachments" gorm:"foreignKey:MessageID"`
}

type MessageReaction struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	MessageID uuid.UUID `json:"message_id" gorm:"not null"`
	UserID    uuid.UUID `json:"user_id" gorm:"not null"`
	Emoji     string    `json:"emoji" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	
	Message Message   `json:"message" gorm:"foreignKey:MessageID"`
	User    RealmUser `json:"user" gorm:"foreignKey:UserID"`
}

type Attachment struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	MessageID uuid.UUID `json:"message_id" gorm:"not null"`
	Filename  string    `json:"filename" gorm:"not null"`
	URL       string    `json:"url" gorm:"not null"`
	Size      int64     `json:"size"`
	MimeType  string    `json:"mime_type"`
	CreatedAt time.Time `json:"created_at"`
	
	Message Message `json:"message" gorm:"foreignKey:MessageID"`
}

type DirectMessage struct {
	ID          uuid.UUID   `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	SenderID    uuid.UUID   `json:"sender_id" gorm:"not null"`
	RecipientID uuid.UUID   `json:"recipient_id" gorm:"not null"`
	Content     string      `json:"content"`
	Type        MessageType `json:"type" gorm:"default:'text'"`
	EditedAt    *time.Time  `json:"edited_at"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	
	Sender      RealmUser         `json:"sender" gorm:"foreignKey:SenderID"`
	Recipient   RealmUser         `json:"recipient" gorm:"foreignKey:RecipientID"`
	Reactions   []DMReaction      `json:"reactions" gorm:"foreignKey:MessageID"`
	Attachments []DMAttachment    `json:"attachments" gorm:"foreignKey:MessageID"`
}

type DMReaction struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	MessageID uuid.UUID `json:"message_id" gorm:"not null"`
	UserID    uuid.UUID `json:"user_id" gorm:"not null"`
	Emoji     string    `json:"emoji" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	
	Message DirectMessage `json:"message" gorm:"foreignKey:MessageID"`
	User    RealmUser     `json:"user" gorm:"foreignKey:UserID"`
}

type DMAttachment struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	MessageID uuid.UUID `json:"message_id" gorm:"not null"`
	Filename  string    `json:"filename" gorm:"not null"`
	URL       string    `json:"url" gorm:"not null"`
	Size      int64     `json:"size"`
	MimeType  string    `json:"mime_type"`
	CreatedAt time.Time `json:"created_at"`
	
	Message DirectMessage `json:"message" gorm:"foreignKey:MessageID"`
}