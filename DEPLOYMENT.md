# 🚀 Deployment Guide - FoodSaver

This guide will help you deploy FoodSaver to production using **Render** (Backend) and **Vercel** (Frontend).

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with your FoodSaver repository
- ✅ [Render account](https://render.com) (free tier available)
- ✅ [Vercel account](https://vercel.com) (free tier available)
- ✅ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free tier)
- ✅ Cloudinary account with credentials
- ✅ Google Maps API key
- ✅ (Optional) Google/GitHub OAuth credentials for production

---

## 🗄️ Part 1: Set Up MongoDB Atlas

### 1. Create Production Database

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (or use existing)
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/foodsaver?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Replace `foodsaver` with your database name

### 2. Configure Network Access

1. Go to **Network Access** in MongoDB Atlas
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

---

## 🖥️ Part 2: Deploy Backend to Render

### Option A: Deploy via GitHub (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to [Render Dashboard](https://dashboard.render.com/)**

3. **Create New Web Service**:
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select the **FoodSaver** repository

4. **Configure Service**:
   ```
   Name: foodsaver-api
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: node index.js
   Instance Type: Free
   ```

5. **Add Environment Variables**:
   Click **"Environment"** tab and add:
   
   ```env
   NODE_ENV=production
   
   # Database
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/foodsaver
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-api-url.onrender.com/api/auth/google/callback
   
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GITHUB_CALLBACK_URL=https://your-api-url.onrender.com/api/auth/github/callback
   
   # Server Config
   PORT=5000
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

6. **Deploy**:
   - Click **"Create Web Service"**
   - Wait for deployment (5-10 minutes)
   - **Copy your Render URL**: e.g., `https://foodsaver-abc123.onrender.com`

7. **Update Environment Variables** (after getting your Render URL):
   - Go to **Environment** tab
   - Update `GOOGLE_CALLBACK_URL` with your actual Render URL
   - Update `GITHUB_CALLBACK_URL` with your actual Render URL
   - Update `CLIENT_URL` with your Vercel URL (after frontend deployment)
   - Click **"Save Changes"**
   
   **⚠️ Important**: Saving environment variables will automatically trigger a redeploy. Wait for it to complete.

### Option B: Deploy via render.yaml

1. The `render.yaml` file is already included in the server folder
2. Go to Render Dashboard → **"New +"** → **"Blueprint"**
3. Connect repository and select `server/render.yaml`
4. Add environment variables in Render dashboard

---

## 🌐 Part 3: Deploy Frontend to Vercel

### 1. Prepare Frontend

Update the API URL for production. You have two options:

**Option A: Use Environment Variable (Recommended)**
- No code changes needed
- Set `VITE_API_URL` in Vercel dashboard

**Option B: Create Production Config**

Create `client/.env.production`:
```env
VITE_API_URL=https://your-api-url.onrender.com
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 2. Deploy to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Import Project**:
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Select the **FoodSaver** repository

3. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**:
   ```env
   VITE_API_URL=https://your-api-url.onrender.com
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

5. **Deploy**:
   - Click **"Deploy"**
   - Wait for build (2-5 minutes)
   - Your app will be at: `https://your-project.vercel.app`

---

## 🔄 Part 4: Update OAuth Callbacks (If Using)

### Google OAuth Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project → **"Credentials"**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized Redirect URIs**:
   ```
   https://your-api-url.onrender.com/api/auth/google/callback
   ```

### GitHub OAuth Settings

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App
3. Update **Authorization callback URL**:
   ```
   https://your-api-url.onrender.com/api/auth/github/callback
   ```

---

## 🔄 Part 5: Update Backend CORS & Client URL

After deploying frontend, update backend environment variables on Render:

1. Go to Render Dashboard → Your Service → **Environment**
2. Update `CLIENT_URL`:
   ```
   CLIENT_URL=https://your-project.vercel.app
   ```
3. Click **"Save Changes"** (will trigger redeploy)

---

## ✅ Part 6: Verify Deployment

### Test Backend API

Open in browser:
```
https://your-api-url.onrender.com/health
```

Should return:
```json
{
  "status": "ok",
  "message": "FoodSaver API is running"
}
```

### Test Frontend

1. Visit `https://your-project.vercel.app`
2. Register a new account
3. Create a food listing (test image upload)
4. Browse food on map
5. Test claim flow

---

## 🐛 Troubleshooting

### Backend Issues

<details>
<summary><b>Deployment fails on Render</b></summary>

- Check build logs for errors
- Verify `package.json` is in server folder
- Ensure all environment variables are set
- Check MongoDB connection string format
</details>

<details>
<summary><b>API returns 500 errors</b></summary>

- Check Render logs: Dashboard → Your Service → **Logs**
- Verify MongoDB Atlas network access (0.0.0.0/0)
- Ensure all required env vars are present
- Check Cloudinary credentials
</details>

<details>
<summary><b>Images won't upload</b></summary>

- Verify all 3 Cloudinary env vars are correct
- Check Cloudinary account is active
- Test with small image first
</details>

### Frontend Issues

<details>
<summary><b>Blank page on Vercel</b></summary>

- Check browser console for errors
- Verify build logs in Vercel
- Ensure `VITE_API_URL` is set correctly
- Check if backend is running
</details>

<details>
<summary><b>API calls fail (CORS errors)</b></summary>

- Verify `CLIENT_URL` in backend matches Vercel URL exactly
- No trailing slash in URLs
- Check browser network tab for actual error
</details>

<details>
<summary><b>Google Maps not loading</b></summary>

- Verify `VITE_GOOGLE_MAPS_API_KEY` is set
- Enable required APIs in Google Cloud Console
- Check browser console for specific error
</details>

<details>
<summary><b>Socket.io disconnects</b></summary>

- WebSockets work on Render free tier but may have delays
- Check backend logs for connection errors
- Verify CORS settings include WebSocket
</details>

---

## 📊 Monitoring & Logs

### Render Logs
- Dashboard → Your Service → **Logs** tab
- Real-time log streaming
- Filter by severity

### Vercel Logs
- Dashboard → Your Project → **Deployments**
- Click deployment → **View Function Logs**

---

## 🔧 Continuous Deployment

Both Render and Vercel support automatic deployments:

- **Push to GitHub** → Auto-deploy on both platforms
- Configure branch settings in each platform's dashboard
- Enable/disable auto-deploy as needed

---

## 💰 Cost Optimization

### Free Tier Limits

**Render Free Tier:**
- ✅ 750 hours/month
- ⚠️ Spins down after 15 min inactivity (cold starts)
- ⚠️ Limited bandwidth

**Vercel Free Tier:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions

**MongoDB Atlas Free Tier:**
- ✅ 512MB storage
- ✅ Shared cluster

### Tips to Stay Free
- Use MongoDB Atlas free tier
- Accept cold starts on Render
- Optimize image sizes before upload
- Monitor bandwidth usage

---

## 🚀 Upgrade Options

When you need more:

### Render Paid Plans ($7/month+)
- No cold starts
- More memory/CPU
- Custom domains

### Vercel Pro ($20/month)
- More bandwidth
- Team features
- Analytics

---

## 📝 Production Checklist

Before going live:

- [ ] MongoDB Atlas network access configured
- [ ] All environment variables set (both platforms)
- [ ] OAuth callback URLs updated
- [ ] CORS/CLIENT_URL configured correctly
- [ ] Test full user flow (register → post → claim → verify)
- [ ] Test image uploads
- [ ] Test Google Maps functionality
- [ ] Test real-time notifications
- [ ] Check mobile responsiveness
- [ ] Set up error monitoring (optional: Sentry)
- [ ] Configure custom domain (optional)

---

## 🎉 Success!

Your FoodSaver app is now live! Share your URLs:

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-api-url.onrender.com`

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

**Need help?** Open an issue on GitHub or check the troubleshooting section above.

**Good luck with your deployment! 🚀**
