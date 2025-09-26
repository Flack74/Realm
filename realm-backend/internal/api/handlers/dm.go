package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type DMHandler struct {
	db *gorm.DB
}

type DirectMessage struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SenderID    uuid.UUID `json:"sender_id" gorm:"type:uuid;not null"`
	RecipientID uuid.UUID `json:"recipient_id" gorm:"type:uuid;not null"`
	Content     string    `json:"content" gorm:"not null"`
	Type        string    `json:"type" gorm:"default:text"`
	EditedAt    *time.Time `json:"edited_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Sender      User      `json:"sender" gorm:"foreignKey:SenderID"`
	Recipient   User      `json:"recipient" gorm:"foreignKey:RecipientID"`
}

type DMConversation struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	User1ID      uuid.UUID `json:"user1_id" gorm:"type:uuid;not null"`
	User2ID      uuid.UUID `json:"user2_id" gorm:"type:uuid;not null"`
	LastMessage  string    `json:"last_message"`
	LastActivity time.Time `json:"last_activity"`
	CreatedAt    time.Time `json:"created_at"`
	User1        User      `json:"user1" gorm:"foreignKey:User1ID"`
	User2        User      `json:"user2" gorm:"foreignKey:User2ID"`
}

type SendDMRequest struct {
	Content string `json:"content"`
}

func NewDMHandler(db *gorm.DB) *DMHandler {
	return &DMHandler{db: db}
}

func (h *DMHandler) SendDirectMessage(c *fiber.Ctx) error {
	senderID := c.Locals("userID").(uuid.UUID)
	receiverID := c.Params("userId")

	var req SendDMRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Content == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Message content required"})
	}

	dm := DirectMessage{
		SenderID:    senderID,
		RecipientID: uuid.MustParse(receiverID),
		Content:     req.Content,
	}

	if err := h.db.Create(&dm).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to send message"})
	}

	// Update or create conversation
	h.updateConversation(senderID, uuid.MustParse(receiverID), req.Content)

	// Load sender data
	h.db.Preload("Sender").Preload("Recipient").First(&dm, dm.ID)

	return c.JSON(dm)
}

func (h *DMHandler) GetConversation(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	otherUserID := c.Params("userId")
	limit := c.QueryInt("limit", 50)

	var messages []DirectMessage
	if err := h.db.Where("(sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)",
		userID, otherUserID, otherUserID, userID).
		Preload("Sender").
		Preload("Recipient").
		Order("created_at DESC").
		Limit(limit).
		Find(&messages).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch messages"})
	}

	// Reverse to show oldest first
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return c.JSON(messages)
}

func (h *DMHandler) GetConversations(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var conversations []DMConversation
	if err := h.db.Where("user1_id = ? OR user2_id = ?", userID, userID).
		Preload("User1").
		Preload("User2").
		Order("last_activity DESC").
		Find(&conversations).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch conversations"})
	}

	return c.JSON(conversations)
}

func (h *DMHandler) EditDirectMessage(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	messageID := c.Params("messageId")

	var req SendDMRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var dm DirectMessage
	if err := h.db.Where("id = ? AND sender_id = ?", messageID, userID).First(&dm).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
	}

	updates := map[string]interface{}{
		"content": req.Content,
		"edited":  true,
	}

	if err := h.db.Model(&dm).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to edit message"})
	}

	return c.JSON(fiber.Map{"message": "Message updated successfully"})
}

func (h *DMHandler) DeleteDirectMessage(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	messageID := c.Params("messageId")

	var dm DirectMessage
	if err := h.db.Where("id = ? AND sender_id = ?", messageID, userID).First(&dm).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Message not found"})
	}

	if err := h.db.Delete(&dm).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete message"})
	}

	return c.JSON(fiber.Map{"message": "Message deleted successfully"})
}

func (h *DMHandler) updateConversation(user1ID, user2ID uuid.UUID, lastMessage string) {
	// Ensure consistent ordering
	if user1ID.String() > user2ID.String() {
		user1ID, user2ID = user2ID, user1ID
	}

	var conversation DMConversation
	if err := h.db.Where("user1_id = ? AND user2_id = ?", user1ID, user2ID).First(&conversation).Error; err != nil {
		// Create new conversation
		conversation = DMConversation{
			User1ID:      user1ID,
			User2ID:      user2ID,
			LastMessage:  lastMessage,
			LastActivity: time.Now(),
		}
		h.db.Create(&conversation)
	} else {
		// Update existing conversation
		h.db.Model(&conversation).Updates(map[string]interface{}{
			"last_message":  lastMessage,
			"last_activity": time.Now(),
		})
	}
}