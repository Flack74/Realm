package ports

import (
	"github.com/Flack74/realm-backend/internal/core/domain"
	"github.com/google/uuid"
)

type UserService interface {
	CreateUser(authUserID uuid.UUID, username, displayName string) (*domain.RealmUser, error)
	GetUser(id uuid.UUID) (*domain.RealmUser, error)
	GetUserByAuthID(authUserID uuid.UUID) (*domain.RealmUser, error)
	UpdateUser(user *domain.RealmUser) error
	UpdateUserStatus(userID uuid.UUID, status domain.UserStatus) error
	UploadAvatar(userID uuid.UUID, file []byte, filename string) (string, error)
}

type RealmService interface {
	CreateRealm(ownerID uuid.UUID, name, description string) (*domain.Realm, error)
	GetRealm(id uuid.UUID) (*domain.Realm, error)
	GetUserRealms(userID uuid.UUID) ([]*domain.Realm, error)
	UpdateRealm(realm *domain.Realm) error
	DeleteRealm(id uuid.UUID) error
	GenerateInviteCode(realmID uuid.UUID) (string, error)
	JoinRealm(userID uuid.UUID, inviteCode string) error
	LeaveRealm(userID, realmID uuid.UUID) error
	GetRealmMembers(realmID uuid.UUID) ([]*domain.RealmMember, error)
}

type ChannelService interface {
	CreateChannel(realmID uuid.UUID, name string, channelType domain.ChannelType) (*domain.Channel, error)
	GetChannel(id uuid.UUID) (*domain.Channel, error)
	GetRealmChannels(realmID uuid.UUID) ([]*domain.Channel, error)
	UpdateChannel(channel *domain.Channel) error
	DeleteChannel(id uuid.UUID) error
}

type MessageService interface {
	SendMessage(channelID, userID uuid.UUID, content string, messageType domain.MessageType) (*domain.Message, error)
	GetMessages(channelID uuid.UUID, limit, offset int) ([]*domain.Message, error)
	EditMessage(messageID uuid.UUID, content string) error
	DeleteMessage(messageID uuid.UUID) error
	AddReaction(messageID, userID uuid.UUID, emoji string) error
	RemoveReaction(messageID, userID uuid.UUID, emoji string) error
}

type DirectMessageService interface {
	SendDirectMessage(senderID, recipientID uuid.UUID, content string) (*domain.DirectMessage, error)
	GetConversation(userID1, userID2 uuid.UUID, limit, offset int) ([]*domain.DirectMessage, error)
	EditDirectMessage(messageID uuid.UUID, content string) error
	DeleteDirectMessage(messageID uuid.UUID) error
}

type FriendService interface {
	SendFriendRequest(userID, friendID uuid.UUID) error
	AcceptFriendRequest(requestID uuid.UUID) error
	RejectFriendRequest(requestID uuid.UUID) error
	RemoveFriend(userID, friendID uuid.UUID) error
	GetFriends(userID uuid.UUID) ([]*domain.Friend, error)
	GetPendingRequests(userID uuid.UUID) ([]*domain.Friend, error)
}

type WebSocketService interface {
	BroadcastToRealm(realmID uuid.UUID, message interface{}) error
	BroadcastToChannel(channelID uuid.UUID, message interface{}) error
	SendToUser(userID uuid.UUID, message interface{}) error
	HandleConnection(userID uuid.UUID, conn interface{}) error
	HandleDisconnection(userID uuid.UUID) error
}

type NotificationService interface {
	SendPushNotification(userID uuid.UUID, title, body string) error
	SendEmailNotification(email, subject, body string) error
}