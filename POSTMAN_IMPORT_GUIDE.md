# How to Import Swagger Documentation to Postman

## ✅ Method 1: Download JSON File (Recommended)

### Step 1: Start Your Server
```bash
npm run dev
```

### Step 2: Download the Swagger JSON
1. Open your browser
2. Go to: `http://localhost:5000/api-docs.json`
3. You'll see the JSON content
4. Right-click anywhere on the page
5. Select "Save As..." or press `Ctrl+S` (Windows) / `Cmd+S` (Mac)
6. Save the file as `testimonies-admin-api.json`

### Step 3: Import to Postman
1. Open Postman
2. Click the **"Import"** button (top left)
3. Click **"Upload Files"** or drag and drop
4. Select the `testimonies-admin-api.json` file you just saved
5. Click **"Import"**
6. Postman will create a new collection with all your endpoints!

---

## ✅ Method 2: Use Raw URL (Alternative)

If Method 1 doesn't work, try this:

### Step 1: Get the Raw JSON URL
Make sure your server is running, then use:
```
http://localhost:5000/api-docs.json
```

### Step 2: Import via Link
1. Open Postman
2. Click **"Import"**
3. Select **"Link"** tab
4. Paste: `http://localhost:5000/api-docs.json`
5. Click **"Continue"**
6. Click **"Import"**

**Note**: If Postman says "format not supported", it means:
- Your server might not be running
- The URL might be incorrect
- Try Method 1 instead

---

## ✅ Method 3: Copy-Paste JSON (If Above Fails)

### Step 1: Copy the JSON
1. Go to: `http://localhost:5000/api-docs.json`
2. Select all content (`Ctrl+A` / `Cmd+A`)
3. Copy (`Ctrl+C` / `Cmd+C`)

### Step 2: Import to Postman
1. Open Postman
2. Click **"Import"**
3. Select **"Raw text"** tab
4. Paste the JSON content
5. Click **"Continue"**
6. Click **"Import"**

---

## 🔧 Setting Up Postman After Import

### Step 1: Create Environment
1. Click the **"Environments"** icon (left sidebar)
2. Click **"+"** to create new environment
3. Name it: **"Testimonies Admin - Dev"**
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:5000/api/v1` | `http://localhost:5000/api/v1` |
| `admin_api_key` | `your-admin-api-key-from-env` | `your-admin-api-key-from-env` |
| `token` | (leave empty) | (leave empty) |

5. Click **"Save"**
6. Select this environment from the dropdown (top right)

### Step 2: Set Collection Variables
1. Right-click on the imported collection
2. Select **"Edit"**
3. Go to **"Variables"** tab
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `baseUrl` | `http://localhost:5000/api/v1` | `http://localhost:5000/api/v1` |

5. Click **"Save"**

### Step 3: Add Authentication Headers
1. Right-click on the collection
2. Select **"Edit"**
3. Go to **"Authorization"** tab
4. Select **"API Key"** from dropdown
5. Set:
   - Key: `x-admin-api-key`
   - Value: `{{admin_api_key}}`
   - Add to: `Header`
6. Go to **"Headers"** tab
7. Add a new header:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`
8. Click **"Save"**

---

## 🎯 Testing the Setup

### Step 1: Login
1. Find the **"Admin Auth"** folder in your collection
2. Open **"POST Admin login"** request
3. Make sure the body has:
   ```json
   {
     "email": "admin@testimonies.com",
     "password": "YourPassword123!"
   }
   ```
4. Click **"Send"**
5. Check your email for OTP

### Step 2: Verify OTP
1. Open **"POST Verify OTP and get JWT token"** request
2. Update the body with your OTP:
   ```json
   {
     "email": "admin@testimonies.com",
     "otp": "123456"
   }
   ```
3. Click **"Send"**
4. Copy the `token` from the response

### Step 3: Save Token
1. Go to your environment (top right)
2. Click the eye icon 👁️
3. Click **"Edit"**
4. Paste the token in the `token` variable's **"Current Value"**
5. Click **"Save"**

### Step 4: Test Authenticated Endpoint
1. Open any authenticated endpoint (e.g., **"GET Get all users"**)
2. Click **"Send"**
3. You should get a successful response!

---

## 🐛 Troubleshooting

### Issue: "Format not supported" when importing
**Solutions**:
1. Make sure your server is running (`npm run dev`)
2. Try Method 1 (download file first)
3. Check if the URL is correct: `http://localhost:5000/api-docs.json`
4. Try accessing the URL in your browser first to verify it works

### Issue: "Invalid API key" error
**Solutions**:
1. Check your `.env` file for `ADMIN_API_KEY`
2. Make sure the environment variable is set correctly in Postman
3. Verify the header name is `x-admin-api-key` (not `x-api-key`)

### Issue: "Unauthorized" error
**Solutions**:
1. Make sure you've completed the login flow
2. Verify the token is saved in your environment
3. Check that the Authorization header is set to `Bearer {{token}}`
4. Token expires after 2 days - login again if needed

### Issue: Requests not using environment variables
**Solutions**:
1. Make sure you've selected the environment (top right dropdown)
2. Check that variables are using double curly braces: `{{variable_name}}`
3. Verify the variable names match exactly (case-sensitive)

### Issue: Base URL is wrong
**Solutions**:
1. Check the collection variables
2. Update `baseUrl` to `http://localhost:5000/api/v1`
3. Make sure there's no trailing slash

---

## 📝 Quick Reference

### Environment Variables Needed
```
base_url = http://localhost:5000/api/v1
admin_api_key = your-admin-api-key-from-env-file
token = (set after login)
```

### Required Headers
```
x-admin-api-key: {{admin_api_key}}
Authorization: Bearer {{token}}
```

### Login Flow
```
1. POST /admin/auth/login → Get OTP via email
2. POST /admin/auth/verify-otp → Get JWT token
3. Save token to environment
4. Use token for all other requests
```

---

## 🎉 You're All Set!

Once you've completed these steps, you can:
- ✅ Test all admin endpoints
- ✅ Share the collection with your team
- ✅ Export the collection for backup
- ✅ Create different environments (dev, staging, production)

---

## 💡 Pro Tips

1. **Organize Requests**: Create folders for different workflows
2. **Use Pre-request Scripts**: Auto-refresh tokens when expired
3. **Add Tests**: Validate responses automatically
4. **Save Examples**: Save successful responses as examples
5. **Use Variables**: Store commonly used IDs as variables

---

**Need More Help?**
- Check the Swagger UI: http://localhost:5000/api-docs
- Review QUICK_START_SWAGGER.md
- Review SWAGGER_SETUP.md
