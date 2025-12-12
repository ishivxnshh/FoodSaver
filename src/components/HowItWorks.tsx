import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Upload, Bell, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      icon: Upload,
      title: 'Donor Uploads',
      description: 'Restaurants, bakeries, and supermarkets post surplus food with details and pickup times',
      color: 'from-emerald-500 to-teal-600',
      position: 'left'
    },
    {
      icon: Bell,
      title: 'Users Get Notified',
      description: 'Nearby users receive instant notifications about available food in their area',
      color: 'from-teal-500 to-cyan-600',
      position: 'center'
    },
    {
      icon: CheckCircle,
      title: 'Claim & Collect',
      description: 'Users claim the food and pick it up using secure QR code verification',
      color: 'from-cyan-500 to-blue-600',
      position: 'right'
    }
  ];

  return (
    <section id="how-it-works" className="relative py-32 px-4 bg-gradient-to-b from-slate-900 to-slate-950" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            How It Works
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Three simple steps to save food and make a difference
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transform -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-32 h-32 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/30 border-4 border-slate-900`}
                  >
                    <step.icon className="w-16 h-16 text-white" strokeWidth={2} />
                  </motion.div>

                  <div className="absolute top-12 -right-4 hidden md:block">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border-4 border-emerald-500 shadow-lg shadow-emerald-500/50" />
                  </div>

                  <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-emerald-400 mb-3">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-white">
                        {step.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
