import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Sparkles, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import LocationPicker from '../../components/LocationPicker';

export default function CreateListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
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

  const handleAIAutoFill = async () => {
    if (images.length === 0) {
      toast.error('Please upload an image first');
      return;
    }

    try {
      setAiLoading(true);
      const toastId = toast.loading('AI analyzing your food image...');

      // Convert first image to base64
      const file = images[0];
      const base64 = await fileToBase64(file);
      const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix

      // Call Gemini Vision API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `You are a food recognition AI. Analyze this food image and return ONLY a JSON object (no markdown, no code blocks) with these exact fields:
{
  "title": "name of the food item",
  "description": "brief description including condition and freshness (2-3 sentences)",
  "quantity": "estimated quantity (e.g., '5 portions', '2kg', '10 pieces')",
  "expiryHours": number (estimated hours until expiry, e.g., 24 for fresh food, 6 for cooked food, 48 for packaged)
}

Be concise and practical. Return ONLY the JSON object.`
                },
                {
                  inline_data: {
                    mime_type: file.type,
                    data: base64Data,
                  },
                },
              ],
            }],
            generationConfig: {
              temperature: 0.4,
              topK: 32,
              topP: 1,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // Parse JSON from response (handle potential markdown wrapping)
      let jsonStr = aiResponse.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '');
      }

      const aiData = JSON.parse(jsonStr);

      // Calculate expiry datetime
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + (aiData.expiryHours || 24));
      const expiryDateTime = expiryDate.toISOString().slice(0, 16);

      // Update form data
      setFormData({
        ...formData,
        title: aiData.title || '',
        description: aiData.description || '',
        quantity: aiData.quantity || '',
        expiresAt: expiryDateTime,
      });

      toast.success('Form auto-filled by AI!', { id: toastId });
    } catch (error: any) {
      console.error('AI auto-fill error:', error);
      toast.error(error.message || 'Failed to analyze image. Please fill manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

              {/* AI Auto-Fill Button */}
              {images.length > 0 && (
                <motion.button
                  type="button"
                  onClick={handleAIAutoFill}
                  disabled={aiLoading}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>AI Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>AI Auto-Fill</span>
                    </>
                  )}
                </motion.button>
              )}
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

            {/* Location Picker */}
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
              initialCoordinates={
                formData.longitude && formData.latitude
                  ? [parseFloat(formData.longitude), parseFloat(formData.latitude)]
                  : undefined
              }
            />

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

