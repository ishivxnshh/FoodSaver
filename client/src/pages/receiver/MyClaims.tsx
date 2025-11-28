import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, MapPin, QrCode, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Claim {
  _id: string;
  foodListing: {
    title: string;
    images: { url: string }[];
    location: { address: string };
  };
  donor: {
    name: string;
    businessName: string;
    phone?: string;
  };
  status: string;
  pickupTime: string;
  qrCode: string;
  verificationCode: string;
  createdAt: string;
}

export default function MyClaims() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/claims/my-claims', { params });
      setClaims(response.data.claims);
    } catch (error) {
      toast.error('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (claimId: string) => {
    if (!confirm('Are you sure you want to cancel this claim?')) return;

    try {
      await api.put(`/claims/${claimId}/cancel`, {
        reason: 'Cancelled by user',
      });
      toast.success('Claim cancelled');
      fetchClaims();
    } catch (error) {
      toast.error('Failed to cancel claim');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'confirmed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-emerald-400 hover:text-emerald-300 mb-2 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">My Claims</h1>
          <p className="text-slate-400 mt-1">Track your claimed food items</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-8">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Claims List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No claims found</p>
            <button
              onClick={() => navigate('/receiver/browse')}
              className="mt-4 text-emerald-400 hover:text-emerald-300"
            >
              Browse available food →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claims.map((claim, index) => (
              <motion.div
                key={claim._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all"
              >
                {/* Image */}
                {claim.foodListing.images && claim.foodListing.images.length > 0 ? (
                  <img
                    src={claim.foodListing.images[0].url}
                    alt={claim.foodListing.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-slate-800 flex items-center justify-center">
                    <Package className="w-12 h-12 text-slate-600" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{claim.foodListing.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                        claim.status
                      )}`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <p className="text-slate-400 text-sm mb-4">
                    From: {claim.donor.businessName || claim.donor.name}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{claim.foodListing.location.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Pickup: {format(new Date(claim.pickupTime), 'MMM dd, HH:mm')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-800">
                    {claim.status === 'confirmed' || claim.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <QrCode className="w-4 h-4" />
                          Show QR
                        </button>
                        <button
                          onClick={() => handleCancel(claim._id)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex-1 text-center text-slate-500 text-sm">
                        {claim.status === 'completed' ? '✓ Completed' : 'Cancelled'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Pickup QR Code</h2>
              <button
                onClick={() => setSelectedClaim(null)}
                className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl mb-6">
              <img
                src={selectedClaim.qrCode}
                alt="QR Code"
                className="w-full h-auto"
              />
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
              <p className="text-slate-400 text-sm mb-2 text-center">Verification Code</p>
              <p className="text-2xl font-bold text-emerald-400 text-center tracking-wider">
                {selectedClaim.verificationCode}
              </p>
            </div>

            <div className="text-slate-400 text-sm">
              <p className="mb-2">Pickup Details:</p>
              <p className="text-white">
                {format(new Date(selectedClaim.pickupTime), 'MMM dd, yyyy • hh:mm a')}
              </p>
              <p className="text-white">{selectedClaim.foodListing.location.address}</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

