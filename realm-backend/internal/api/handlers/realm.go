package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type RealmHandler struct {
	db *gorm.DB
}

type Realm struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string    `json:"name" gorm:"not null"`
	Description string    `json:"description"`
	OwnerID     uuid.UUID `json:"owner_id" gorm:"type:uuid;not null"`
	InviteCode  string    `json:"invite_code" gorm:"unique;not null"`
	CreatedAt   time.Time `json:"created_at"`
}

type RealmMember struct {
	ID      uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	RealmID uuid.UUID `json:"realm_id" gorm:"type:uuid;not null"`
	UserID  uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	JoinedAt time.Time `json:"joined_at"`
}

type CreateRealmRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func NewRealmHandler(db *gorm.DB) *RealmHandler {
	return &RealmHandler{db: db}
}

func (h *RealmHandler) CreateRealm(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	
	var req CreateRealmRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Realm name is required"})
	}

	realm := Realm{
		Name:        req.Name,
		Description: req.Description,
		OwnerID:     userID,
		InviteCode:  uuid.New().String()[:8],
	}

	if err := h.db.Create(&realm).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create realm"})
	}

	// Add owner as member
	member := RealmMember{
		RealmID: realm.ID,
		UserID:  userID,
	}
	h.db.Create(&member)

	return c.JSON(realm)
}

func (h *RealmHandler) GetUserRealms(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var realms []Realm
	if err := h.db.Joins("JOIN realm_members ON realms.id = realm_members.realm_id").
		Where("realm_members.user_id = ?", userID).
		Find(&realms).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch realms"})
	}

	return c.JSON(realms)
}

func (h *RealmHandler) GetRealm(c *fiber.Ctx) error {
	realmID := c.Params("id")
	userID := c.Locals("userID").(uuid.UUID)

	// Check if user is member
	var member RealmMember
	if err := h.db.Where("realm_id = ? AND user_id = ?", realmID, userID).First(&member).Error; err != nil {
		return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
	}

	var realm Realm
	if err := h.db.Where("id = ?", realmID).First(&realm).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Realm not found"})
	}

	return c.JSON(realm)
}

func (h *RealmHandler) JoinRealm(c *fiber.Ctx) error {
	inviteCode := c.Params("code")
	userID := c.Locals("userID").(uuid.UUID)

	var realm Realm
	if err := h.db.Where("invite_code = ?", inviteCode).First(&realm).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Invalid invite code"})
	}

	// Check if already member
	var existing RealmMember
	if err := h.db.Where("realm_id = ? AND user_id = ?", realm.ID, userID).First(&existing).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"error": "Already a member"})
	}

	member := RealmMember{
		RealmID: realm.ID,
		UserID:  userID,
	}

	if err := h.db.Create(&member).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to join realm"})
	}

	return c.JSON(fiber.Map{"message": "Successfully joined realm"})
}

func (h *RealmHandler) LeaveRealm(c *fiber.Ctx) error {
	realmID := c.Params("id")
	userID := c.Locals("userID").(uuid.UUID)

	if err := h.db.Where("realm_id = ? AND user_id = ?", realmID, userID).Delete(&RealmMember{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to leave realm"})
	}

	return c.JSON(fiber.Map{"message": "Successfully left realm"})
}