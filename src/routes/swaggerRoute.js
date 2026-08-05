const router = require("express").Router();
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const spec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Atlas AI API",
      version: "1.0.0",
      description: "Backend API for Atlas — AI-powered Telegram assistant",
    },
    servers: [{ url: process.env.BASE_URL || "http://localhost:5000" }],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            telegramId: { type: "string" },
            username: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
          },
        },
        Preference: {
          type: "object",
          properties: {
            id: { type: "integer" },
            UserId: { type: "integer" },
            profile: {
              type: "object",
              properties: {
                profession: { type: "string" },
                industries: { type: "array", items: { type: "string" } },
                companies: { type: "array", items: { type: "string" } },
                briefing: { type: "string", enum: ["morning", "evening", "both"] },
                notification: { type: "string", enum: ["important", "all", "none"] },
              },
            },
            onboardingCompleted: { type: "boolean" },
          },
        },
        Conversation: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            role: { type: "string", enum: ["user", "assistant", "system"] },
            message: { type: "string" },
            intent: { type: "string", enum: ["onboarding", "chat", "finance", "settings"] },
            isArchived: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        WatchlistItem: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            company: { type: "string" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          responses: {
            200: {
              description: "Server is running",
              content: {
                "application/json": {
                  schema: {
                    allOf: [
                      { $ref: "#/components/schemas/ApiResponse" },
                      {
                        properties: {
                          data: {
                            type: "object",
                            properties: {
                              uptime: { type: "number" },
                              timestamp: { type: "string", format: "date-time" },
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      "/auth/google": {
        get: {
          tags: ["Auth"],
          summary: "Initiate Google OAuth2 flow",
          parameters: [
            {
              name: "telegramId",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Telegram user ID to associate the calendar with",
            },
          ],
          responses: {
            302: { description: "Redirects to Google OAuth consent screen" },
            400: { description: "Missing telegramId" },
          },
        },
      },
      "/auth/google/callback": {
        get: {
          tags: ["Auth"],
          summary: "Google OAuth2 callback",
          parameters: [
            { name: "code", in: "query", required: true, schema: { type: "string" } },
            { name: "state", in: "query", required: true, schema: { type: "string" }, description: "telegramId passed as state" },
          ],
          responses: {
            200: { description: "Calendar connected successfully" },
            400: { description: "Invalid callback parameters" },
            404: { description: "User not found" },
            500: { description: "OAuth error" },
          },
        },
      },
      "/users/{telegramId}": {
        get: {
          tags: ["Users"],
          summary: "Get user by Telegram ID",
          parameters: [
            { name: "telegramId", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "User found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
            404: { description: "User not found" },
          },
        },
      },
      "/preferences/{userId}": {
        get: {
          tags: ["Preferences"],
          summary: "Get user preferences",
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: {
              description: "Preferences returned",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
        patch: {
          tags: ["Preferences"],
          summary: "Update user profile preferences",
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Preference" },
              },
            },
          },
          responses: {
            200: { description: "Preferences updated" },
          },
        },
      },
      "/conversation/{userId}": {
        get: {
          tags: ["Conversation"],
          summary: "Get recent conversation history for a user",
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
            { name: "intent", in: "query", schema: { type: "string", enum: ["chat", "onboarding", "finance", "settings"] } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: {
              description: "Conversation messages",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
        delete: {
          tags: ["Conversation"],
          summary: "Clear all conversation history for a user",
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Conversation cleared" },
          },
        },
      },
      "/watchlist/{userId}": {
        get: {
          tags: ["Watchlist"],
          summary: "Get all watchlist companies for a user",
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: {
              description: "Watchlist items",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } } },
            },
          },
        },
        post: {
          tags: ["Watchlist"],
          summary: "Add a company to watchlist",
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { company: { type: "string" } },
                  required: ["company"],
                },
              },
            },
          },
          responses: {
            200: { description: "Company added" },
          },
        },
        delete: {
          tags: ["Watchlist"],
          summary: "Remove a company from watchlist",
          parameters: [
            { name: "userId", in: "path", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { company: { type: "string" } },
                  required: ["company"],
                },
              },
            },
          },
          responses: {
            200: { description: "Company removed" },
          },
        },
      },
    },
  },
  apis: [],
});

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));

module.exports = router;
