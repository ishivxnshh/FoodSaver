## FoodSaver

### Overview

**FoodSaver** is a complete full-stack food waste reduction platform that connects food donors (restaurants, supermarkets, bakeries) with receivers (individuals, NGOs). The app features real-time notifications, interactive maps, QR code verification, and OAuth authentication.

### Project Structure

- **`client/`** – React + TypeScript frontend with 3D landing page, dashboards, and Mapbox integration
- **`server/`** – Node.js + Express backend with MongoDB, Socket.io, Cloudinary, and OAuth
- **Documentation** – Complete setup guides and API docs

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

# Create .npmrc to handle React dependencies
echo "legacy-peer-deps=true" > .npmrc

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

### What You Get in the Frontend

- **Sections**
  - Hero (3D scene with floating food objects)
  - About
  - Stats (animated counters)
  - Features (glassmorphism feature cards)
  - App Preview (3D phone model)
  - How It Works
  - Team
  - CTA
  - Footer

- **Visual Effects**
  - 3D hero and app preview scenes
  - Particle background
  - Smooth scroll and hover animations
  - Glassmorphism and gradient overlays
  - Loading screen with progress

---

### Customization Tips

- **Colors** – adjust Tailwind gradients in the components (e.g. `from-emerald-500 to-teal-600`) or in `tailwind.config.js`.
- **3D Objects** – tweak shapes, colors, and materials in:
  - `client/src/3d/FloatingFood.tsx`
  - `client/src/3d/HeroScene.tsx`
  - `client/src/3d/PhoneModel.tsx`
- **Copy & Content** – edit text in the React components under `client/src/components/`.

---

### Deployment

For the frontend:

- Build from `client`:

```bash
cd client
npm run build
```

- Deploy `client/dist/` to:
  - Vercel / Netlify (build command `npm run build`, output `dist`)
  - Any static host by uploading the contents of `dist`

For the backend:

- Deploy `server` to any Node-compatible host (e.g., Render, Railway, Heroku-like platforms).

---

### Troubleshooting

- **3D not showing** – check that the browser supports WebGL; try latest Chrome/Firefox/Edge.
- **Animations are slow** – close heavy tabs, ensure GPU acceleration is enabled.
- **Build issues** – from `client`:
  - Delete `node_modules/` and any lockfiles
  - Run `npm install` again

---
