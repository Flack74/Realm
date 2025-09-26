package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type NotificationsHandler struct {
	db *gorm.DB
}

type Notification struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	Type      string    `json:"type" gorm:"not null"`
	Title     string    `json:"title" gorm:"not null"`
	Message   string    `json:"message"`
	Data      string    `json:"data"`
	Read      bool      `json:"read" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
}

func NewNotificationsHandler(db *gorm.DB) *NotificationsHandler {
	return &NotificationsHandler{db: db}
}

func (h *NotificationsHandler) GetNotifications(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	limit := c.QueryInt("limit", 50)

	var notifications []Notification
	if err := h.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Find(&notifications).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch notifications"})
	}

	return c.JSON(notifications)
}

func (h *NotificationsHandler) MarkAsRead(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)
	notificationID := c.Params("id")

	if err := h.db.Model(&Notification{}).
		Where("id = ? AND user_id = ?", notificationID, userID).
		Update("read", true).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to mark as read"})
	}

	return c.JSON(fiber.Map{"message": "Notification marked as read"})
}

func (h *NotificationsHandler) MarkAllAsRead(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	if err := h.db.Model(&Notification{}).
		Where("user_id = ? AND read = ?", userID, false).
		Update("read", true).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to mark all as read"})
	}

	return c.JSON(fiber.Map{"message": "All notifications marked as read"})
}

func (h *NotificationsHandler) GetUnreadCount(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var count int64
	if err := h.db.Model(&Notification{}).
		Where("user_id = ? AND read = ?", userID, false).
		Count(&count).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get unread count"})
	}

	return c.JSON(fiber.Map{"count": count})
}

func (h *NotificationsHandler) CreateNotification(userID uuid.UUID, notifType, title, message, data string) error {
	notification := Notification{
		UserID:  userID,
		Type:    notifType,
		Title:   title,
		Message: message,
		Data:    data,
	}

	return h.db.Create(&notification).Error
}