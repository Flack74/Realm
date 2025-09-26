package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type FriendsHandler struct {
	db *gorm.DB
}

type Friend struct {
	ID       uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID   uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	FriendID uuid.UUID `json:"friend_id" gorm:"type:uuid;not null"`
	Status   string    `json:"status" gorm:"default:pending"`
	CreatedAt time.Time `json:"created_at"`
}

type FriendRequest struct {
	Username string `json:"username"`
}

func NewFriendsHandler(db *gorm.DB) *FriendsHandler {
	return &FriendsHandler{db: db}
}

func (h *FriendsHandler) SendFriendRequest(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var req FriendRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	var targetUser User
	if err := h.db.Where("username = ?", req.Username).First(&targetUser).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	if targetUser.ID == userID {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot add yourself as friend"})
	}

	var existing Friend
	if err := h.db.Where("(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)", 
		userID, targetUser.ID, targetUser.ID, userID).First(&existing).Error; err == nil {
		return c.Status(400).JSON(fiber.Map{"error": "Friend request already exists"})
	}

	friend := Friend{
		UserID:   userID,
		FriendID: targetUser.ID,
		Status:   "pending",
	}

	if err := h.db.Create(&friend).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to send friend request"})
	}

	return c.JSON(fiber.Map{"message": "Friend request sent"})
}

func (h *FriendsHandler) AcceptFriendRequest(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	requestID := c.Params("id")

	var friend Friend
	if err := h.db.Where("id = ? AND friend_id = ? AND status = ?", requestID, userID, "pending").First(&friend).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Friend request not found"})
	}

	if err := h.db.Model(&friend).Update("status", "accepted").Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to accept friend request"})
	}

	return c.JSON(fiber.Map{"message": "Friend request accepted"})
}

func (h *FriendsHandler) GetFriends(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var friends []struct {
		Friend
		User User `json:"user"`
	}

	if err := h.db.Table("friends").
		Select("friends.*, users.*").
		Joins("JOIN users ON (friends.friend_id = users.id AND friends.user_id = ?) OR (friends.user_id = users.id AND friends.friend_id = ?)", userID, userID).
		Where("friends.status = ? AND users.id != ?", "accepted", userID).
		Scan(&friends).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch friends"})
	}

	return c.JSON(friends)
}

func (h *FriendsHandler) GetFriendRequests(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var requests []struct {
		Friend
		User User `json:"user"`
	}

	if err := h.db.Table("friends").
		Select("friends.*, users.*").
		Joins("JOIN users ON friends.user_id = users.id").
		Where("friends.friend_id = ? AND friends.status = ?", userID, "pending").
		Scan(&requests).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch friend requests"})
	}

	return c.JSON(requests)
}