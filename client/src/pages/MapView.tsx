import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../lib/api';
import toast from 'react-hot-toast';

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FoodListing {
  _id: string;
  title: string;
  description: string;
  quantity: string;
  images: { url: string }[];
  location: {
    coordinates: number[];
    address: string;
  };
  donor: {
    name: string;
    businessName: string;
  };
}

export default function MapView() {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '';

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Delhi, India
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !userLocation || !GEOAPIFY_API_KEY) return;

    // Initialize map
    map.current = L.map(mapContainer.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 12,
    });

    // Add Geoapify tile layer
    L.tileLayer(`https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`, {
      attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>',
      maxZoom: 20,
    }).addTo(map.current);

    // Add user location marker
    L.marker([userLocation.lat, userLocation.lng], {
      icon: L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
          </svg>
        `),
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    })
      .addTo(map.current)
      .bindPopup('You are here');

    setMapLoaded(true);
    fetchListings();

    return () => {
      // Clean up markers
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [userLocation, GEOAPIFY_API_KEY]);

  const fetchListings = async () => {
    try {
      const response = await api.get('/listings', {
        params: { status: 'available' },
      });
      setListings(response.data.listings);

      // Clear existing markers
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];

      // Add markers for each listing
      response.data.listings.forEach((listing: FoodListing) => {
        if (map.current && listing.location.coordinates) {
          const [lng, lat] = listing.location.coordinates;

          // Create custom marker
          const marker = L.marker([lat, lng], {
            icon: L.icon({
              iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="16" fill="#14b8a6" stroke="#ffffff" stroke-width="3"/>
                </svg>
              `),
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            }),
          }).addTo(map.current);

          // Add click listener
          marker.on('click', () => {
            setSelectedListing(listing);
            map.current?.setView([lat, lng], 14);
          });

          markers.current.push(marker);
        }
      });
    } catch (error) {
      toast.error('Failed to fetch food locations');
    }
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-white">Food Map</h1>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{listings.length} available nearby</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {!GEOAPIFY_API_KEY ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <p className="text-red-400 text-center px-4">
              Geoapify API key is missing. Please set VITE_GEOAPIFY_API_KEY in your .env file
            </p>
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-full" />
        )}

        {/* Selected Listing Card */}
        {selectedListing && (
          <div className="absolute bottom-6 left-6 right-6 md:left-auto md:w-96">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
              <div className="relative">
                {selectedListing.images && selectedListing.images.length > 0 ? (
                  <img
                    src={selectedListing.images[0].url}
                    alt={selectedListing.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-slate-800 flex items-center justify-center">
                    <Package className="w-12 h-12 text-slate-600" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedListing(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-slate-900/90 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{selectedListing.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {selectedListing.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Package className="w-4 h-4" />
                    <span>{selectedListing.quantity}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedListing.location.address}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/receiver/claim/${selectedListing._id}`)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
                >
                  Claim This Food
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
