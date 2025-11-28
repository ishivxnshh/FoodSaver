import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Leaf, Users, Heart, TrendingDown } from 'lucide-react';

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cards = [
    {
      icon: TrendingDown,
      title: 'Reduce Waste',
      description: 'Help eliminate millions of tons of food waste annually',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Users,
      title: 'Connect Communities',
      description: 'Bridge the gap between food donors and those in need',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      icon: Heart,
      title: 'Make Impact',
      description: 'Every meal saved makes a difference in someone\'s life',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Leaf,
      title: 'Sustainable Future',
      description: 'Build a greener planet through conscious food sharing',
      color: 'from-blue-500 to-emerald-600'
    }
  ];

  return (
    <section id="about" className="relative py-32 px-4 bg-slate-950" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Our Mission
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            FoodSaver is revolutionizing how we think about surplus food. By connecting
            supermarkets, restaurants, and bakeries with individuals and NGOs, we're
            creating a sustainable ecosystem that benefits everyone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                transition: { duration: 0.3 }
              }}
              className="relative group"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 rounded-2xl blur-xl transition-opacity duration-300"
                style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
              />

              <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 hover:border-emerald-500/50 transition-all duration-300">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-white">
                  {card.title}
                </h3>

                <p className="text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />
    </section>
  );
}
