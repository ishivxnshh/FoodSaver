# 🌱 FoodSaver

> A complete full-stack platform connecting food donors with receivers to reduce food waste.

## ⚡ Quick Start

**First time?** → Read **[START_HERE.md](START_HERE.md)** for 3-minute setup!

```bash
# Terminal 1 - Backend
cd server && npm install && npm run dev

# Terminal 2 - Frontend  
cd client && npm install && npm run dev
```

Open: **http://localhost:5173**

---

## 🎯 What This Is

**FoodSaver** connects:
- **Donors** (restaurants, supermarkets, bakeries) who have surplus food
- **Receivers** (individuals, NGOs) who need food

**Key Features:**
- 🔐 Multiple auth options (Email, Google, GitHub)
- 📸 Image uploads via Cloudinary
- 🗺️ Interactive Mapbox maps
- 📱 QR code verification
- 🔔 Real-time Socket.io notifications
- 🌍 Geolocation-based search

---

### Quick Start (5 Minutes)

#### Prerequisites

- Node.js **16+**
- MongoDB (local or [MongoDB Atlas](https://mongodb.com/cloud/atlas))
- [Cloudinary account](https://cloudinary.com) (free tier)
- [Mapbox account](https://mapbox.com) (free tier)

#### Step 1: Backend Setup

```bash
cd server
npm install

# Create .env file (copy from config.example.env)
# Add your MongoDB URI, JWT secret, and Cloudinary credentials

npm run dev
```

Backend runs at `http://localhost:5000`

#### Step 2: Frontend Setup

```bash
cd client
npm install

# Create .env file (copy from env.example)
# Add: VITE_API_URL=http://localhost:5000
# Add: VITE_MAPBOX_TOKEN=your-token

npm run dev
```

Frontend runs at `http://localhost:5173`

#### Step 3: Test the App

1. Open `http://localhost:5173`
2. Click "Get Started" → Register
3. Access dashboard
4. Try posting food (donor) or browsing food (receiver)

---

### Complete Feature List

#### ✅ Core Features
- **Multi-Auth System**: Email/password, Google OAuth, GitHub OAuth
- **Food Donation**: Post surplus food with images, location, dietary info
- **Food Discovery**: Browse, search, and filter available food
- **Interactive Map**: Mapbox integration showing real food locations
- **Smart Claiming**: QR code-based pickup verification system
- **Real-time Updates**: Socket.io notifications for claims, pickups
- **Image Management**: Cloudinary-powered image uploads
- **Geolocation**: Find food within custom radius

#### Tech Stack

**Frontend:**
- React 18 + TypeScript
- React Router for navigation
- Zustand for state management
- Mapbox GL for maps
- Three.js for 3D graphics
- Framer Motion for animations
- TailwindCSS for styling
- Socket.io client for real-time
- Axios for API calls

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Passport.js (JWT, Google, GitHub)
- Socket.io for WebSocket
- Cloudinary for images
- QR code generation
- Bcrypt for passwords
- Multer for file uploads

---

### Application Pages

#### Landing Page
- 3D hero with floating food objects
- About section with mission cards
- Animated statistics
- Features showcase
- How it works flow
- Call-to-action

#### User Features
**Donors** (Restaurants, Stores):
- Post food listings with images
- Manage active donations
- Verify pickups with QR codes
- Track impact statistics

**Receivers** (Individuals, NGOs):
- Browse available food
- Search by location & dietary needs
- Claim food items
- Get QR codes for pickup
- Track claim history

**Everyone**:
- Interactive map view
- Real-time notifications
- Profile management
- OAuth login (Google, GitHub)

---

### Deployment

**Frontend (Vercel/Netlify)**:
```bash
cd client
npm run build
# Deploy 'dist' folder
# Set build command: npm run build
# Set output directory: dist
```

**Backend (Render/Railway)**:
- Deploy `server` folder
- Add all environment variables
- Use MongoDB Atlas for production

---

### Troubleshooting

**Backend**:
- MongoDB error → Check `MONGODB_URI` in `.env`
- Cloudinary fails → Verify 3 credentials (cloud name, api key, api secret)
- OAuth issues → Callback URLs must match exactly

**Frontend**:
- Blank page → Check browser console for errors, ensure React 18.2.0 is installed
- API errors → Ensure backend running on port 5000
- Map empty → Add valid `VITE_MAPBOX_TOKEN`

**General**:
- CORS errors → Check `CLIENT_URL` in server `.env`
- Socket not connecting → Verify Socket.io ports match

---

## 📚 Documentation

- **[START_HERE.md](START_HERE.md)** ⭐ Start here for quick setup!
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Detailed setup guide
- **[FEATURES.md](FEATURES.md)** - Complete feature list
- **[server/README.md](server/README.md)** - API documentation

---

## 🎓 Tech Stack Summary

**Frontend**: React, TypeScript, Vite, Router, Zustand, Mapbox, Three.js, Framer Motion, Tailwind

**Backend**: Node.js, Express, MongoDB, Passport, Socket.io, Cloudinary, JWT

---

**Built with ❤️ to reduce food waste and build a sustainable future**
