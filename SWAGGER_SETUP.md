# Swagger API Documentation Setup

## Overview
Swagger documentation has been successfully set up for all Admin API endpoints in the Testimonies.com backend.

## Access Documentation

### Local Development
- **Swagger UI**: http://localhost:5000/api-docs
- **Swagger JSON**: http://localhost:5000/api-docs.json

### Production
- **Swagger UI**: https://api.testimonies.com/api-docs
- **Swagger JSON**: https://api.testimonies.com/api-docs.json

## Authentication

All admin endpoints require two headers:

1. **x-admin-api-key**: Admin API Key (required for all requests)
   - Set in environment variable: `ADMIN_API_KEY`
   - Example: `x-admin-api-key: your-admin-api-key-here`

2. **Authorization**: Bearer JWT token (required for authenticated endpoints)
   - Obtained after successful login and OTP verification
   - Example: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## API Workflow

### 1. Login Flow
```
POST /api/v1/admin/auth/login
Headers: x-admin-api-key
Body: { email, password }
→ Returns: { adminId, email }
→ OTP sent to email

POST /api/v1/admin/auth/verify-otp
Headers: x-admin-api-key
Body: { email, otp }
→ Returns: { token, admin }
→ Use this token for all subsequent requests
```

### 2. Authenticated Requests
```
GET /api/v1/admin/user
Headers: 
  - x-admin-api-key
  - Authorization: Bearer <token>
```

## API Modules

### 1. Admin Auth
- Login, Logout
- OTP Verification & Resend
- Password Reset & Change
- Profile Management

### 2. Admin Users
- List, View, Update Users
- Activate/Deactivate Users
- User Statistics

### 3. Admin Testimonies
- List, View, Flag/Unflag Testimonies
- Analytics (highest engagement, likes, replies, views)
- User engagement statistics

### 4. Admin Subscriptions
- Manage Subscription Plans (CRUD)
- View Subscribers
- Extend Subscriptions
- Plan Statistics

### 5. Admin Roles & Permissions
- Manage Permissions (CRUD)
- Manage Admins (CRUD)
- Update Admin Roles & Permissions
- Activate/Deactivate Admins

### 6. Admin Promotions
- Manage Promotions (CRUD)
- Flag/Unflag Promotions
- Activate/Deactivate Promotions

### 7. Admin Audit Logs
- View All Audit Logs (with filters)
- View Single Audit Log
- View Admin-specific Logs

### 8. Admin Data Management
- Manage FAQs (CRUD)
- Manage System Content (Privacy Policy, Terms of Service, Community Guidelines)
- Manage Team Permissions (CRUD)

## Exporting to Postman

### Method 1: Import Swagger JSON
1. Open Postman
2. Click "Import" button
3. Select "Link" tab
4. Enter: `http://localhost:5000/api-docs.json` (or production URL)
5. Click "Continue" and "Import"

### Method 2: Download and Import
1. Visit: http://localhost:5000/api-docs.json
2. Save the JSON file
3. In Postman, click "Import"
4. Select "File" tab
5. Upload the saved JSON file

### Setting Up Environment Variables in Postman
1. Create a new environment (e.g., "Testimonies Admin - Dev")
2. Add variables:
   - `base_url`: http://localhost:5000/api/v1
   - `admin_api_key`: your-admin-api-key
   - `token`: (will be set after login)

3. In collection settings, add headers:
   - `x-admin-api-key`: {{admin_api_key}}
   - `Authorization`: Bearer {{token}}

## Files Created

### Configuration
- `src/config/swagger.ts` - Swagger configuration

### Documentation Files
- `src/swagger/admin/auth.swagger.ts`
- `src/swagger/admin/audit-log.swagger.ts`
- `src/swagger/admin/user.swagger.ts`
- `src/swagger/admin/testimony.swagger.ts`
- `src/swagger/admin/subscription.swagger.ts`
- `src/swagger/admin/role-permission.swagger.ts`
- `src/swagger/admin/promotion.swagger.ts`
- `src/swagger/admin/data-management.swagger.ts`

### Modified Files
- `src/index.ts` - Added Swagger UI middleware

## Testing the API

1. Start the server:
   ```bash
   npm run dev
   ```

2. Open browser and navigate to:
   ```
   http://localhost:5000/api-docs
   ```

3. Click "Authorize" button in Swagger UI
4. Enter your Admin API Key in the `AdminApiKey` field
5. Test the login endpoint
6. Copy the JWT token from the response
7. Click "Authorize" again and enter the token in `BearerAuth` field
8. Now you can test all authenticated endpoints

## Notes

- All endpoints return consistent response format:
  ```json
  {
    "success": boolean,
    "message": string,
    "data": object
  }
  ```

- Pagination is supported on list endpoints with `page` and `limit` query parameters
- Default pagination: page=1, limit=20

## Future Enhancements

- Add user API documentation (currently only admin APIs are documented)
- Add request/response examples for all endpoints
- Add more detailed schema definitions
- Add webhook documentation if applicable
