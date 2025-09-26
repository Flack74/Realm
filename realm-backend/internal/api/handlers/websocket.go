package handlers

import (
	"encoding/json"
	"log"

	"github.com/Flack74/realm-backend/internal/infrastructure/websocket"
	"github.com/gofiber/fiber/v2"
	ws "github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
)

type WebSocketHandler struct {
	hub *websocket.Hub
}

func NewWebSocketHandler(hub *websocket.Hub) *WebSocketHandler {
	return &WebSocketHandler{hub: hub}
}

func (h *WebSocketHandler) HandleWebSocket(c *fiber.Ctx) error {
	return ws.New(func(conn *ws.Conn) {
		userID := c.Locals("userID").(uuid.UUID)
		clientID := uuid.New()

		client := &websocket.Client{
			ID:     clientID,
			UserID: userID,
			Conn:   conn,
			Send:   make(chan []byte, 256),
		}

		h.hub.Register <- client

		go h.writePump(client)
		h.readPump(client)
	})(c)
}

func (h *WebSocketHandler) readPump(client *websocket.Client) {
	defer func() {
		h.hub.Unregister <- client
		client.Conn.Close()
	}()

	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			if ws.IsUnexpectedCloseError(err, ws.CloseGoingAway, ws.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		var wsMsg websocket.WSMessage
		if err := json.Unmarshal(message, &wsMsg); err != nil {
			log.Printf("Error unmarshaling WebSocket message: %v", err)
			continue
		}

		h.handleMessage(client, &wsMsg)
	}
}

func (h *WebSocketHandler) writePump(client *websocket.Client) {
	defer client.Conn.Close()

	for message := range client.Send {
		if err := client.Conn.WriteMessage(ws.TextMessage, message); err != nil {
			log.Printf("WebSocket write error: %v", err)
			return
		}
	}
}

func (h *WebSocketHandler) handleMessage(client *websocket.Client, msg *websocket.WSMessage) {
	switch msg.Type {
	case "join_realm":
		if msg.RealmID != nil {
			h.hub.AddClientToRealm(client.ID, *msg.RealmID)
		}
	case "join_channel":
		if msg.ChannelID != nil {
			h.hub.AddClientToChannel(client.ID, *msg.ChannelID)
		}
	case "typing_start":
		h.broadcastTyping(client, msg, true)
	case "typing_stop":
		h.broadcastTyping(client, msg, false)
	}
}

func (h *WebSocketHandler) broadcastTyping(client *websocket.Client, msg *websocket.WSMessage, isTyping bool) {
	typingMsg := websocket.WSMessage{
		Type: "typing",
		Data: map[string]interface{}{
			"user_id":   client.UserID,
			"is_typing": isTyping,
		},
		ChannelID: msg.ChannelID,
	}

	if msg.ChannelID != nil {
		h.hub.BroadcastToChannel(*msg.ChannelID, typingMsg)
	}
}