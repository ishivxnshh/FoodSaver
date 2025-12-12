import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import PhoneModel from '../3d/PhoneModel';

export default function AppPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 px-4 bg-slate-900" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Experience the App
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            A seamless interface designed for both donors and receivers
          </p>
        </motion.div>

        <div className="relative h-[600px] md:h-[700px]">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <PhoneModel />
            </Suspense>
          </Canvas>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
        >
          {[
            { label: 'Active Users', value: '10K+' },
            { label: 'Meals Saved', value: '50K+' },
            { label: 'Partner Stores', value: '200+' }
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                {stat.value}
              </div>
              <div className="text-slate-400 text-lg">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
