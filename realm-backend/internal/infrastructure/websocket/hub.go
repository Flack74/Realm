package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
)

type Client struct {
	ID     uuid.UUID
	UserID uuid.UUID
	Conn   *websocket.Conn
	Send   chan []byte
}

type Hub struct {
	clients    map[uuid.UUID]*Client
	userClients map[uuid.UUID][]*Client
	realmClients map[uuid.UUID][]*Client
	channelClients map[uuid.UUID][]*Client
	Register   chan *Client
	Unregister chan *Client
	broadcast  chan []byte
	mutex      sync.RWMutex
}

type WSMessage struct {
	Type    string      `json:"type"`
	Data    interface{} `json:"data"`
	RealmID *uuid.UUID  `json:"realm_id,omitempty"`
	ChannelID *uuid.UUID `json:"channel_id,omitempty"`
	UserID  *uuid.UUID  `json:"user_id,omitempty"`
}

func NewHub() *Hub {
	return &Hub{
		clients:      make(map[uuid.UUID]*Client),
		userClients:  make(map[uuid.UUID][]*Client),
		realmClients: make(map[uuid.UUID][]*Client),
		channelClients: make(map[uuid.UUID][]*Client),
		Register:     make(chan *Client),
		Unregister:   make(chan *Client),
		broadcast:    make(chan []byte, 256),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.registerClient(client)

		case client := <-h.Unregister:
			h.unregisterClient(client)

		case message := <-h.broadcast:
			h.broadcastMessage(message)
		}
	}
}

func (h *Hub) registerClient(client *Client) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	h.clients[client.ID] = client
	h.userClients[client.UserID] = append(h.userClients[client.UserID], client)
	
	log.Printf("Client registered: %s for user: %s", client.ID, client.UserID)
}

func (h *Hub) unregisterClient(client *Client) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if _, ok := h.clients[client.ID]; ok {
		delete(h.clients, client.ID)
		close(client.Send)

		// Remove from user clients
		userClients := h.userClients[client.UserID]
		for i, c := range userClients {
			if c.ID == client.ID {
				h.userClients[client.UserID] = append(userClients[:i], userClients[i+1:]...)
				break
			}
		}

		if len(h.userClients[client.UserID]) == 0 {
			delete(h.userClients, client.UserID)
		}

		log.Printf("Client unregistered: %s for user: %s", client.ID, client.UserID)
	}
}

func (h *Hub) broadcastMessage(message []byte) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	for _, client := range h.clients {
		select {
		case client.Send <- message:
		default:
			close(client.Send)
			delete(h.clients, client.ID)
		}
	}
}

func (h *Hub) BroadcastToUser(userID uuid.UUID, message interface{}) error {
	h.mutex.RLock()
	clients := h.userClients[userID]
	h.mutex.RUnlock()

	if len(clients) == 0 {
		return nil
	}

	data, err := json.Marshal(message)
	if err != nil {
		return err
	}

	for _, client := range clients {
		select {
		case client.Send <- data:
		default:
			close(client.Send)
			delete(h.clients, client.ID)
		}
	}

	return nil
}

func (h *Hub) BroadcastToRealm(realmID uuid.UUID, message interface{}) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}

	h.mutex.RLock()
	clients := h.realmClients[realmID]
	h.mutex.RUnlock()

	for _, client := range clients {
		select {
		case client.Send <- data:
		default:
			close(client.Send)
			delete(h.clients, client.ID)
		}
	}

	return nil
}

func (h *Hub) BroadcastToChannel(channelID uuid.UUID, message interface{}) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}

	h.mutex.RLock()
	clients := h.channelClients[channelID]
	h.mutex.RUnlock()

	for _, client := range clients {
		select {
		case client.Send <- data:
		default:
			close(client.Send)
			delete(h.clients, client.ID)
		}
	}

	return nil
}

func (h *Hub) AddClientToRealm(clientID, realmID uuid.UUID) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if client, ok := h.clients[clientID]; ok {
		h.realmClients[realmID] = append(h.realmClients[realmID], client)
	}
}

func (h *Hub) AddClientToChannel(clientID, channelID uuid.UUID) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if client, ok := h.clients[clientID]; ok {
		h.channelClients[channelID] = append(h.channelClients[channelID], client)
	}
}