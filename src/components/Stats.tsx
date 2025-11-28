import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingBag, Leaf } from 'lucide-react';

interface Stat {
  icon: typeof TrendingUp;
  label: string;
  value: number;
  suffix: string;
  prefix?: string;
  color: string;
}

const stats: Stat[] = [
  {
    icon: Users,
    label: 'Active Users',
    value: 12500,
    suffix: '+',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    icon: ShoppingBag,
    label: 'Meals Saved',
    value: 87350,
    suffix: '+',
    color: 'from-teal-500 to-cyan-600'
  },
  {
    icon: Leaf,
    label: 'CO2 Reduced',
    value: 245,
    suffix: ' tons',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    icon: TrendingUp,
    label: 'Partner Stores',
    value: 328,
    suffix: '+',
    color: 'from-blue-500 to-emerald-600'
  }
];

function CountUp({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-20 px-4 bg-slate-950" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-500`} />

              <div className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>

                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                  {stat.prefix}
                  <CountUp end={stat.value} />
                  {stat.suffix}
                </div>

                <div className="text-slate-400 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
