## FoodSaver

### Overview

FoodSaver is a production-ready 3D marketing website for a food waste–reduction app, built with **React**, **TypeScript**, **Three.js**, **Framer Motion**, and **TailwindCSS**.  
The repository is now structured as a simple monorepo with separate **client** (frontend) and **server** (backend) folders.

### Project Structure

- **`client/`** – Vite + React + TypeScript 3D landing page (the UI you see in the browser)
- **`server/`** – Minimal Express API skeleton with a health check route
- Additional docs:
  - `PROJECT_SUMMARY.md` – High-level feature/section overview
  - `FEATURES_LIST.txt` – Feature checklist and ideas

---

### Quick Start (2 Minutes)

#### 1. Prerequisites

- Node.js **16+**
- npm (bundled with Node)

#### 2. Run the Frontend (Client)

```bash
cd client
npm install
npm run dev
```

The site will open at `http://localhost:5173`.

#### 3. (Optional) Run the Backend (Server)

```bash
cd server
npm install
npm run dev
```

The API server will listen on `http://localhost:5000` with a basic health route at `/health`.

#### 4. Build Frontend for Production

From the `client` folder:

```bash
npm run build
```

The production build is output to `client/dist/`.

---

### Detailed Setup

#### Client (Frontend)

From the repository root:

```bash
cd client
npm install
```

Available commands:

- `npm run dev` – Start Vite dev server
- `npm run build` – Create production build
- `npm run preview` – Preview the production build locally
- `npm run lint` – Run ESLint
- `npm run typecheck` – Run TypeScript type-checking

Tech stack:

- **React 18 + TypeScript**
- **Vite** for build tooling
- **Three.js** via React-Three-Fiber and Drei
- **React-Three-Postprocessing** for Bloom and effects
- **Framer Motion** + **GSAP** for animations
- **TailwindCSS** for styling

Main structure (inside `client/`):

```text
client/
  ├── index.html
  ├── src/
  │   ├── App.tsx              # Main app composition
  │   ├── main.tsx             # React entry point
  │   ├── index.css            # Global styles & Tailwind layers
  │   ├── components/          # All UI sections
  │   │   ├── Hero.tsx
  │   │   ├── About.tsx
  │   │   ├── Stats.tsx
  │   │   ├── Features.tsx
  │   │   ├── AppPreview.tsx
  │   │   ├── HowItWorks.tsx
  │   │   ├── Team.tsx
  │   │   ├── CTA.tsx
  │   │   ├── Footer.tsx
  │   │   ├── Navigation.tsx
  │   │   ├── LoadingScreen.tsx
  │   │   ├── ParticleBackground.tsx
  │   │   └── ScrollProgress.tsx
  │   └── 3d/                  # 3D scenes & models
  │       ├── HeroScene.tsx
  │       ├── FloatingFood.tsx
  │       └── PhoneModel.tsx
  ├── vite.config.ts
  ├── tailwind.config.js
  ├── tsconfig*.json
  └── eslint.config.js
```

#### Server (Backend)

From the repository root:

```bash
cd server
npm install
npm run dev
```

This spins up a small Express server with:

- `GET /health` → returns `{ "status": "ok" }`

You can extend this folder with real API routes, authentication, database connections, etc., without touching the frontend setup.

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

### Notes on Bolt References

All previous references to Bolt (`bolt.new` images / labels) have been removed.  
The HTML now uses neutral Open Graph and Twitter meta tags that you can point to your own FoodSaver images (e.g. `/og-image.png`).

