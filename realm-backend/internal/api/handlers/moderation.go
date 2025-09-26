package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type ModerationHandler struct {
	db *gorm.DB
}

type ModerationAction struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	RealmID   uuid.UUID `json:"realm_id" gorm:"type:uuid;not null"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	ModeratorID uuid.UUID `json:"moderator_id" gorm:"type:uuid;not null"`
	Action    string    `json:"action" gorm:"not null"`
	Reason    string    `json:"reason"`
	ExpiresAt *time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Moderator User      `json:"moderator" gorm:"foreignKey:ModeratorID"`
}

type KickRequest struct {
	Reason string `json:"reason"`
}

type BanRequest struct {
	Reason    string `json:"reason"`
	Duration  int    `json:"duration"` // hours, 0 = permanent
}

type TimeoutRequest struct {
	Reason   string `json:"reason"`
	Duration int    `json:"duration"` // minutes
}

func NewModerationHandler(db *gorm.DB) *ModerationHandler {
	return &ModerationHandler{db: db}
}

func (h *ModerationHandler) KickMember(c *fiber.Ctx) error {
	moderatorID := c.Locals("userID").(uuid.UUID)
	realmID := c.Params("realmId")
	userID := c.Params("userId")

	var req KickRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Remove from realm members
	if err := h.db.Where("realm_id = ? AND user_id = ?", realmID, userID).Delete(&struct {
		RealmID uuid.UUID `gorm:"column:realm_id"`
		UserID  uuid.UUID `gorm:"column:user_id"`
	}{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to kick member"})
	}

	// Log moderation action
	action := ModerationAction{
		RealmID:     uuid.MustParse(realmID),
		UserID:      uuid.MustParse(userID),
		ModeratorID: moderatorID,
		Action:      "kick",
		Reason:      req.Reason,
	}

	h.db.Create(&action)

	return c.JSON(fiber.Map{"message": "Member kicked successfully"})
}

func (h *ModerationHandler) BanMember(c *fiber.Ctx) error {
	moderatorID := c.Locals("userID").(uuid.UUID)
	realmID := c.Params("realmId")
	userID := c.Params("userId")

	var req BanRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var expiresAt *time.Time
	if req.Duration > 0 {
		expiry := time.Now().Add(time.Duration(req.Duration) * time.Hour)
		expiresAt = &expiry
	}

	// Remove from realm members
	h.db.Where("realm_id = ? AND user_id = ?", realmID, userID).Delete(&struct {
		RealmID uuid.UUID `gorm:"column:realm_id"`
		UserID  uuid.UUID `gorm:"column:user_id"`
	}{})

	// Log moderation action
	action := ModerationAction{
		RealmID:     uuid.MustParse(realmID),
		UserID:      uuid.MustParse(userID),
		ModeratorID: moderatorID,
		Action:      "ban",
		Reason:      req.Reason,
		ExpiresAt:   expiresAt,
	}

	if err := h.db.Create(&action).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to ban member"})
	}

	return c.JSON(fiber.Map{"message": "Member banned successfully"})
}

func (h *ModerationHandler) TimeoutMember(c *fiber.Ctx) error {
	moderatorID := c.Locals("userID").(uuid.UUID)
	realmID := c.Params("realmId")
	userID := c.Params("userId")

	var req TimeoutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	expiresAt := time.Now().Add(time.Duration(req.Duration) * time.Minute)

	action := ModerationAction{
		RealmID:     uuid.MustParse(realmID),
		UserID:      uuid.MustParse(userID),
		ModeratorID: moderatorID,
		Action:      "timeout",
		Reason:      req.Reason,
		ExpiresAt:   &expiresAt,
	}

	if err := h.db.Create(&action).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to timeout member"})
	}

	return c.JSON(fiber.Map{"message": "Member timed out successfully"})
}

func (h *ModerationHandler) UnbanMember(c *fiber.Ctx) error {
	moderatorID := c.Locals("userID").(uuid.UUID)
	realmID := c.Params("realmId")
	userID := c.Params("userId")

	// Remove active ban
	if err := h.db.Where("realm_id = ? AND user_id = ? AND action = ?", realmID, userID, "ban").Delete(&ModerationAction{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to unban member"})
	}

	// Log unban action
	action := ModerationAction{
		RealmID:     uuid.MustParse(realmID),
		UserID:      uuid.MustParse(userID),
		ModeratorID: moderatorID,
		Action:      "unban",
	}

	h.db.Create(&action)

	return c.JSON(fiber.Map{"message": "Member unbanned successfully"})
}

func (h *ModerationHandler) GetModerationLog(c *fiber.Ctx) error {
	realmID := c.Params("realmId")
	limit := c.QueryInt("limit", 50)

	var actions []ModerationAction
	if err := h.db.Where("realm_id = ?", realmID).
		Preload("User").
		Preload("Moderator").
		Order("created_at DESC").
		Limit(limit).
		Find(&actions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch moderation log"})
	}

	return c.JSON(actions)
}