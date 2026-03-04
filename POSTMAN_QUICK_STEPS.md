# Postman Import - Quick Steps (5 Minutes)

## 🚀 Super Quick Method

### 1️⃣ Download the JSON File
```bash
# Make sure server is running
npm run dev
```

Then in your browser:
1. Go to: `http://localhost:5000/api-docs.json`
2. Press `Ctrl+S` (Windows) or `Cmd+S` (Mac)
3. Save as: `testimonies-api.json`

### 2️⃣ Import to Postman
1. Open Postman
2. Click **"Import"** button (top left corner)
3. Click **"Upload Files"** or drag the file
4. Select `testimonies-api.json`
5. Click **"Import"**
6. ✅ Done! Collection created!

### 3️⃣ Setup Environment (2 minutes)
1. Click **"Environments"** (left sidebar, looks like an eye icon)
2. Click **"+"** to create new
3. Name: `Testimonies Dev`
4. Add these 3 variables:

```
Variable Name       | Value
--------------------|----------------------------------
base_url            | http://localhost:5000/api/v1
admin_api_key       | (paste from your .env file)
token               | (leave empty for now)
```

5. Click **"Save"**
6. Select "Testimonies Dev" from dropdown (top right)

### 4️⃣ Configure Collection Headers
1. Right-click the collection name
2. Click **"Edit"**
3. Go to **"Headers"** tab
4. Add these headers:

```
Key                 | Value
--------------------|----------------------------------
x-admin-api-key     | {{admin_api_key}}
Authorization       | Bearer {{token}}
```

5. Click **"Save"**

### 5️⃣ Test It!
1. Find **"Admin Auth"** folder
2. Open **"POST Admin login"**
3. Update body with your credentials
4. Click **"Send"**
5. Check email for OTP
6. Open **"POST Verify OTP"**
7. Enter OTP and click **"Send"**
8. Copy the `token` from response
9. Go to Environments → Edit → Paste token in `token` variable
10. Now test any other endpoint!

---

## 🎯 What If Import Fails?

### Option A: Copy-Paste Method
1. Go to: `http://localhost:5000/api-docs.json`
2. Select all (`Ctrl+A` / `Cmd+A`)
3. Copy (`Ctrl+C` / `Cmd+C`)
4. In Postman: Import → Raw text → Paste → Import

### Option B: Manual Setup (Last Resort)
If all else fails, you can manually create requests using the Swagger UI as reference:
- Swagger UI: `http://localhost:5000/api-docs`
- Copy endpoint details from there

---

## 📋 Checklist

Before testing:
- [ ] Server is running (`npm run dev`)
- [ ] Collection imported successfully
- [ ] Environment created with 3 variables
- [ ] Collection headers configured
- [ ] Environment selected (top right dropdown)

For each request:
- [ ] `x-admin-api-key` header is set
- [ ] `Authorization` header is set (after login)
- [ ] Environment variables are using `{{variable_name}}` format

---

## 🆘 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Format not supported" | Download JSON file first, don't use URL directly |
| "Invalid API key" | Check `.env` file, copy exact value to Postman |
| "Unauthorized" | Complete login flow, save token to environment |
| "404 Not Found" | Check `base_url` variable, ensure no trailing slash |
| Variables not working | Select environment from dropdown (top right) |

---

## 🎓 Your .env File

Make sure your `.env` file has:
```env
ADMIN_API_KEY=your-secret-admin-key-here
JWT_SECRET=your-jwt-secret-here
```

Copy the `ADMIN_API_KEY` value to Postman's `admin_api_key` variable.

---

**That's it! You're ready to test all admin endpoints! 🎉**

For detailed guide, see: `POSTMAN_IMPORT_GUIDE.md`
