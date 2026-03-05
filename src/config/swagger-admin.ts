import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Testimonies.com Admin API",
      version: "1.0.0",
      description:
        "Admin API documentation for Testimonies.com platform.\n\n" +
        "## Authentication Requirements\n\n" +
        "### 1. API Key Authentication (Required for all endpoints)\n" +
        "- **Header**: `x-admin-api-key`\n" +
        "- **Type**: Admin API Key\n" +
        "- Include this header in every API request\n\n" +
        "### 2. JWT Token Authentication (Required for protected admin endpoints)\n" +
        "- **Header**: `x-jwt-token`\n" +
        "- **Type**: JWT token obtained after admin login and OTP verification\n" +
        "- Enter the token directly (no 'Bearer' prefix needed)\n" +
        "- Required for endpoints that need admin identity verification\n\n" +
        "## Usage\n" +
        "- All requests must include the `x-admin-api-key` header\n" +
        "- Protected endpoints require both `x-admin-api-key` and `x-jwt-token` headers\n" +
        "- For login/authentication endpoints, only `x-admin-api-key` is needed initially\n" +
        "- After successful login, use the returned JWT token in the `x-jwt-token` header",
      contact: {
        name: "API Support",
        email: "support@testimonies.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
        description: "Development server",
      },
      {
        url: "https://api.testimonies.com/api/v1",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        AdminApiKey: {
          type: "apiKey",
          in: "header",
          name: "x-admin-api-key",
          description:
            "Admin API Key - Required for all requests. Contact support to obtain your API key. Include this in the x-admin-api-key header.",
        },
        BearerAuth: {
          type: "apiKey",
          in: "header",
          name: "x-jwt-token",
          description:
            "JWT Authentication - Required for protected endpoints. Obtain by logging in with credentials and completing OTP verification. Paste the token directly in the x-jwt-token header (without 'Bearer' prefix).",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Error message",
            },
            code: {
              type: "string",
              example: "VALIDATION_ERROR",
            },
            requestId: {
              type: "string",
              example: "3f1d9d9f-2aef-4c89-bd29-0190d6f6ea55",
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Validation failed",
            },
            code: {
              type: "string",
              example: "VALIDATION_ERROR",
            },
            requestId: {
              type: "string",
              example: "3f1d9d9f-2aef-4c89-bd29-0190d6f6ea55",
            },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            totalResults: { type: "number" },
            resultsPerPage: { type: "number" },
            totalPages: { type: "number" },
            currentPage: { type: "number" },
            prevPage: { type: "number", nullable: true },
            nextPage: { type: "number", nullable: true },
          },
        },
        StandardSuccessResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Resource retrieved successfully",
            },
            data: { type: "object" },
            requestId: {
              type: "string",
              example: "3f1d9d9f-2aef-4c89-bd29-0190d6f6ea55",
            },
          },
        },
      },
    },
    security: [
      {
        AdminApiKey: [],
      },
    ],
  },
  apis: ["./src/api/v1/routes/admin/*.ts", "./src/swagger/admin/*.ts"],
};

export const swaggerSpecAdmin = swaggerJsdoc(options);
