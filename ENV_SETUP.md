# 🔐 Environment Variables Setup Guide

## 📋 Quick Overview

You need **2 environment files**:
1. `server/.env` - Backend configuration
2. `client/.env` - Frontend configuration

---

## 🚀 Step-by-Step Setup

### Step 1: Create Backend `.env` File

**Location:** `server/.env`

**Method 1 (Recommended):** Copy the example file
```bash
cd server
copy config.example.env .env
```

**Method 2:** Create manually
```bash
cd server
# Create new file named .env
```

**Then paste this template:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB - Get from mongodb.com/cloud/atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodsaver

# JWT Secret - Generate random string (keep this secret!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# GitHub OAuth (Optional - for GitHub login)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

# Cloudinary - Get from cloudinary.com dashboard
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Mapbox (Optional - only if backend needs geocoding)
MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

---

### Step 2: Create Frontend `.env` File

**Location:** `client/.env`

**Method 1 (Recommended):** Copy the example file
```bash
cd client
copy env.example .env
```

**Method 2:** Create manually
```bash
cd client
# Create new file named .env
```

**Then paste this template:**
```env
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=your-mapbox-access-token-here
```

---

## 🔑 Where to Get Each Credential

### 1. MongoDB URI (Required)

**Get it from MongoDB Atlas:**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (free tier available)
3. Create a new cluster (free M0 tier)
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `<dbname>` with `foodsaver`

**Example:**
```
mongodb+srv://myuser:mypassword123@cluster0.xxxxx.mongodb.net/foodsaver?retryWrites=true&w=majority
```

**For local MongoDB:**
```
mongodb://localhost:27017/foodsaver
```

---

### 2. JWT Secret (Required)

**Generate a random secret string:**

**Option 1:** Use Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2:** Use online generator
- Go to [randomkeygen.com](https://randomkeygen.com)
- Copy a "CodeIgniter Encryption Keys" value

**Option 3:** Use any random string (at least 32 characters)
```
my-super-secret-jwt-key-12345-abcdefghijklmnop
```

---

### 3. Cloudinary Credentials (Required for Image Uploads)

**Get from Cloudinary Dashboard:**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up (free tier available)
3. Go to **Dashboard**
4. You'll see:
   - **Cloud Name**: `dxxxxx` (starts with 'd')
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz123456`

**Copy all 3 values to your `server/.env`**

---

### 4. Mapbox Token (Required for Maps)

**Get from Mapbox:**
1. Go to [mapbox.com](https://www.mapbox.com)
2. Sign up (free tier: 50,000 map loads/month)
3. Go to **Account** → **Access tokens**
4. Copy your **Default Public Token** (starts with `pk.eyJ1...`)

**Add to BOTH files:**
- `server/.env` → `MAPBOX_ACCESS_TOKEN=...`
- `client/.env` → `VITE_MAPBOX_TOKEN=...`

---

### 5. Google OAuth (Optional - for Google Login)

**Get from Google Cloud Console:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret**

**Add to `server/.env`:**
```
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

---

### 6. GitHub OAuth (Optional - for GitHub Login)

**Get from GitHub:**
1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: `FoodSaver`
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Click **"Register application"**
5. Copy **Client ID**
6. Click **"Generate a new client secret"** and copy it

**Add to `server/.env`:**
```
GITHUB_CLIENT_ID=abc123def456
GITHUB_CLIENT_SECRET=abcdef1234567890abcdef1234567890abcdef12
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

---

## ✅ Minimum Required Variables

**For basic functionality, you MUST have:**

### `server/.env` (Minimum):
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-random-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLIENT_URL=http://localhost:5173
```

### `client/.env` (Minimum):
```env
VITE_API_URL=http://localhost:5000
VITE_MAPBOX_TOKEN=pk.eyJ1...
```

**Note:** OAuth (Google/GitHub) is optional. Users can still register with email/password.

---

## 🧪 Test Your Configuration

### Test Backend:
```bash
cd server
npm run dev
```

**Success looks like:**
```
🚀 FoodSaver API server listening on http://localhost:5000
📡 Socket.io server ready
MongoDB Connected: cluster0-shard...
```

**Errors to watch for:**
- `MongoDB connection error` → Check `MONGODB_URI`
- `Cloudinary error` → Check all 3 Cloudinary variables
- `Port 5000 already in use` → Change `PORT=5001` in `.env`

### Test Frontend:
```bash
cd client
npm run dev
```

**Success:** Opens at `http://localhost:5173`

**Errors to watch for:**
- `API errors` → Check `VITE_API_URL` matches backend port
- `Map not loading` → Check `VITE_MAPBOX_TOKEN`

---

## 🔒 Security Notes

1. **Never commit `.env` files to Git** (already in `.gitignore`)
2. **Use different secrets for production**
3. **Keep JWT_SECRET long and random** (32+ characters)
4. **Don't share your `.env` files publicly**

---

## 📝 Quick Checklist

- [ ] Created `server/.env` from `config.example.env`
- [ ] Added MongoDB URI
- [ ] Added JWT Secret (random string)
- [ ] Added Cloudinary credentials (3 values)
- [ ] Added Mapbox token
- [ ] Created `client/.env` from `env.example`
- [ ] Added `VITE_API_URL=http://localhost:5000`
- [ ] Added `VITE_MAPBOX_TOKEN` (same as server)
- [ ] (Optional) Added Google OAuth credentials
- [ ] (Optional) Added GitHub OAuth credentials
- [ ] Tested backend starts without errors
- [ ] Tested frontend starts without errors

---

## 🆘 Troubleshooting

### "Cannot find module" errors
→ Make sure `.env` files are in the correct folders (`server/` and `client/`)

### MongoDB connection fails
→ Check your connection string includes password and database name
→ For Atlas: Make sure IP is whitelisted (0.0.0.0/0 for development)

### Cloudinary upload fails
→ Verify all 3 values (cloud name, API key, API secret) are correct
→ Check Cloudinary dashboard for any account restrictions

### Map not showing
→ Verify Mapbox token starts with `pk.eyJ1...`
→ Check browser console for token errors
→ Make sure token is in both `server/.env` and `client/.env`

### OAuth not working
→ Verify callback URLs match exactly (no trailing slashes)
→ Check that OAuth apps are created correctly
→ Make sure credentials are in `server/.env` (not `client/.env`)

---

**Need help?** Check the main [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for more details!

