package handlers

import (
	"github.com/Flack74/realm-backend/internal/core/domain"
	"github.com/Flack74/realm-backend/internal/core/ports"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type UserHandler struct {
	userService ports.UserService
}

func NewUserHandler(userService ports.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

type CreateUserProfileRequest struct {
	Username    string `json:"username" validate:"required,min=3,max=32"`
	DisplayName string `json:"display_name" validate:"max=32"`
}

func (h *UserHandler) CreateProfile(c *fiber.Ctx) error {
	authUserID := c.Locals("userID").(uuid.UUID)

	var req CreateUserProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	user, err := h.userService.CreateUser(authUserID, req.Username, req.DisplayName)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(201).JSON(user)
}

func (h *UserHandler) GetProfile(c *fiber.Ctx) error {
	authUserID := c.Locals("userID").(uuid.UUID)

	user, err := h.userService.GetUserByAuthID(authUserID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Profile not found"})
	}

	return c.JSON(user)
}

func (h *UserHandler) UpdateStatus(c *fiber.Ctx) error {
	authUserID := c.Locals("userID").(uuid.UUID)

	var req struct {
		Status string `json:"status" validate:"required,oneof=online idle dnd invisible"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	user, err := h.userService.GetUserByAuthID(authUserID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	err = h.userService.UpdateUserStatus(user.ID, domain.UserStatus(req.Status))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Status updated successfully"})
}