package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type RolesHandler struct {
	db *gorm.DB
}

type Role struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	RealmID     uuid.UUID `json:"realm_id" gorm:"type:uuid;not null"`
	Name        string    `json:"name" gorm:"not null"`
	Color       string    `json:"color" gorm:"default:#99aab5"`
	Position    int       `json:"position" gorm:"default:0"`
	Permissions int64     `json:"permissions" gorm:"default:0"`
	Mentionable bool      `json:"mentionable" gorm:"default:true"`
	Hoisted     bool      `json:"hoisted" gorm:"default:false"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type MemberRole struct {
	ID       uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID   uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	RealmID  uuid.UUID `json:"realm_id" gorm:"type:uuid;not null"`
	RoleID   uuid.UUID `json:"role_id" gorm:"type:uuid;not null"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateRoleRequest struct {
	Name        string `json:"name"`
	Color       string `json:"color"`
	Permissions int64  `json:"permissions"`
	Mentionable bool   `json:"mentionable"`
	Hoisted     bool   `json:"hoisted"`
}

type UpdateRoleRequest struct {
	Name        string `json:"name"`
	Color       string `json:"color"`
	Permissions int64  `json:"permissions"`
	Mentionable *bool  `json:"mentionable"`
	Hoisted     *bool  `json:"hoisted"`
	Position    *int   `json:"position"`
}

const (
	PermissionViewChannels    = 1 << 0
	PermissionSendMessages    = 1 << 1
	PermissionManageMessages  = 1 << 2
	PermissionManageChannels  = 1 << 3
	PermissionManageRoles     = 1 << 4
	PermissionKickMembers     = 1 << 5
	PermissionBanMembers      = 1 << 6
	PermissionAdministrator   = 1 << 7
	PermissionConnect         = 1 << 8
	PermissionSpeak           = 1 << 9
	PermissionMuteMembers     = 1 << 10
	PermissionDeafenMembers   = 1 << 11
	PermissionMoveMembers     = 1 << 12
)

func NewRolesHandler(db *gorm.DB) *RolesHandler {
	return &RolesHandler{db: db}
}

func (h *RolesHandler) CreateRole(c *fiber.Ctx) error {
	realmID := c.Params("realmId")

	var req CreateRoleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Role name required"})
	}

	role := Role{
		RealmID:     uuid.MustParse(realmID),
		Name:        req.Name,
		Color:       req.Color,
		Permissions: req.Permissions,
		Mentionable: req.Mentionable,
		Hoisted:     req.Hoisted,
	}

	if role.Color == "" {
		role.Color = "#99aab5"
	}

	if err := h.db.Create(&role).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create role"})
	}

	return c.JSON(role)
}

func (h *RolesHandler) GetRealmRoles(c *fiber.Ctx) error {
	realmID := c.Params("realmId")

	var roles []Role
	if err := h.db.Where("realm_id = ?", realmID).Order("position DESC, created_at ASC").Find(&roles).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch roles"})
	}

	return c.JSON(roles)
}

func (h *RolesHandler) UpdateRole(c *fiber.Ctx) error {
	roleID := c.Params("roleId")

	var req UpdateRoleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Color != "" {
		updates["color"] = req.Color
	}
	if req.Permissions != 0 {
		updates["permissions"] = req.Permissions
	}
	if req.Mentionable != nil {
		updates["mentionable"] = *req.Mentionable
	}
	if req.Hoisted != nil {
		updates["hoisted"] = *req.Hoisted
	}
	if req.Position != nil {
		updates["position"] = *req.Position
	}

	if err := h.db.Model(&Role{}).Where("id = ?", roleID).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update role"})
	}

	return c.JSON(fiber.Map{"message": "Role updated successfully"})
}

func (h *RolesHandler) DeleteRole(c *fiber.Ctx) error {
	roleID := c.Params("roleId")

	// Remove role from all members
	h.db.Where("role_id = ?", roleID).Delete(&MemberRole{})

	// Delete the role
	if err := h.db.Where("id = ?", roleID).Delete(&Role{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete role"})
	}

	return c.JSON(fiber.Map{"message": "Role deleted successfully"})
}

func (h *RolesHandler) AssignRole(c *fiber.Ctx) error {
	realmID := c.Params("realmId")
	userID := c.Params("userId")
	roleID := c.Params("roleId")

	memberRole := MemberRole{
		UserID:  uuid.MustParse(userID),
		RealmID: uuid.MustParse(realmID),
		RoleID:  uuid.MustParse(roleID),
	}

	if err := h.db.Create(&memberRole).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to assign role"})
	}

	return c.JSON(fiber.Map{"message": "Role assigned successfully"})
}

func (h *RolesHandler) RemoveRole(c *fiber.Ctx) error {
	userID := c.Params("userId")
	roleID := c.Params("roleId")

	if err := h.db.Where("user_id = ? AND role_id = ?", userID, roleID).Delete(&MemberRole{}).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to remove role"})
	}

	return c.JSON(fiber.Map{"message": "Role removed successfully"})
}