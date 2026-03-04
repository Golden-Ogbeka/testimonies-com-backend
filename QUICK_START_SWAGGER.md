# Quick Start Guide - Swagger API Documentation

## 🚀 Getting Started

### 1. Install Dependencies (Already Done)
```bash
npm install swagger-jsdoc swagger-ui-express
npm install --save-dev @types/swagger-jsdoc @types/swagger-ui-express
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Access Swagger UI
Open your browser and navigate to:
```
http://localhost:5000/api-docs
```

## 🔑 Authentication Setup

### Step 1: Get Admin API Key
1. Check your `.env` file for `ADMIN_API_KEY`
2. If not set, add it:
   ```
   ADMIN_API_KEY=your-secure-admin-api-key-here
   ```

### Step 2: Authorize in Swagger UI
1. Click the **"Authorize"** button (🔒 icon) at the top right
2. Enter your Admin API Key in the `AdminApiKey` field
3. Click **"Authorize"**
4. Click **"Close"**

### Step 3: Login and Get JWT Token
1. Expand **"Admin Auth"** section
2. Click on **POST /admin/auth/login**
3. Click **"Try it out"**
4. Enter credentials:
   ```json
   {
     "email": "admin@testimonies.com",
     "password": "YourPassword123!"
   }
   ```
5. Click **"Execute"**
6. Check your email for OTP code

### Step 4: Verify OTP
1. Click on **POST /admin/auth/verify-otp**
2. Click **"Try it out"**
3. Enter:
   ```json
   {
     "email": "admin@testimonies.com",
     "otp": "123456"
   }
   ```
4. Click **"Execute"**
5. Copy the `token` from the response

### Step 5: Add Bearer Token
1. Click **"Authorize"** button again
2. In the `BearerAuth` field, paste your token
3. Click **"Authorize"**
4. Click **"Close"**

## ✅ You're Ready!
Now you can test all authenticated endpoints in Swagger UI.

## 📥 Export to Postman

### Method 1: Direct Import
1. Open Postman
2. Click **"Import"**
3. Select **"Link"** tab
4. Enter: `http://localhost:5000/api-docs.json`
5. Click **"Continue"** → **"Import"**

### Method 2: Download JSON
1. Visit: http://localhost:5000/api-docs.json
2. Save the file
3. In Postman, click **"Import"** → **"File"**
4. Upload the saved JSON file

### Setup Postman Environment
1. Create new environment: **"Testimonies Admin - Dev"**
2. Add variables:
   ```
   base_url: http://localhost:5000/api/v1
   admin_api_key: your-admin-api-key
   token: (leave empty, will be set after login)
   ```
3. In collection settings, add headers:
   - `x-admin-api-key`: `{{admin_api_key}}`
   - `Authorization`: `Bearer {{token}}`

## 🧪 Testing Endpoints

### Example 1: Get All Users
```
GET /api/v1/admin/user?page=1&limit=20
Headers:
  x-admin-api-key: your-api-key
  Authorization: Bearer your-jwt-token
```

### Example 2: Create Subscription Plan
```
POST /api/v1/admin/subscription/plans
Headers:
  x-admin-api-key: your-api-key
  Authorization: Bearer your-jwt-token
Body:
{
  "name": "Premium Plan",
  "description": "Full access to all features",
  "price": 9999,
  "currency": "NGN",
  "billingCycle": "monthly",
  "features": ["Unlimited testimonies", "Priority support"],
  "maxUsers": 100,
  "maxTestimonies": 1000
}
```

### Example 3: Get Audit Logs
```
GET /api/v1/admin/audit-log?category=auth&level=info&page=1&limit=20
Headers:
  x-admin-api-key: your-api-key
  Authorization: Bearer your-jwt-token
```

## 📚 Available API Modules

1. **Admin Auth** - Login, OTP, Password Management, Profile
2. **Admin Users** - User Management, Statistics
3. **Admin Testimonies** - Testimony Management, Analytics
4. **Admin Subscriptions** - Plan Management, Subscriber Management
5. **Admin Roles & Permissions** - Admin Management, Permissions
6. **Admin Promotions** - Promotion Management
7. **Admin Audit Logs** - Activity Tracking
8. **Admin Data Management** - FAQs, System Content, Team Permissions

## 🔍 Common Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

### Filters
- `isActive`: Filter by active status (true/false)
- `isFlagged`: Filter by flagged status (true/false)
- `startDate`: Filter from date (ISO 8601 format)
- `endDate`: Filter to date (ISO 8601 format)

### Example with Filters
```
GET /api/v1/admin/audit-log?category=auth&level=info&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=50
```

## 🛠️ Troubleshooting

### Issue: "Invalid API key"
**Solution**: Make sure you've added the `x-admin-api-key` header with the correct value from your `.env` file.

### Issue: "Unauthorized"
**Solution**: 
1. Check if your JWT token is valid (tokens expire after 2 days)
2. Make sure you've added the token in the Authorization header
3. Try logging in again to get a fresh token

### Issue: "Validation failed"
**Solution**: Check the request body format in Swagger UI. Required fields are marked with a red asterisk (*).

### Issue: Can't see Swagger UI
**Solution**: 
1. Make sure the server is running (`npm run dev`)
2. Check if port 5000 is available
3. Try accessing: http://localhost:5000/api-docs.json to see if the spec is generated

## 📝 Response Format

All endpoints return a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🎯 Next Steps

1. ✅ Test all endpoints in Swagger UI
2. ✅ Export to Postman for team collaboration
3. ✅ Review the CONTROLLER_REVIEW.md for implementation notes
4. ✅ Check SWAGGER_SETUP.md for detailed documentation
5. ✅ Implement fixes from CONTROLLER_REVIEW.md (critical ones already done)

## 📞 Support

For issues or questions:
- Check CONTROLLER_REVIEW.md for known issues
- Review SWAGGER_SETUP.md for detailed documentation
- Contact the development team

---

**Happy Testing! 🎉**
