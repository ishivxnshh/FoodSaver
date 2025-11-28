import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import HeroScene from '../3d/HeroScene';

export default function Hero() {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </Canvas>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center"
        >
          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            FoodSaver
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl lg:text-3xl text-slate-300 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Connecting surplus food with those who need it
          </motion.p>

          <motion.p
            className="text-base md:text-lg text-slate-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            Join the movement to reduce food waste and build a sustainable future
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105">
              Get Started
            </button>
            <button className="px-8 py-4 border-2 border-emerald-400 rounded-full font-semibold text-lg hover:bg-emerald-400/10 transition-all duration-300 hover:scale-105">
              Learn More
            </button>
          </motion.div>
        </motion.div>

        <motion.button
          onClick={scrollToAbout}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: 1.6,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 0.5
          }}
        >
          <ArrowDown size={32} />
        </motion.button>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none z-5" />
    </section>
  );
}
