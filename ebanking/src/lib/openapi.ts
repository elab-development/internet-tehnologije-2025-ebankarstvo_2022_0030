export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "eBanking API",
    version: "1.0.0",
    description: "API specification for eBanking project (Next.js + PostgreSQL).",
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "ebanka_token",
        description: "JWT in httpOnly cookie (ebanka_token).",
      },
      cronBearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "CRON_SECRET",
        description: "Bearer CRON_SECRET for /api/cron/rates.",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", example: "test@example.com" },
          password: { type: "string", example: "12345678" },
        },
        required: ["email", "password"],
      },
      RegisterRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          password: { type: "string" },
          birthDate: { type: "string", example: "2000-01-01" },
          gender: { type: "string", enum: ["MALE", "FEMALE"] },
          phone: { type: "string" },
          address: { type: "string", nullable: true },
        },
        required: ["name", "email", "password", "birthDate", "gender", "phone"],
      },
      MeResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              userId: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
              address: { type: "string", nullable: true },
              birthDate: { type: "string" },
              gender: { type: "string" },
              role: { type: "string" },
              userStatus: { type: "string" },
            },
            required: ["userId", "name", "email", "phone", "birthDate", "gender", "role", "userStatus"],
          },
        },
        required: ["user"],
      },
      Account: {
        type: "object",
        properties: {
          accountId: { type: "string" },
          number: { type: "string" },
          accountType: { type: "string" },
          status: { type: "string" },
          openingDate: { type: "string" },
          userId: { type: "string" },
          balances: {
            type: "array",
            items: {
              type: "object",
              properties: {
                balanceId: { type: "string" },
                currency: { type: "string", example: "EUR" },
                amount: { type: "string", example: "100.00" },
                accountId: { type: "string" },
              },
              required: ["balanceId", "currency", "amount", "accountId"],
            },
          },
        },
        required: ["accountId", "number", "accountType", "status", "openingDate", "userId", "balances"],
      },
      TransferRequest: {
        type: "object",
        properties: {
          senderAccountId: { type: "string" },
          receiverAccountId: { type: "string" },
          fromCurrency: { type: "string", example: "EUR" },
          toCurrency: { type: "string", example: "USD" },
          amountFrom: { type: "string", example: "10.00" },
          category: {
            type: "string",
            enum: ["FOOD","FUEL","RENT","BILLS","SHOPPING","ENTERTAINMENT","HEALTH","TRANSPORT","OTHER"],
          },
          description: { type: "string", nullable: true },
        },
        required: ["senderAccountId","receiverAccountId","fromCurrency","toCurrency","amountFrom","category"],
      },
    },
  },

  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          "200": { description: "OK (cookie set)", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } } },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "409": { description: "Email exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Me",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/MeResponse" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout",
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
        },
      },
    },

    "/api/accounts": {
      get: {
        tags: ["Accounts"],
        summary: "List accounts (with balances)",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accounts: { type: "array", items: { $ref: "#/components/schemas/Account" } },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/accounts/lookup": {
      get: {
        tags: ["Accounts"],
        summary: "Lookup account by number",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "number", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "OK" },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/transactions": {
      get: {
        tags: ["Transactions"],
        summary: "List transactions (filters)",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "accountId", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", example: 50 } },
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "from", in: "query", schema: { type: "string", example: "2026-01-01" } },
          { name: "to", in: "query", schema: { type: "string", example: "2026-01-31" } },
          { name: "minAmount", in: "query", schema: { type: "string", example: "10.00" } },
          { name: "maxAmount", in: "query", schema: { type: "string", example: "1000.00" } },
        ],
        responses: {
          "200": { description: "OK" },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/transfer": {
      post: {
        tags: ["Transfer"],
        summary: "Create transfer",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/TransferRequest" } } },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "503": { description: "Exchange rate unavailable", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List users (admin)",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "OK" },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/admin/users/{userId}": {
      patch: {
        tags: ["Admin"],
        summary: "Change user status (ENABLED/DISABLED)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: { userStatus: { type: "string", enum: ["ENABLED","DISABLED"] } }, required: ["userStatus"] },
            },
          },
        },
        responses: {
          "200": { description: "OK" },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/admin/approvals/{userId}": {
      patch: {
        tags: ["Admin"],
        summary: "Approve UNREGISTERED user",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "OK" },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/analytics/spending": {
      get: {
        tags: ["Analytics"],
        summary: "Spending analytics",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "period", in: "query", schema: { type: "string", enum: ["monthly","quarterly","yearly"], default: "monthly" } },
          { name: "from", in: "query", schema: { type: "string" } },
          { name: "to", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "OK" },
          "400": { description: "Bad request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },

    "/api/cron/rates": {
      get: {
        tags: ["Cron"],
        summary: "Fetch and store exchange rates (protected by Bearer CRON_SECRET)",
        security: [{ cronBearer: [] }],
        responses: {
          "200": { description: "OK" },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "502": { description: "Upstream error" },
          "500": { description: "Internal error" },
        },
      },
    },
  },
} as const