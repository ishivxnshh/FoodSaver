import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import LocationPicker from '../../components/LocationPicker';
import { format } from 'date-fns';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingListing, setFetchingListing] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'prepared-food',
    quantity: '',
    servings: 1,
    address: '',
    longitude: '',
    latitude: '',
    expiresAt: '',
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false,
  });

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setFetchingListing(true);
      const response = await api.get(`/listings/${id}`);
      const listing = response.data;

      setFormData({
        title: listing.title,
        description: listing.description,
        category: listing.category,
        quantity: listing.quantity,
        servings: listing.servings || 1,
        address: listing.location.address,
        longitude: listing.location.coordinates[0].toString(),
        latitude: listing.location.coordinates[1].toString(),
        expiresAt: format(new Date(listing.expiresAt), "yyyy-MM-dd'T'HH:mm"),
        vegetarian: listing.dietaryInfo?.vegetarian || false,
        vegan: listing.dietaryInfo?.vegan || false,
        glutenFree: listing.dietaryInfo?.glutenFree || false,
        dairyFree: listing.dietaryInfo?.dairyFree || false,
        nutFree: listing.dietaryInfo?.nutFree || false,
      });

      setExistingImages(listing.images || []);
    } catch (error) {
      toast.error('Failed to fetch listing');
      navigate('/donor/listings');
    } finally {
      setFetchingListing(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = existingImages.length + images.length + files.length;
      
      if (totalImages > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }

      setImages([...images, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.longitude || !formData.latitude) {
      toast.error('Please provide location coordinates');
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      
      // Add new images
      images.forEach(image => {
        submitData.append('images', image);
      });

      // Add existing images URLs
      submitData.append('existingImages', JSON.stringify(existingImages));

      // Add other fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('quantity', formData.quantity);
      submitData.append('servings', formData.servings.toString());
      submitData.append('expiresAt', new Date(formData.expiresAt).toISOString());
      
      submitData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
        address: formData.address,
      }));

      const pickupEnd = new Date(formData.expiresAt);
      const pickupStart = new Date(pickupEnd.getTime() - 2 * 60 * 60 * 1000);
      submitData.append('pickupTimes', JSON.stringify([{
        start: pickupStart.toISOString(),
        end: pickupEnd.toISOString(),
      }]));

      submitData.append('dietaryInfo', JSON.stringify({
        vegetarian: formData.vegetarian,
        vegan: formData.vegan,
        glutenFree: formData.glutenFree,
        dairyFree: formData.dairyFree,
        nutFree: formData.nutFree,
      }));

      await api.put(`/listings/${id}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Listing updated successfully!');
      navigate('/donor/listings');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update listing');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingListing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/donor/listings')}
            className="text-emerald-400 hover:text-emerald-300 mb-2 flex items-center gap-2"
          >
            ← Back to Listings
          </button>
          <h1 className="text-3xl font-bold text-white">Edit Food Listing</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Images (Max 5)</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="relative">
                  <img src={img.url} alt="" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {imagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative">
                  <img src={preview} alt="" className="w-full h-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {existingImages.length + images.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-slate-500 text-sm">Upload images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  required
                >
                  <option value="prepared-food">Prepared Food</option>
                  <option value="raw-ingredients">Raw Ingredients</option>
                  <option value="baked-goods">Baked Goods</option>
                  <option value="packaged-food">Packaged Food</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quantity *</label>
                <input
                  type="text"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g., 10 meals, 5kg"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Expiry Date & Time *</label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <LocationPicker
              onLocationSelect={(location) => {
                setFormData({
                  ...formData,
                  address: location.address,
                  longitude: location.longitude.toString(),
                  latitude: location.latitude.toString(),
                });
              }}
              initialAddress={formData.address}
              initialCoordinates={formData.longitude && formData.latitude ? [parseFloat(formData.longitude), parseFloat(formData.latitude)] : undefined}
            />
          </div>

          {/* Dietary Info */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Dietary Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'vegetarian', label: 'Vegetarian' },
                { key: 'vegan', label: 'Vegan' },
                { key: 'glutenFree', label: 'Gluten Free' },
                { key: 'dairyFree', label: 'Dairy Free' },
                { key: 'nutFree', label: 'Nut Free' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-800/50 text-emerald-500 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/donor/listings')}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
