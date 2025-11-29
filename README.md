<div align="center">

# 🌱 FoodSaver

### *Connecting surplus food with people who need it*

[![React](https://img.shields.io/badge/React-18.2-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Demo](#-demo) • [Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 🎯 Overview

**FoodSaver** is a full-stack web platform that bridges the gap between food surplus and food insecurity. We connect restaurants, supermarkets, and individuals with excess food to those who need it, reducing waste while helping communities.

### The Problem
- 🗑️ **1.3 billion tons** of food wasted globally each year
- 🌍 **811 million people** go to bed hungry every night
- 💨 Food waste accounts for **8-10%** of global greenhouse gas emissions

### Our Solution
A real-time platform where donors can instantly share surplus food with receivers nearby, featuring QR-verified pickups, live tracking, and impact metrics.

---

## ✨ Features

### 🎁 For Donors (Restaurants, Bakeries, Supermarkets)
- **Post Listings**: Upload food with images, quantity, expiry time, and location
- **Edit & Manage**: Update or remove active listings anytime
- **Claim Management**: Review incoming claims, confirm pickups
- **Dual Verification**: Verify pickups via manual 6-digit code or QR scanner
- **Impact Dashboard**: Track total food saved, CO₂ reduced, and impact score

### 🍽️ For Receivers (Individuals, NGOs, Communities)
- **Browse Food**: Search by category, dietary preferences, and distance
- **Interactive Map**: Explore available food on Google Maps with real-time locations
- **Claim System**: Reserve food items with automatic QR code generation
- **Pickup Codes**: Get unique verification codes for seamless pickup
- **Track Claims**: View all claimed food with status updates

### 🌟 Platform-Wide Features
- **🔐 Multi-Auth**: Email/password, Google OAuth, GitHub OAuth
- **🔔 Real-Time Notifications**: Socket.io-powered instant updates
- **📍 Geolocation**: Smart location-based food discovery
- **📱 QR Verification**: Secure pickup confirmation system
- **📊 Impact Metrics**: Personal dashboard showing environmental contribution
- **🎨 3D Landing Page**: Three.js hero with animated food models
- **🌓 Dark Mode**: Sleek, modern UI with Tailwind CSS
- **📸 Image Management**: Cloudinary-powered uploads with multiple images per listing

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **MongoDB** ([Atlas Free Tier](https://www.mongodb.com/cloud/atlas) or local)
- **Cloudinary Account** ([Free Tier](https://cloudinary.com/users/register/free))
- **Google Maps API Key** ([Get Key](https://developers.google.com/maps/documentation/javascript/get-api-key))

### Installation

```bash
# Clone the repository
git clone https://github.com/ishivxnshh/FoodSaver.git
cd FoodSaver

# Install dependencies for both client and server
npm install --prefix client
npm install --prefix server
```

### Environment Setup

#### Server Configuration (`server/config.example.env` → `server/.env`)
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/foodsaver

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary (Image Hosting)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret

# Server Config
PORT=5000
CLIENT_URL=http://localhost:5173
```

#### Client Configuration (`client/env.example` → `client/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Run the Application

```bash
# Terminal 1 - Start Backend Server
cd server
npm run dev
# Server running at http://localhost:5000

# Terminal 2 - Start Frontend Client
cd client
npm run dev
# Client running at http://localhost:5173
```

🎉 Open **http://localhost:5173** and create your first account!

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks and concurrent features |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast build tool and dev server |
| **React Router v6** | Client-side routing with protected routes |
| **Zustand** | Lightweight state management |
| **Google Maps API** | Interactive maps, geocoding, and places autocomplete |
| **Three.js + React Three Fiber** | 3D graphics for landing page hero |
| **Framer Motion** | Smooth animations and transitions |
| **Tailwind CSS** | Utility-first styling framework |
| **Socket.io Client** | Real-time WebSocket communication |
| **React Hot Toast** | Beautiful notification system |
| **@yudiel/react-qr-scanner** | Camera-based QR code scanning |
| **date-fns** | Date formatting and manipulation |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | RESTful API server |
| **MongoDB + Mongoose** | NoSQL database with ODM |
| **Passport.js** | Authentication middleware (JWT, Google, GitHub) |
| **Socket.io** | Real-time bidirectional communication |
| **Cloudinary SDK** | Cloud-based image storage and CDN |
| **QRCode** | QR code generation for pickups |
| **Multer** | Multipart form-data handling for uploads |
| **Bcrypt.js** | Password hashing and salting |
| **JSON Web Tokens** | Stateless authentication tokens |

---

## 📂 Project Structure

```
FoodSaver/
├── client/                    # React frontend
│   ├── src/
│   │   ├── 3d/               # Three.js 3D components
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   │   ├── donor/        # Donor-specific pages
│   │   │   └── receiver/     # Receiver-specific pages
│   │   ├── store/            # Zustand state management
│   │   ├── lib/              # API client & Socket.io
│   │   └── hooks/            # Custom React hooks
│   └── package.json
│
├── server/                   # Node.js backend
│   ├── config/              # Database, Passport, Cloudinary
│   ├── controllers/         # Request handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routes
│   ├── middleware/          # Auth, error handling, upload
│   ├── utils/               # QR code, Cloudinary helpers
│   └── index.js             # Server entry point
│
└── README.md
```

---

## 🔄 Application Flow

### 1️⃣ Donor Posts Food
```
Donor → Create Listing → Add images, details, location → Submit
→ Listing appears on map & browse page → Real-time broadcast
```

### 2️⃣ Receiver Claims Food
```
Receiver → Browse/Map → Find food → Claim with pickup time
→ QR code + 6-digit code generated → Notification sent to donor
```

### 3️⃣ Pickup Verification
```
Donor → Sees claim in "Verify Pickups" → Confirms claim
→ Receiver arrives → Shows QR/code → Donor scans/enters code
→ Claim marked complete → Stats updated (food saved, CO₂ reduced)
```

---

## 📊 Key Pages

| Page | Route | Description |
|------|-------|-------------|
| **Landing** | `/` | 3D hero, features, team, CTA |
| **Dashboard** | `/dashboard` | User home with quick actions & stats |
| **Create Listing** | `/donor/create` | Post new food donation |
| **Edit Listing** | `/donor/edit/:id` | Modify existing listings |
| **Donor Listings** | `/donor/listings` | Manage all posted food |
| **Verify Pickups** | `/donor/verify` | Confirm/verify claims with QR/code |
| **Browse Food** | `/receiver/browse` | Search available food |
| **Map View** | `/map` | Interactive Google Maps food explorer |
| **Claim Food** | `/receiver/claim/:id` | Reserve food item |
| **My Claims** | `/receiver/claims` | Track claimed food status |
| **Notifications** | `/notifications` | View all activity updates |

---

## 🔐 Authentication System

- **JWT-based** session management
- **OAuth 2.0** integration (Google, GitHub)
- **Role-based access**: `donor`, `receiver`, or `both`
- **Protected routes** with automatic redirect
- **Profile completion** flow for OAuth users

---

## 🌍 Environment Impact

Every verified pickup calculates:
- **Food Saved**: Number of completed donations
- **CO₂ Reduced**: Estimated at ~2.5 kg per serving saved
- **Impact Score**: Combined metric of items + servings donated/received

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy 'dist' folder
# Build command: npm run build
# Output directory: dist
```

**Environment Variables:**
- `VITE_API_URL`: Your production API URL
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key

### Backend (Render/Railway/Heroku)
```bash
# Deploy 'server' folder
# Build command: npm install
# Start command: node index.js
```

**Environment Variables:** All from `config.example.env` + MongoDB Atlas URI

---

## 🐛 Troubleshooting

<details>
<summary><b>Server won't start</b></summary>

- Check MongoDB connection string in `.env`
- Verify port 5000 is not in use: `netstat -ano | findstr :5000`
- Ensure all environment variables are set
</details>

<details>
<summary><b>Frontend shows blank page</b></summary>

- Check browser console for errors
- Verify `VITE_API_URL` in client `.env`
- Ensure backend is running on correct port
- Clear browser cache and reload
</details>

<details>
<summary><b>Images won't upload</b></summary>

- Verify Cloudinary credentials (all 3: cloud name, API key, secret)
- Check file size limits (default: 10MB)
- Ensure `CLOUDINARY_` env vars are correct
</details>

<details>
<summary><b>Google Maps not loading</b></summary>

- Check `VITE_GOOGLE_MAPS_API_KEY` is valid
- Enable required APIs: Maps JavaScript API, Places API, Geocoding API
- Verify API key restrictions and billing account
</details>

<details>
<summary><b>Socket.io connection errors</b></summary>

- Verify `CLIENT_URL` in server `.env` matches frontend URL
- Check CORS configuration in `server/index.js`
- Ensure WebSocket traffic is allowed (check firewall/proxy)
</details>

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style (TypeScript + ESLint)
- Write meaningful commit messages
- Test features thoroughly before submitting
- Update documentation for new features

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Three.js** for stunning 3D graphics
- **MongoDB** for flexible NoSQL database
- **Cloudinary** for seamless image management
- **Google Maps** for geolocation services
- **Socket.io** for real-time capabilities
- All contributors making food waste reduction possible

---

<div align="center">

### 🌟 Star this repo if you find it helpful!

**Built with ❤️ to reduce food waste and create a sustainable future**

[Report Bug](https://github.com/ishivxnshh/FoodSaver/issues) • [Request Feature](https://github.com/ishivxnshh/FoodSaver/issues) • [Documentation](https://github.com/ishivxnshh/FoodSaver/wiki)

</div>
