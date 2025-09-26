package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type VoiceHandler struct {
	db *gorm.DB
}

type VoiceState struct {
	ID         uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID     uuid.UUID  `json:"user_id" gorm:"type:uuid;not null"`
	ChannelID  *uuid.UUID `json:"channel_id" gorm:"type:uuid"`
	Muted      bool       `json:"muted" gorm:"default:false"`
	Deafened   bool       `json:"deafened" gorm:"default:false"`
	SelfMuted  bool       `json:"self_muted" gorm:"default:false"`
	SelfDeaf   bool       `json:"self_deaf" gorm:"default:false"`
	Streaming  bool       `json:"streaming" gorm:"default:false"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	User       User       `json:"user" gorm:"foreignKey:UserID"`
}

type JoinVoiceRequest struct {
	ChannelID string `json:"channel_id"`
}

type UpdateVoiceRequest struct {
	Muted     *bool `json:"muted"`
	Deafened  *bool `json:"deafened"`
	Streaming *bool `json:"streaming"`
}

func NewVoiceHandler(db *gorm.DB) *VoiceHandler {
	return &VoiceHandler{db: db}
}

func (h *VoiceHandler) JoinVoice(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var req JoinVoiceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	channelID := uuid.MustParse(req.ChannelID)

	// Remove existing voice state
	h.db.Where("user_id = ?", userID).Delete(&VoiceState{})

	// Create new voice state
	voiceState := VoiceState{
		UserID:    userID,
		ChannelID: &channelID,
	}

	if err := h.db.Create(&voiceState).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to join voice"})
	}

	h.db.Preload("User").First(&voiceState, voiceState.ID)

	return c.JSON(voiceState)
}

func (h *VoiceHandler) LeaveVoice(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	if err := h.db.Where("user_id = ?", userID).Delete(&VoiceState{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to leave voice"})
	}

	return c.JSON(fiber.Map{"message": "Left voice channel"})
}

func (h *VoiceHandler) UpdateVoiceState(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var req UpdateVoiceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	updates := map[string]interface{}{}
	if req.Muted != nil {
		updates["self_muted"] = *req.Muted
	}
	if req.Deafened != nil {
		updates["self_deaf"] = *req.Deafened
	}
	if req.Streaming != nil {
		updates["streaming"] = *req.Streaming
	}

	if err := h.db.Model(&VoiceState{}).Where("user_id = ?", userID).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update voice state"})
	}

	return c.JSON(fiber.Map{"message": "Voice state updated"})
}

func (h *VoiceHandler) GetVoiceUsers(c *fiber.Ctx) error {
	channelID := c.Params("channelId")

	var voiceStates []VoiceState
	if err := h.db.Where("channel_id = ?", channelID).Preload("User").Find(&voiceStates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get voice users"})
	}

	return c.JSON(voiceStates)
}