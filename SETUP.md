# FoodSaver - 3D Website Setup Guide

A complete, production-ready 3D website for FoodSaver built with React, TypeScript, Three.js, and Framer Motion.

## Features

### Visual & Design
- Stunning 3D hero scene with floating food objects
- Interactive 3D phone model preview
- Smooth scroll animations and transitions
- Glassmorphism effects and gradient overlays
- Bloom effects and particle systems
- Responsive design for all devices
- Loading screen with progress indicator
- Sticky navigation with scroll detection

### Sections
1. **Hero Section** - 3D interactive environment with floating food items
2. **About Section** - Mission cards with 3D hover effects
3. **Stats Section** - Animated counter statistics
4. **Features Section** - 4 core features with glassmorphism cards
5. **App Preview** - Rotating 3D phone model
6. **How It Works** - 3-step flow visualization
7. **Team Section** - Team member cards with animations
8. **CTA Section** - Call-to-action with gradient background
9. **Footer** - Comprehensive footer with links

### Technologies
- React 18 + TypeScript
- Vite for build tooling
- Three.js via React-Three-Fiber
- React-Three-Drei for 3D helpers
- React-Three-Postprocessing for effects
- Framer Motion for UI animations
- GSAP for scroll animations
- TailwindCSS for styling
- Lucide React for icons

## Installation & Running

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

The site will open at `http://localhost:5173`

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── About.tsx       # About section
│   ├── AppPreview.tsx  # 3D phone preview
│   ├── CTA.tsx         # Call-to-action
│   ├── Features.tsx    # Features grid
│   ├── Footer.tsx      # Footer section
│   ├── Hero.tsx        # Hero section
│   ├── HowItWorks.tsx  # Process steps
│   ├── LoadingScreen.tsx # Initial loader
│   ├── Navigation.tsx   # Sticky nav
│   ├── ScrollProgress.tsx # Progress bar
│   ├── Stats.tsx       # Statistics section
│   └── Team.tsx        # Team members
├── 3d/                 # 3D components
│   ├── FloatingFood.tsx # Food objects
│   ├── HeroScene.tsx   # Hero 3D scene
│   └── PhoneModel.tsx  # Phone 3D model
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Performance Optimizations

- Lazy loading for 3D components
- Optimized texture sizes
- Efficient animation loops
- Code splitting ready
- Responsive image loading
- Minimal re-renders with proper memoization

## Customization

### Colors
Edit gradient colors in components or TailwindCSS config:
- Primary: emerald (green)
- Secondary: teal
- Accent: cyan

### 3D Objects
Modify 3D objects in `src/3d/FloatingFood.tsx`:
- Change shapes, colors, materials
- Add custom GLTF models
- Adjust lighting and effects

### Animations
Tune animation settings:
- Framer Motion variants in components
- Three.js animation loops in 3D files
- CSS animations in `index.css`

## Deployment

### Build
```bash
npm run build
```

Output will be in `dist/` folder.

### Deploy to Vercel/Netlify
1. Connect your Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

### Deploy to custom server
Upload contents of `dist/` folder to your web server.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Created for FoodSaver project. All rights reserved.

## Credits

- Stock photos from Pexels
- Icons from Lucide React
- 3D powered by Three.js
- Built with React & TypeScript
