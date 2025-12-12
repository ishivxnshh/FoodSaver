import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import ParticleBackground from './components/ParticleBackground';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Stats from './components/Stats';
import Features from './components/Features';
import AppPreview from './components/AppPreview';
import HowItWorks from './components/HowItWorks';
import Team from './components/Team';
import CTA from './components/CTA';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'FoodSaver - Reduce Food Waste';
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <div className="bg-slate-950 text-white overflow-hidden relative">
          <ParticleBackground />
          <ScrollProgress />
          <Navigation />
          <Hero />
          <About />
          <Stats />
          <Features />
          <AppPreview />
          <HowItWorks />
          <Team />
          <CTA />
          <Footer />
        </div>
      )}
    </>
  );
}

export default App;
