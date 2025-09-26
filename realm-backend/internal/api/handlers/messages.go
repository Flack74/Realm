package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type MessagesHandler struct {
	db *gorm.DB
}

type Message struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ChannelID uuid.UUID `json:"channel_id" gorm:"type:uuid;not null"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	Content   string    `json:"content"`
	Type      string    `json:"type" gorm:"default:text"`
	ReplyTo   *uuid.UUID `json:"reply_to" gorm:"type:uuid"`
	ThreadID  *uuid.UUID `json:"thread_id" gorm:"type:uuid"`
	Pinned    bool      `json:"pinned" gorm:"default:false"`
	Edited    bool      `json:"edited" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
}

type MessageReaction struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	MessageID uuid.UUID `json:"message_id" gorm:"type:uuid;not null"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	Emoji     string    `json:"emoji" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
}

type Attachment struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	MessageID uuid.UUID `json:"message_id" gorm:"type:uuid;not null"`
	Filename  string    `json:"filename" gorm:"not null"`
	URL       string    `json:"url" gorm:"not null"`
	Size      int64     `json:"size"`
	MimeType  string    `json:"mime_type"`
	CreatedAt time.Time `json:"created_at"`
}

type SendMessageRequest struct {
	Content  string     `json:"content"`
	ReplyTo  *uuid.UUID `json:"reply_to"`
	ThreadID *uuid.UUID `json:"thread_id"`
}

type EditMessageRequest struct {
	Content string `json:"content"`
}

type ReactionRequest struct {
	Emoji string `json:"emoji"`
}

func NewMessagesHandler(db *gorm.DB) *MessagesHandler {
	return &MessagesHandler{db: db}
}

func (h *MessagesHandler) SendMessage(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	channelID := c.Params("id")

	var req SendMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Content == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Message content required"})
	}

	message := Message{
		ChannelID: uuid.MustParse(channelID),
		UserID:    userID,
		Content:   req.Content,
		ReplyTo:   req.ReplyTo,
		ThreadID:  req.ThreadID,
	}

	if err := h.db.Create(&message).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to send message"})
	}

	// Load user data
	h.db.Preload("User").First(&message, message.ID)

	return c.JSON(message)
}

func (h *MessagesHandler) GetMessages(c *fiber.Ctx) error {
	channelID := c.Params("id")
	limit := c.QueryInt("limit", 50)
	before := c.Query("before")

	query := h.db.Where("channel_id = ?", channelID).
		Preload("User").
		Order("created_at DESC").
		Limit(limit)

	if before != "" {
		if beforeTime, err := time.Parse(time.RFC3339, before); err == nil {
			query = query.Where("created_at < ?", beforeTime)
		}
	}

	var messages []Message
	if err := query.Find(&messages).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch messages"})
	}

	// Reverse to show oldest first
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return c.JSON(messages)
}

func (h *MessagesHandler) EditMessage(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	messageID := c.Params("id")

	var req EditMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var message Message
	if err := h.db.Where("id = ? AND user_id = ?", messageID, userID).First(&message).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
	}

	updates := map[string]interface{}{
		"content": req.Content,
		"edited":  true,
	}

	if err := h.db.Model(&message).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to edit message"})
	}

	return c.JSON(fiber.Map{"message": "Message updated successfully"})
}

func (h *MessagesHandler) DeleteMessage(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	messageID := c.Params("id")

	var message Message
	if err := h.db.Where("id = ? AND user_id = ?", messageID, userID).First(&message).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
	}

	if err := h.db.Delete(&message).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete message"})
	}

	return c.JSON(fiber.Map{"message": "Message deleted successfully"})
}

func (h *MessagesHandler) AddReaction(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	messageID := c.Params("id")

	var req ReactionRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Check if reaction already exists
	var existing MessageReaction
	if err := h.db.Where("message_id = ? AND user_id = ? AND emoji = ?", messageID, userID, req.Emoji).First(&existing).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"error": "Reaction already exists"})
	}

	reaction := MessageReaction{
		MessageID: uuid.MustParse(messageID),
		UserID:    userID,
		Emoji:     req.Emoji,
	}

	if err := h.db.Create(&reaction).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to add reaction"})
	}

	return c.JSON(fiber.Map{"message": "Reaction added successfully"})
}

func (h *MessagesHandler) RemoveReaction(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	messageID := c.Params("messageId")
	emoji := c.Params("emoji")

	if err := h.db.Where("message_id = ? AND user_id = ? AND emoji = ?", messageID, userID, emoji).Delete(&MessageReaction{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to remove reaction"})
	}

	return c.JSON(fiber.Map{"message": "Reaction removed successfully"})
}