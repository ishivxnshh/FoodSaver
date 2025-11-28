import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, X } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import api from '../lib/api';
import toast from 'react-hot-toast';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

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
  const map = useRef<mapboxgl.Map | null>(null);
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to New York
          setUserLocation([-73.935242, 40.730610]);
        }
      );
    } else {
      setUserLocation([-73.935242, 40.730610]);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !userLocation) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: userLocation,
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location marker
    new mapboxgl.Marker({ color: '#10b981' })
      .setLngLat(userLocation)
      .setPopup(new mapboxgl.Popup().setHTML('<p>You are here</p>'))
      .addTo(map.current);

    // Fetch listings
    fetchListings();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [userLocation]);

  const fetchListings = async () => {
    try {
      const response = await api.get('/listings', {
        params: { status: 'available' },
      });
      setListings(response.data.listings);
      
      // Add markers for each listing
      response.data.listings.forEach((listing: FoodListing) => {
        if (map.current && listing.location.coordinates) {
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#14b8a6';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

          const marker = new mapboxgl.Marker(el)
            .setLngLat(listing.location.coordinates as [number, number])
            .addTo(map.current);

          el.addEventListener('click', () => {
            setSelectedListing(listing);
            map.current?.flyTo({
              center: listing.location.coordinates as [number, number],
              zoom: 14,
            });
          });
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
        <div ref={mapContainer} className="w-full h-full" />

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

