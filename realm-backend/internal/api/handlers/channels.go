package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type ChannelsHandler struct {
	db *gorm.DB
}

type Channel struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	RealmID     uuid.UUID `json:"realm_id" gorm:"type:uuid;not null"`
	Name        string    `json:"name" gorm:"not null"`
	Type        string    `json:"type" gorm:"default:text"`
	Topic       string    `json:"topic"`
	Position    int       `json:"position" gorm:"default:0"`
	CategoryID  *uuid.UUID `json:"category_id" gorm:"type:uuid"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateChannelRequest struct {
	Name       string     `json:"name"`
	Type       string     `json:"type"`
	Topic      string     `json:"topic"`
	CategoryID *uuid.UUID `json:"category_id"`
}

func NewChannelsHandler(db *gorm.DB) *ChannelsHandler {
	return &ChannelsHandler{db: db}
}

func (h *ChannelsHandler) CreateChannel(c *fiber.Ctx) error {
	realmID := c.Params("realmId")

	var req CreateChannelRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Channel name required"})
	}

	channelType := req.Type
	if channelType == "" {
		channelType = "text"
	}

	channel := Channel{
		RealmID:    uuid.MustParse(realmID),
		Name:       req.Name,
		Type:       channelType,
		Topic:      req.Topic,
		CategoryID: req.CategoryID,
	}

	if err := h.db.Create(&channel).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create channel"})
	}

	return c.JSON(channel)
}

func (h *ChannelsHandler) GetRealmChannels(c *fiber.Ctx) error {
	realmID := c.Params("realmId")

	var channels []Channel
	if err := h.db.Where("realm_id = ?", realmID).Order("position ASC, created_at ASC").Find(&channels).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch channels"})
	}

	return c.JSON(channels)
}

func (h *ChannelsHandler) GetChannel(c *fiber.Ctx) error {
	channelID := c.Params("id")

	var channel Channel
	if err := h.db.Where("id = ?", channelID).First(&channel).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Channel not found"})
	}

	return c.JSON(channel)
}

func (h *ChannelsHandler) UpdateChannel(c *fiber.Ctx) error {
	channelID := c.Params("id")

	var req CreateChannelRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Topic != "" {
		updates["topic"] = req.Topic
	}

	if err := h.db.Model(&Channel{}).Where("id = ?", channelID).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update channel"})
	}

	return c.JSON(fiber.Map{"message": "Channel updated successfully"})
}

func (h *ChannelsHandler) DeleteChannel(c *fiber.Ctx) error {
	channelID := c.Params("id")

	if err := h.db.Where("id = ?", channelID).Delete(&Channel{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete channel"})
	}

	return c.JSON(fiber.Map{"message": "Channel deleted successfully"})
}