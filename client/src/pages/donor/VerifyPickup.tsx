import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Scan, CheckCircle, Hash } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function VerifyPickup() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await api.get('/claims/received', {
        params: { status: 'confirmed' },
      });
      setClaims(response.data.claims);
    } catch (error) {
      toast.error('Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedClaim || !verificationCode) {
      toast.error('Please enter verification code');
      return;
    }

    try {
      setVerifying(true);
      await api.post(`/claims/${selectedClaim._id}/verify`, {
        verificationCode: verificationCode.toUpperCase(),
      });
      
      toast.success('Pickup verified successfully!');
      setSelectedClaim(null);
      setVerificationCode('');
      fetchClaims();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-emerald-400 hover:text-emerald-300 mb-2 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Verify Pickups</h1>
          <p className="text-slate-400 mt-1">Scan QR codes to confirm food collection</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No pending pickups to verify</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <motion.div
                key={claim._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Image */}
                  {claim.foodListing?.images && claim.foodListing.images.length > 0 ? (
                    <img
                      src={claim.foodListing.images[0].url}
                      alt={claim.foodListing.title}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <QrCode className="w-8 h-8 text-slate-600" />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {claim.foodListing?.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3">
                      Claimer: {claim.claimer?.name}
                      {claim.claimer?.phone && ` • ${claim.claimer.phone}`}
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-lg text-sm font-medium">
                        Ready for Pickup
                      </span>
                    </div>
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={() => setSelectedClaim(claim)}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center gap-2"
                  >
                    <Scan className="w-5 h-5" />
                    Verify
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Verify Pickup</h2>

            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-2">Food Item:</p>
              <p className="text-white font-semibold">{selectedClaim.foodListing?.title}</p>
            </div>

            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-2">Claimed By:</p>
              <p className="text-white font-semibold">{selectedClaim.claimer?.name}</p>
            </div>

            {/* Manual Code Entry */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Enter 6-Digit Code
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white text-center text-2xl tracking-widest font-bold uppercase"
                  placeholder="ABC123"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedClaim(null);
                  setVerificationCode('');
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={verifying || verificationCode.length !== 6}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verify
                  </>
                )}
              </button>
            </div>

            <p className="text-slate-500 text-xs text-center mt-4">
              Ask the claimer to show their QR code or tell you the 6-digit code
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

