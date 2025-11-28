import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Package, User, Calendar, QrCode, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ClaimFood() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [selectedPickupTime, setSelectedPickupTime] = useState('');
  const [claim, setClaim] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await api.get(`/listings/${id}`);
      setListing(response.data);
      
      // Set default pickup time
      if (response.data.pickupTimes && response.data.pickupTimes.length > 0) {
        setSelectedPickupTime(response.data.pickupTimes[0].start);
      }
    } catch (error) {
      toast.error('Failed to fetch listing');
      navigate('/receiver/browse');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!selectedPickupTime) {
      toast.error('Please select a pickup time');
      return;
    }

    try {
      setClaiming(true);
      const response = await api.post('/claims', {
        foodListingId: id,
        pickupTime: selectedPickupTime,
      });
      
      setClaim(response.data);
      setShowQR(true);
      toast.success('Food claimed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to claim food');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  if (showQR && claim) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Claim Successful!</h1>
            <p className="text-slate-400 mb-8">Show this QR code when picking up the food</p>

            {/* QR Code */}
            <div className="bg-white p-6 rounded-2xl inline-block mb-6">
              <img src={claim.qrCode} alt="QR Code" className="w-64 h-64" />
            </div>

            {/* Verification Code */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
              <p className="text-slate-400 text-sm mb-2">Verification Code</p>
              <p className="text-3xl font-bold text-emerald-400 tracking-wider">
                {claim.verificationCode}
              </p>
              <p className="text-slate-500 text-xs mt-2">
                Give this code to the donor if QR scan doesn't work
              </p>
            </div>

            {/* Pickup Details */}
            <div className="bg-slate-800/30 rounded-xl p-6 text-left mb-6">
              <h3 className="text-white font-bold mb-4">Pickup Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-300">{listing.location.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-300">
                      {format(new Date(claim.pickupTime), 'MMM dd, yyyy • hh:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-300">
                      {listing.donor.businessName || listing.donor.name}
                    </p>
                    {listing.donor.phone && (
                      <p className="text-slate-500 text-sm">{listing.donor.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/receiver/claims')}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
              >
                View My Claims
              </button>
              <button
                onClick={() => navigate('/receiver/browse')}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
              >
                Browse More Food
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/receiver/browse')}
          className="text-emerald-400 hover:text-emerald-300 mb-6 flex items-center gap-2"
        >
          ← Back to Browse
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0].url}
                alt={listing.title}
                className="w-full h-96 object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full h-96 bg-slate-800 rounded-2xl flex items-center justify-center">
                <Package className="w-24 h-24 text-slate-600" />
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8"
          >
            <h1 className="text-3xl font-bold text-white mb-4">{listing.title}</h1>
            
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                {listing.donor.avatar ? (
                  <img
                    src={listing.donor.avatar}
                    alt={listing.donor.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-emerald-400 font-bold">
                    {listing.donor.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-white font-medium">
                  {listing.donor.businessName || listing.donor.name}
                </p>
                <p className="text-slate-400 text-sm">Donor</p>
              </div>
            </div>

            <p className="text-slate-300 mb-6">{listing.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300">Quantity: {listing.quantity}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300">{listing.location.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300">
                  Expires: {format(new Date(listing.expiresAt), 'MMM dd, yyyy • hh:mm a')}
                </span>
              </div>
            </div>

            {/* Pickup Time Selection */}
            {listing.pickupTimes && listing.pickupTimes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Pickup Time
                </label>
                <select
                  value={selectedPickupTime}
                  onChange={(e) => setSelectedPickupTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                >
                  {listing.pickupTimes.map((time: any, index: number) => (
                    <option key={index} value={time.start}>
                      {format(new Date(time.start), 'MMM dd • hh:mm a')} -{' '}
                      {format(new Date(time.end), 'hh:mm a')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dietary Info */}
            {listing.dietaryInfo && (
              <div className="flex flex-wrap gap-2 mb-6">
                {listing.dietaryInfo.vegetarian && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg">
                    Vegetarian
                  </span>
                )}
                {listing.dietaryInfo.vegan && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg">
                    Vegan
                  </span>
                )}
                {listing.dietaryInfo.glutenFree && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg">
                    Gluten-Free
                  </span>
                )}
                {listing.dietaryInfo.dairyFree && (
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-lg">
                    Dairy-Free
                  </span>
                )}
                {listing.dietaryInfo.nutFree && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-lg">
                    Nut-Free
                  </span>
                )}
              </div>
            )}

            <button
              onClick={handleClaim}
              disabled={claiming || !selectedPickupTime}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {claiming ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Claiming...
                </>
              ) : (
                <>
                  <QrCode className="w-6 h-6" />
                  Claim This Food
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

