# 🔐 Environment Variables Setup Guide

## 📋 Quick Overview

You need **2 environment files**:
1. `server/.env` - Backend configuration
2. `client/.env` - Frontend configuration

**⏱️ Setup Time:** ~10 minutes

---

## 🚀 Quick Start (Copy & Paste)

### Backend Setup
```bash
cd server
copy config.example.env .env
# Edit .env and add your credentials
```

### Frontend Setup
```bash
cd client
copy env.example .env
# Edit .env and add your credentials
```

---

## 📝 Step-by-Step Setup

### Step 1: Backend Environment File

**Location:** `server/.env`

**Copy from example:**
```bash
cd server
copy config.example.env .env
```

**Minimum required variables:**
```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodsaver

# Authentication (Required)
JWT_SECRET=your-random-secret-key-32-characters-minimum

# Cloud Storage (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OAuth (Optional - for Google/GitHub login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

---

### Step 2: Frontend Environment File

**Location:** `client/.env`

**Copy from example:**
```bash
cd client
copy env.example .env
```

**Required variables:**
```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# Geoapify API Key (Required for maps and location search)
VITE_GEOAPIFY_API_KEY=your-geoapify-api-key-here
```

---

## 🔑 Where to Get Each Credential

### 1. MongoDB URI ⭐ Required

**Get from MongoDB Atlas:**
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

**Add to:** `server/.env` → `MONGODB_URI=...`

---

### 2. JWT Secret ⭐ Required

**Generate a random secret (32+ characters):**

**Option 1:** Node.js (Recommended)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2:** Online generator
- Go to [randomkeygen.com](https://randomkeygen.com)
- Copy a "CodeIgniter Encryption Keys" value

**Option 3:** Manual
```
my-super-secret-jwt-key-12345-abcdefghijklmnop
```

**Add to:** `server/.env` → `JWT_SECRET=...`

---

### 3. Cloudinary Credentials ⭐ Required (for image uploads)

**Get from Cloudinary Dashboard:**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up (free tier available)
3. Go to **Dashboard**
4. You'll see 3 values:
   - **Cloud Name**: `dxxxxx` (starts with 'd')
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz123456`

**Add to:** `server/.env`
```env
CLOUDINARY_CLOUD_NAME=dxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

### 4. Geoapify API Key ⭐ Required (for maps)

**Get from Geoapify:**
1. Go to [myprojects.geoapify.com](https://myprojects.geoapify.com/)
2. Sign up (free tier: 3,000 requests/day)
3. Create a new project
4. Go to **"API Keys"** section
5. Copy your API key

**Free Tier Includes:**
- 3,000 requests/day
- Maps, Geocoding, Autocomplete
- No credit card required

**Add to:** `client/.env` → `VITE_GEOAPIFY_API_KEY=...`

**Note:** Map credentials are **only needed in frontend**, not backend!

---

### 5. Google OAuth (Optional - for Google Login)

**Get from Google Cloud Console:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google+ API** (or Google Identity API)
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. **Authorized JavaScript origins**: `http://localhost:5173`
7. **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`
8. Copy **Client ID** and **Client Secret**

**Add to:** `server/.env`
```env
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
6. Click **"Generate a new client secret"** and copy it (shown only once!)

**Add to:** `server/.env`
```env
GITHUB_CLIENT_ID=abc123def456
GITHUB_CLIENT_SECRET=abcdef1234567890abcdef1234567890abcdef12
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

---

## ✅ Minimum Required Variables

**For basic functionality (without OAuth):**

### `server/.env` (Minimum):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-random-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### `client/.env` (Minimum):
```env
VITE_API_URL=http://localhost:5000
VITE_GEOAPIFY_API_KEY=your-geoapify-api-key
```

**Note:** OAuth providers (Google/GitHub) are **optional**. Users can still register with email/password.

---

## 🧪 Test Your Configuration

### Test Backend:
```bash
cd server
npm run dev
```

**✅ Success looks like:**
```
🚀 FoodSaver API server listening on http://localhost:5000
📡 Socket.io server ready
MongoDB Connected: cluster0-shard...
```

**❌ Common Errors:**
- `MongoDB connection error` → Check `MONGODB_URI` format
- `JWT_SECRET is required` → Add `JWT_SECRET` to `.env`
- `Cloudinary error` → Verify all 3 Cloudinary values
- `Port 5000 already in use` → Change `PORT=5001` in `.env`

### Test Frontend:
```bash
cd client
npm run dev
```

**✅ Success:** Opens at `http://localhost:5173`

**❌ Common Errors:**
- `API errors` → Check `VITE_API_URL` matches backend port
- `Map not loading` → Check `VITE_GEOAPIFY_API_KEY` is set
- `CORS errors` → Verify `CLIENT_URL` in `server/.env` matches frontend URL

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** (already in `.gitignore`)
2. **Use different secrets for production**
3. **Keep JWT_SECRET long and random** (32+ characters minimum)
4. **Don't share your `.env` files publicly**
5. **Restrict API keys** when possible (IP whitelisting, domain restrictions)

---

## 📝 Setup Checklist

### Backend (`server/.env`)
- [ ] Copied `config.example.env` to `.env`
- [ ] Added `MONGODB_URI` (from MongoDB Atlas)
- [ ] Added `JWT_SECRET` (generated random string)
- [ ] Added `CLOUDINARY_CLOUD_NAME` (from Cloudinary)
- [ ] Added `CLOUDINARY_API_KEY` (from Cloudinary)
- [ ] Added `CLOUDINARY_API_SECRET` (from Cloudinary)
- [ ] Added `CLIENT_URL=http://localhost:5173`
- [ ] (Optional) Added Google OAuth credentials
- [ ] (Optional) Added GitHub OAuth credentials

### Frontend (`client/.env`)
- [ ] Copied `env.example` to `.env`
- [ ] Added `VITE_API_URL=http://localhost:5000`
- [ ] Added `VITE_GEOAPIFY_API_KEY` (from Geoapify)

### Testing
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can register/login
- [ ] Maps load correctly
- [ ] Can search for locations

---

## 🆘 Troubleshooting

### "Cannot find module" or "Module not found"
→ Make sure `.env` files are in the correct folders:
   - `server/.env` (not `server/env` or `.env` in root)
   - `client/.env` (not `client/env` or `.env` in root)

### MongoDB connection fails
→ **Check connection string format:**
   - Must include password: `mongodb+srv://user:password@...`
   - Must include database name: `...mongodb.net/foodsaver`
   - For Atlas: Make sure IP is whitelisted (add `0.0.0.0/0` for development)

### Cloudinary upload fails
→ **Verify all 3 values are correct:**
   - Cloud Name (usually starts with 'd')
   - API Key (numeric)
   - API Secret (alphanumeric)
→ Check Cloudinary dashboard for account restrictions

### Map not showing / Location search not working
→ **Check Geoapify API key:**
   - Verify `VITE_GEOAPIFY_API_KEY` is set in `client/.env`
   - Check browser console for API errors
   - Verify API key is active in Geoapify dashboard
   - Check if you've exceeded free tier limits (3,000/day)

### OAuth not working
→ **Verify callback URLs match exactly:**
   - No trailing slashes
   - Must match exactly: `http://localhost:5000/api/auth/google/callback`
   - Check OAuth apps are created correctly
   - Make sure credentials are in `server/.env` (not `client/.env`)

### JWT errors
→ **Check JWT_SECRET:**
   - Must be set in `server/.env`
   - Should be at least 32 characters
   - Restart server after adding/changing

---

## 🌍 Production Deployment

For production, update these values:

**`server/.env` (Production):**
```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://... (production database)
JWT_SECRET=your-production-secret (different from dev)
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
GITHUB_CALLBACK_URL=https://yourdomain.com/api/auth/github/callback
```

**`client/.env` (Production):**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_GEOAPIFY_API_KEY=your-production-api-key
```

---

## 📚 Additional Resources

- **MongoDB Atlas:** [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Cloudinary:** [cloudinary.com](https://cloudinary.com)
- **Geoapify:** [geoapify.com](https://www.geoapify.com)
- **Google Cloud Console:** [console.cloud.google.com](https://console.cloud.google.com)
- **GitHub OAuth:** [github.com/settings/developers](https://github.com/settings/developers)

---

## 💡 Quick Tips

1. **Start with minimum required variables** - Add OAuth later if needed
2. **Use free tiers** - All services offer free tiers sufficient for development
3. **Test incrementally** - Add one credential at a time and test
4. **Check console errors** - Browser DevTools will show specific API errors
5. **Restart servers** - After changing `.env` files, restart both servers

---

**Need more help?** Check the main [README.md](README.md) or [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for detailed setup instructions!
