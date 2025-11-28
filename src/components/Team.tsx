import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Team() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const team = [
    {
      name: 'Alex Chen',
      role: 'Full Stack Developer',
      image: 'https://images.pexels.com/photos/3779448/pexels-photo-3779448.jpeg?auto=compress&cs=tinysrgb&w=400',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Sarah Johnson',
      role: 'UI/UX Designer',
      image: 'https://images.pexels.com/photos/3783725/pexels-photo-3783725.jpeg?auto=compress&cs=tinysrgb&w=400',
      gradient: 'from-teal-500 to-cyan-600'
    },
    {
      name: 'Michael Lee',
      role: 'Backend Engineer',
      image: 'https://images.pexels.com/photos/3778680/pexels-photo-3778680.jpeg?auto=compress&cs=tinysrgb&w=400',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      name: 'Emma Wilson',
      role: 'Product Manager',
      image: 'https://images.pexels.com/photos/3783725/pexels-photo-3783725.jpeg?auto=compress&cs=tinysrgb&w=400',
      gradient: 'from-blue-500 to-emerald-600'
    }
  ];

  return (
    <section id="team" className="relative py-32 px-4 bg-slate-950" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Meet the Team
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Passionate individuals working together to make a difference
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50, rotateY: -20 }}
              animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{
                y: -10,
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
              className="group relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-20 rounded-2xl blur-2xl transition-opacity duration-500`} />

              <div className="relative bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-slate-400 mb-4">{member.role}</p>

                  <div className="flex gap-3">
                    <motion.a
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      href="#"
                      className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition-colors duration-300"
                    >
                      <Github className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      href="#"
                      className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition-colors duration-300"
                    >
                      <Linkedin className="w-5 h-5" />
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      href="#"
                      className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-500 flex items-center justify-center transition-colors duration-300"
                    >
                      <Mail className="w-5 h-5" />
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
