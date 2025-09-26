package ports

import (
	"github.com/Flack74/realm-backend/internal/core/domain"
	"github.com/google/uuid"
)

type UserRepository interface {
	Create(user *domain.RealmUser) error
	GetByID(id uuid.UUID) (*domain.RealmUser, error)
	GetByAuthUserID(authUserID uuid.UUID) (*domain.RealmUser, error)
	GetByUsername(username string) (*domain.RealmUser, error)
	Update(user *domain.RealmUser) error
	UpdateStatus(userID uuid.UUID, status domain.UserStatus) error
}

type RealmRepository interface {
	Create(realm *domain.Realm) error
	GetByID(id uuid.UUID) (*domain.Realm, error)
	GetByUserID(userID uuid.UUID) ([]*domain.Realm, error)
	GetByInviteCode(code string) (*domain.Realm, error)
	Update(realm *domain.Realm) error
	Delete(id uuid.UUID) error
	AddMember(member *domain.RealmMember) error
	RemoveMember(realmID, userID uuid.UUID) error
	GetMembers(realmID uuid.UUID) ([]*domain.RealmMember, error)
}

type ChannelRepository interface {
	Create(channel *domain.Channel) error
	GetByID(id uuid.UUID) (*domain.Channel, error)
	GetByRealmID(realmID uuid.UUID) ([]*domain.Channel, error)
	Update(channel *domain.Channel) error
	Delete(id uuid.UUID) error
}

type MessageRepository interface {
	Create(message *domain.Message) error
	GetByID(id uuid.UUID) (*domain.Message, error)
	GetByChannelID(channelID uuid.UUID, limit, offset int) ([]*domain.Message, error)
	Update(message *domain.Message) error
	Delete(id uuid.UUID) error
	AddReaction(reaction *domain.MessageReaction) error
	RemoveReaction(messageID, userID uuid.UUID, emoji string) error
}

type DirectMessageRepository interface {
	Create(dm *domain.DirectMessage) error
	GetByID(id uuid.UUID) (*domain.DirectMessage, error)
	GetConversation(userID1, userID2 uuid.UUID, limit, offset int) ([]*domain.DirectMessage, error)
	Update(dm *domain.DirectMessage) error
	Delete(id uuid.UUID) error
}

type FriendRepository interface {
	Create(friend *domain.Friend) error
	GetByID(id uuid.UUID) (*domain.Friend, error)
	GetFriends(userID uuid.UUID) ([]*domain.Friend, error)
	GetPendingRequests(userID uuid.UUID) ([]*domain.Friend, error)
	UpdateStatus(id uuid.UUID, status string) error
	Delete(id uuid.UUID) error
}