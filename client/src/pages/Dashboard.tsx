import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Package, Heart, MapPin, Bell, LogOut, QrCode } from 'lucide-react';

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cards = [
    {
      title: 'Donate Food',
      description: 'Post surplus food from your business or home',
      icon: Package,
      color: 'from-emerald-500 to-teal-600',
      link: '/donor/listings',
      show: user?.role === 'donor' || user?.role === 'both',
    },
    {
      title: 'Browse Food',
      description: 'Find available food near you',
      icon: Heart,
      color: 'from-teal-500 to-cyan-600',
      link: '/receiver/browse',
      show: user?.role === 'receiver' || user?.role === 'both',
    },
    {
      title: 'My Claims',
      description: 'View food you have claimed',
      icon: Heart,
      color: 'from-purple-500 to-pink-600',
      link: '/receiver/claims',
      show: user?.role === 'receiver' || user?.role === 'both',
    },
    {
      title: 'Verify Pickups',
      description: 'Scan QR codes to confirm collection',
      icon: QrCode,
      color: 'from-orange-500 to-red-600',
      link: '/donor/verify',
      show: user?.role === 'donor' || user?.role === 'both',
    },
    {
      title: 'Food Map',
      description: 'Explore food on an interactive map',
      icon: MapPin,
      color: 'from-cyan-500 to-blue-600',
      link: '/map',
      show: true,
    },
    {
      title: 'Notifications',
      description: 'View your activity and updates',
      icon: Bell,
      color: 'from-blue-500 to-purple-600',
      link: '/notifications',
      show: true,
    },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* Navigation Bar */}
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            FoodSaver
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-slate-400 text-lg">
            {user.businessName ? `Managing ${user.businessName}` : 'Ready to make a difference?'}
          </p>
        </motion.div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.filter(card => card.show).map((card, index) => (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(card.link)}
              className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 text-left"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {card.title}
              </h3>
              <p className="text-slate-400 text-sm">{card.description}</p>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Quick Stats (placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-1">Food Saved</p>
            <p className="text-3xl font-bold text-emerald-400">0</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-1">CO₂ Reduced</p>
            <p className="text-3xl font-bold text-cyan-400">0 kg</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-1">Impact Score</p>
            <p className="text-3xl font-bold text-blue-400">0</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

