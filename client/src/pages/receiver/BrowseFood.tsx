import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Filter, Package, Clock, Heart } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface FoodListing {
  _id: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  images: { url: string }[];
  location: { address: string; coordinates: number[] };
  donor: { name: string; businessName: string; avatar?: string };
  expiresAt: string;
  dietaryInfo: any;
  status: string;
}

export default function BrowseFood() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'All',
    'prepared-food',
    'baked-goods',
    'fruits-vegetables',
    'dairy',
    'packaged-food',
    'other',
  ];

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params: any = { status: 'available' };
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      const response = await api.get('/listings', { params });
      setListings(response.data.listings);
    } catch (error) {
      toast.error('Failed to fetch food listings');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (listingId: string) => {
    navigate(`/receiver/claim/${listingId}`);
  };

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-white">Browse Available Food</h1>
          <p className="text-slate-400 mt-1">Find fresh food near you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for food..."
              className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-500"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  (category === 'All' && !selectedCategory) || selectedCategory === category
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No food available</p>
            <p className="text-slate-500 mt-2">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, index) => (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all group"
              >
                {/* Image */}
                {listing.images && listing.images.length > 0 ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={listing.images[0].url}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                      AVAILABLE
                    </div>
                  </div>
                ) : (
                  <div className="h-48 bg-slate-800 flex items-center justify-center">
                    <Package className="w-12 h-12 text-slate-600" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {listing.title}
                    </h3>
                  </div>

                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Donor Info */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      {listing.donor.avatar ? (
                        <img
                          src={listing.donor.avatar}
                          alt={listing.donor.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-emerald-400 text-sm font-bold">
                          {listing.donor.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {listing.donor.businessName || listing.donor.name}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Package className="w-4 h-4" />
                      <span>{listing.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{listing.location.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>
                        Expires {formatDistanceToNow(new Date(listing.expiresAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Dietary Tags */}
                  {listing.dietaryInfo && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {listing.dietaryInfo.vegetarian && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
                          Vegetarian
                        </span>
                      )}
                      {listing.dietaryInfo.vegan && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
                          Vegan
                        </span>
                      )}
                      {listing.dietaryInfo.glutenFree && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">
                          Gluten-Free
                        </span>
                      )}
                    </div>
                  )}

                  {/* Claim Button */}
                  <button
                    onClick={() => handleClaim(listing._id)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Heart className="w-5 h-5" />
                    Claim This Food
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

