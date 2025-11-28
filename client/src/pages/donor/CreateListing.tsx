import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Plus, MapPin } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = images.length + files.length;
      
      if (totalImages > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }

      setImages([...images, ...files]);
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.longitude || !formData.latitude) {
      toast.error('Please provide location coordinates');
      return;
    }

    try {
      setLoading(true);

      // Create form data for multipart upload
      const submitData = new FormData();
      
      // Add images
      images.forEach(image => {
        submitData.append('images', image);
      });

      // Add other fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('quantity', formData.quantity);
      submitData.append('servings', formData.servings.toString());
      submitData.append('expiresAt', new Date(formData.expiresAt).toISOString());
      
      // Location
      submitData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
        address: formData.address,
      }));

      // Pickup times (using expiration as pickup window)
      const pickupEnd = new Date(formData.expiresAt);
      const pickupStart = new Date(pickupEnd.getTime() - 2 * 60 * 60 * 1000); // 2 hours before expiry
      submitData.append('pickupTimes', JSON.stringify([{
        start: pickupStart.toISOString(),
        end: pickupEnd.toISOString(),
      }]));

      // Dietary info
      submitData.append('dietaryInfo', JSON.stringify({
        vegetarian: formData.vegetarian,
        vegan: formData.vegan,
        glutenFree: formData.glutenFree,
        dairyFree: formData.dairyFree,
        nutFree: formData.nutFree,
      }));

      await api.post('/listings', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Listing created successfully!');
      navigate('/donor/listings');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/donor/listings')}
          className="text-emerald-400 hover:text-emerald-300 mb-6 flex items-center gap-2"
        >
          ← Back to Listings
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Create Food Listing</h1>
          <p className="text-slate-400 mb-8">Share your surplus food with those who need it</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Images (Max 5)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                    <Upload className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-slate-500 text-xs text-center">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                placeholder="e.g., Fresh Pizza Slices"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white resize-none"
                placeholder="Describe the food, condition, etc."
              />
            </div>

            {/* Category and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                >
                  <option value="prepared-food">Prepared Food</option>
                  <option value="baked-goods">Baked Goods</option>
                  <option value="fruits-vegetables">Fruits & Vegetables</option>
                  <option value="dairy">Dairy</option>
                  <option value="packaged-food">Packaged Food</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Quantity *
                </label>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  placeholder="e.g., 5 portions, 2kg"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Pickup Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                placeholder="Full address for pickup"
              />
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  step="any"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  placeholder="-73.935242"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  step="any"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  placeholder="40.730610"
                />
              </div>
            </div>

            {/* Expires At */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Expires At *
              </label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
              />
            </div>

            {/* Dietary Info */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Dietary Information
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: 'vegetarian', label: 'Vegetarian' },
                  { name: 'vegan', label: 'Vegan' },
                  { name: 'glutenFree', label: 'Gluten-Free' },
                  { name: 'dairyFree', label: 'Dairy-Free' },
                  { name: 'nutFree', label: 'Nut-Free' },
                ].map((diet) => (
                  <label key={diet.name} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name={diet.name}
                      checked={formData[diet.name as keyof typeof formData] as boolean}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-slate-300 text-sm">{diet.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

