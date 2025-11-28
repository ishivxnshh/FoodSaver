import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Briefcase, Gift, ShoppingBag } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function CompleteProfile() {
  const [formData, setFormData] = useState({
    role: 'both',
    businessName: '',
    businessType: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { fetchMe } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/auth/profile', formData);
      await fetchMe();
      toast.success('Profile completed!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-slate-400">Tell us how you'd like to use FoodSaver</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-4">
                I want to
              </label>
              <div className="grid grid-cols-1 gap-3">
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'donor'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="donor"
                    checked={formData.role === 'donor'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Gift className="w-6 h-6 text-emerald-400 mr-3" />
                  <div>
                    <div className="text-white font-medium">Donate Food</div>
                    <div className="text-slate-400 text-sm">I have surplus food to share</div>
                  </div>
                </motion.label>

                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'receiver'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="receiver"
                    checked={formData.role === 'receiver'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <ShoppingBag className="w-6 h-6 text-emerald-400 mr-3" />
                  <div>
                    <div className="text-white font-medium">Receive Food</div>
                    <div className="text-slate-400 text-sm">I need food donations</div>
                  </div>
                </motion.label>

                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'both'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="both"
                    checked={formData.role === 'both'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <User className="w-6 h-6 text-emerald-400 mr-3" />
                  <div>
                    <div className="text-white font-medium">Both</div>
                    <div className="text-slate-400 text-sm">I want to donate and receive</div>
                  </div>
                </motion.label>
              </div>
            </div>

            {(formData.role === 'donor' || formData.role === 'both') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Name (Optional)
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-500"
                      placeholder="Your Restaurant/Store Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Type (Optional)
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  >
                    <option value="">Select type</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="supermarket">Supermarket</option>
                    <option value="bakery">Bakery</option>
                    <option value="cafe">Café</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

