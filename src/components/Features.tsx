import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Upload, Bell, MapPin, Shield } from 'lucide-react';

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Upload,
      title: 'Donor Food Posting',
      description: 'Restaurants and supermarkets can easily post surplus food with photos, quantity, and pickup times',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500'
    },
    {
      icon: Bell,
      title: 'Real-time Availability',
      description: 'Get instant notifications when fresh food becomes available near you',
      gradient: 'from-teal-500 via-cyan-500 to-blue-500'
    },
    {
      icon: MapPin,
      title: 'Map-based Discovery',
      description: 'Find available food on an interactive map with distance and directions',
      gradient: 'from-cyan-500 via-blue-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Secure Claiming',
      description: 'Safe and verified system to claim and collect food with QR code verification',
      gradient: 'from-blue-500 via-emerald-500 to-teal-500'
    }
  ];

  return (
    <section id="features" className="relative py-32 px-4 bg-gradient-to-b from-slate-950 to-slate-900" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Powerful Features
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Everything you need to save food and make a difference
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              whileHover={{
                scale: 1.02,
                rotateY: 2,
                transition: { duration: 0.3 }
              }}
              className="group relative"
              style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl blur-2xl transition-opacity duration-500`} />

              <div className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 hover:border-transparent hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-500 blur-3xl"
                  style={{ background: `linear-gradient(to bottom right, #10b981, #06b6d4)` }}
                />

                <div className="relative z-10">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <feature.icon className="w-10 h-10 text-white" strokeWidth={2} />
                  </div>

                  <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-emerald-400 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-slate-400 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(to right, #10b981, #06b6d4)` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
