# API Reference

## Authentication

All admin API endpoints require two headers:

### Headers Required

```
x-admin-api-key: <your_api_key>
x-jwt-token: <your_jwt_token>
```

The `x-jwt-token` is obtained after successful login and OTP verification.

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "message": "Success message",
  "data": { /* response data */ },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Error Response
```json
{
  "message": "Error message",
  "code": "ERROR_CODE",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Error Codes

- `INVALID_CREDENTIALS` - Login failed with invalid credentials
- `INVALID_OR_EXPIRED_OTP` - OTP is invalid or expired
- `API_KEY_REQUIRED` - Missing x-admin-api-key header
- `INVALID_API_KEY` - Invalid API key provided
- `UNAUTHORIZED` - Not authenticated or token expired
- `ACCESS_DENIED` - Authenticated but not authorized for resource
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `ALREADY_EXISTS` - Resource already exists
- `INTERNAL_ERROR` - Server error occurred
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Rate Limiting

- **General**: 500 requests per 15 minutes per IP
- **Authentication**: 10 requests per 15 minutes per IP

When rate limited, you'll receive a 429 response:
```json
{
  "message": "Too many requests from this IP. Try again in 15 minutes",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## Request ID Tracking

Every request includes an `x-request-id` header (UUID) for tracking and debugging. This is automatically added and returned in all responses for correlation.

## Health Check

```
GET /health
```

Returns application health status:
```json
{
  "status": "ok|degraded|down",
  "timestamp": "2026-03-04T20:00:00.000Z",
  "mongo": "connected|disconnected|error",
  "uptimeSeconds": 3600
}
```

## Common HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created
- `204 No Content` - Successful request with no response body
- `400 Bad Request` - Invalid request format
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily down

## Pagination

List endpoints support pagination:

### Query Parameters
- `page` - Page number (default: 1, min: 1)
- `limit` - Items per page (default: 20, max: 100)

### Response Format
```json
{
  "message": "Success",
  "data": [ /* items */ ],
  "meta": {
    "totalDocs": 250,
    "limit": 20,
    "totalPages": 13,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  }
}
```

## Filtering

Most list endpoints support filtering via query parameters:

```
GET /api/v1/testimonies?status=published&page=1&limit=20
```

## Date Format

All dates should be in ISO 8601 format:
```
2026-03-04T20:00:00Z
```

## API Versioning

The API is versioned with the version in the URL path:
```
/api/v1/...
```

This ensures backward compatibility when introducing breaking changes.
