package main

import (
	"log"
	"os"

	"github.com/Flack74/realm-backend/internal/api/handlers"
	"github.com/Flack74/realm-backend/internal/api/middleware"
	"github.com/Flack74/realm-backend/internal/infrastructure/database"
	"github.com/Flack74/realm-backend/internal/infrastructure/websocket"
	
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	ws "github.com/gofiber/websocket/v2"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found")
	}

	realmDB, err := database.NewPostgresDB()
	if err != nil {
		log.Fatal("Failed to connect to realm database:", err)
	}

	hub := websocket.NewHub()
	go hub.Run()

	wsHandler := handlers.NewWebSocketHandler(hub)
	realmHandler := handlers.NewRealmHandler(realmDB.DB)

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000,http://localhost:5173",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true,
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	app.Use("/ws", func(c *fiber.Ctx) error {
		if ws.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws", middleware.WSAuthMiddleware(), wsHandler.HandleWebSocket)

	api := app.Group("/api/v1")
	protected := api.Group("/protected", middleware.AuthMiddleware())
	api.Use(middleware.RateLimitMiddleware())

	authHandler := handlers.NewAuthHandler(realmDB.DB)
	api.Post("/auth/register", authHandler.Register)
	api.Post("/auth/login", authHandler.Login)

	friendsHandler := handlers.NewFriendsHandler(realmDB.DB)
	messagesHandler := handlers.NewMessagesHandler(realmDB.DB)
	channelsHandler := handlers.NewChannelsHandler(realmDB.DB)
	reactionsHandler := handlers.NewReactionsHandler(realmDB.DB)

	protected.Get("/profile", authHandler.GetProfile)
	protected.Put("/profile", authHandler.UpdateProfile)
	protected.Put("/status", authHandler.UpdateStatus)

	protected.Post("/friends/request", friendsHandler.SendFriendRequest)
	protected.Post("/friends/:id/accept", friendsHandler.AcceptFriendRequest)
	protected.Get("/friends", friendsHandler.GetFriends)
	protected.Get("/friends/requests", friendsHandler.GetFriendRequests)

	protected.Post("/realms", realmHandler.CreateRealm)
	protected.Get("/realms", realmHandler.GetUserRealms)
	protected.Get("/realms/:id", realmHandler.GetRealm)
	protected.Post("/realms/:code/join", realmHandler.JoinRealm)
	protected.Delete("/realms/:id/leave", realmHandler.LeaveRealm)

	protected.Post("/realms/:realmId/channels", channelsHandler.CreateChannel)
	protected.Get("/realms/:realmId/channels", channelsHandler.GetRealmChannels)
	protected.Get("/channels/:id", channelsHandler.GetChannel)
	protected.Put("/channels/:id", channelsHandler.UpdateChannel)
	protected.Delete("/channels/:id", channelsHandler.DeleteChannel)

	protected.Post("/channels/:id/messages", messagesHandler.SendMessage)
	protected.Get("/channels/:id/messages", messagesHandler.GetMessages)
	protected.Put("/messages/:id", messagesHandler.EditMessage)
	protected.Delete("/messages/:id", messagesHandler.DeleteMessage)
	protected.Post("/messages/:id/reactions", reactionsHandler.AddReaction)
	protected.Delete("/messages/:messageId/reactions/:emoji", reactionsHandler.RemoveReaction)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}