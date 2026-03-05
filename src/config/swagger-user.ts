import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Testimonies.com User API",
      version: "1.0.0",
      description:
        "User API documentation for Testimonies.com platform.\n\n" +
        "## Authentication Requirements\n\n" +
        "### 1. API Key Authentication (Required for all endpoints)\n" +
        "- **Header**: `x-api-key`\n" +
        "- **Type**: Client API Key\n" +
        "- Include this header in every API request\n\n" +
        "### 2. JWT Token Authentication (Required for protected endpoints)\n" +
        "- **Header**: `x-jwt-token`\n" +
        "- **Type**: JWT token obtained after user signup/login\n" +
        "- Enter the token directly (no 'Bearer' prefix needed)\n" +
        "- Required for endpoints that need user identity verification",
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
        ApiKey: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "Client API Key - Required for all requests.",
        },
        BearerAuth: {
          type: "apiKey",
          in: "header",
          name: "x-jwt-token",
          description:
            "JWT Authentication - Required for protected user endpoints.",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error message" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            totalDocs: { type: "number" },
            limit: { type: "number" },
            totalPages: { type: "number" },
            page: { type: "number" },
            pagingCounter: { type: "number" },
            hasPrevPage: { type: "boolean" },
            hasNextPage: { type: "boolean" },
            prevPage: { type: "number", nullable: true },
            nextPage: { type: "number", nullable: true },
          },
        },
      },
    },
    security: [{ ApiKey: [] }],
  },
  apis: ["./src/api/v1/routes/user/*.ts", "./src/swagger/user/*.ts"],
};

export const swaggerSpecUser = swaggerJsdoc(options);
