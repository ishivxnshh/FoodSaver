import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (location: {
    address: string;
    longitude: number;
    latitude: number;
  }) => void;
  initialAddress?: string;
  initialCoordinates?: [number, number];
}

export default function LocationPicker({
  onLocationSelect,
  initialAddress = '',
  initialCoordinates,
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY || '';

  // Fetch suggestions as user types
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2 || !GEOAPIFY_API_KEY) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&limit=5&filter=countrycode:in`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        setSuggestions(data.features);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim() || !GEOAPIFY_API_KEY) return;

    setIsSearching(true);
    setShowSuggestions(false);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchTerm)}&apiKey=${GEOAPIFY_API_KEY}&limit=1&filter=countrycode:in`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.geometry.coordinates;
        const address = feature.properties.formatted || feature.properties.name || searchTerm;

        // Update form data
        onLocationSelect({
          address,
          longitude: lng,
          latitude: lat,
        });

        // Update marker if map is visible
        if (map.current) {
          const latlng = L.latLng(lat, lng);
          if (marker.current) {
            marker.current.setLatLng(latlng);
          } else {
            marker.current = L.marker(latlng, {
              draggable: true,
              icon: L.icon({
                iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
                  </svg>
                `),
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              }),
            }).addTo(map.current);

            // Handle marker drag
            marker.current.on('dragend', () => {
              const position = marker.current!.getLatLng();
              const dragLat = position.lat;
              const dragLng = position.lng;

              // Reverse geocode
              fetch(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${dragLat}&lon=${dragLng}&apiKey=${GEOAPIFY_API_KEY}`
              )
                .then((res) => res.json())
                .then((data) => {
                  if (data.features && data.features.length > 0) {
                    const address = data.features[0].properties.formatted || `${dragLat.toFixed(6)}, ${dragLng.toFixed(6)}`;
                    setSearchQuery(address);
                    onLocationSelect({
                      address,
                      longitude: dragLng,
                      latitude: dragLat,
                    });
                  }
                });
            });
          }

          // Center map on location
          map.current.setView(latlng, 14);
        } else {
          // If map is not visible, show it
          setIsMapVisible(true);
        }
      } else {
        // Try without country filter
        const fallbackResponse = await fetch(
          `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchTerm)}&apiKey=${GEOAPIFY_API_KEY}&limit=1`
        );
        const fallbackData = await fallbackResponse.json();

        if (fallbackData.features && fallbackData.features.length > 0) {
          const feature = fallbackData.features[0];
          const [lng, lat] = feature.geometry.coordinates;
          const address = feature.properties.formatted || feature.properties.name || searchTerm;

          onLocationSelect({
            address,
            longitude: lng,
            latitude: lat,
          });

          if (map.current) {
            const latlng = L.latLng(lat, lng);
            if (marker.current) {
              marker.current.setLatLng(latlng);
            } else {
              marker.current = L.marker(latlng, {
                draggable: true,
                icon: L.icon({
                  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="12" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
                    </svg>
                  `),
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                }),
              }).addTo(map.current);
            }
            map.current.setView(latlng, 14);
          } else {
            setIsMapVisible(true);
          }
        } else {
          alert('Location not found. Please try a different search term or click on the map to set location.');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search location. Please try again or click on the map to set location.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle input change with debounced suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce suggestions
    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    // Only initialize map when it's visible
    if (!isMapVisible) {
      // Clean up if map is hidden
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      return;
    }

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      if (!mapContainer.current || !GEOAPIFY_API_KEY || map.current) return;

      // Default center (Delhi, India)
      const defaultCenter = initialCoordinates
        ? L.latLng(initialCoordinates[1], initialCoordinates[0])
        : L.latLng(28.6139, 77.2090);

      // Initialize map with Geoapify tiles
      map.current = L.map(mapContainer.current, {
        center: defaultCenter,
        zoom: initialCoordinates ? 14 : 10,
      });

      // Add Geoapify tile layer
      L.tileLayer(`https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`, {
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>',
        maxZoom: 20,
      }).addTo(map.current);

      // Handle map click
      map.current.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        // Update marker
        if (marker.current) {
          marker.current.setLatLng([lat, lng]);
        } else {
          marker.current = L.marker([lat, lng], {
            draggable: true,
            icon: L.icon({
              iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
                </svg>
              `),
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            }),
          }).addTo(map.current);

          // Handle marker drag
          marker.current.on('dragend', () => {
            const position = marker.current!.getLatLng();
            const dragLat = position.lat;
            const dragLng = position.lng;

            fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${dragLat}&lon=${dragLng}&apiKey=${GEOAPIFY_API_KEY}`
            )
              .then((res) => res.json())
              .then((data) => {
                if (data.features && data.features.length > 0) {
                  const address = data.features[0].properties.formatted || `${dragLat.toFixed(6)}, ${dragLng.toFixed(6)}`;
                  setSearchQuery(address);
                  onLocationSelect({
                    address,
                    longitude: dragLng,
                    latitude: dragLat,
                  });
                }
              });
          });
        }

        // Reverse geocode
        fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.features && data.features.length > 0) {
              const address = data.features[0].properties.formatted || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              setSearchQuery(address);
              onLocationSelect({
                address,
                longitude: lng,
                latitude: lat,
              });
            }
          })
          .catch((error) => {
            console.error('Reverse geocoding error:', error);
            const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            setSearchQuery(address);
            onLocationSelect({
              address,
              longitude: lng,
              latitude: lat,
            });
          });
      });

      // If initial coordinates provided, set marker
      if (initialCoordinates) {
        marker.current = L.marker([initialCoordinates[1], initialCoordinates[0]], {
          draggable: true,
          icon: L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
              </svg>
            `),
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          }),
        }).addTo(map.current);

        marker.current.on('dragend', () => {
          const position = marker.current!.getLatLng();
          const dragLat = position.lat;
          const dragLng = position.lng;

          fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${dragLat}&lon=${dragLng}&apiKey=${GEOAPIFY_API_KEY}`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.features && data.features.length > 0) {
                const address = data.features[0].properties.formatted || `${dragLat.toFixed(6)}, ${dragLng.toFixed(6)}`;
                setSearchQuery(address);
                onLocationSelect({
                  address,
                  longitude: dragLng,
                  latitude: dragLat,
                });
              }
            });
        });
      }

      // Get user location on load
      if (navigator.geolocation && !initialCoordinates) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.current?.setView([latitude, longitude], 12);
          },
          () => {
            // Error getting location, use default
          }
        );
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isMapVisible, initialCoordinates, onLocationSelect, GEOAPIFY_API_KEY]);

  // Cleanup search timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium text-slate-300 flex-1">
          Pickup Location *
        </label>
        <button
          type="button"
          onClick={() => setIsMapVisible(!isMapVisible)}
          className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-2"
        >
          {isMapVisible ? (
            <>
              <MapPin className="w-4 h-4" />
              Hide Map
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Show Map
            </>
          )}
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 z-10" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            } else if (e.key === 'Escape') {
              setShowSuggestions(false);
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder="Search for Indian universities, shops, or addresses..."
          className="w-full pl-10 pr-20 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-slate-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50 z-10"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const address = suggestion.properties.formatted || suggestion.properties.name;
                  setSearchQuery(address);
                  setShowSuggestions(false);
                  handleSearch(address);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
              >
                <div className="text-white font-medium">{suggestion.properties.name}</div>
                {suggestion.properties.formatted && suggestion.properties.formatted !== suggestion.properties.name && (
                  <div className="text-slate-400 text-sm mt-0.5">{suggestion.properties.formatted}</div>
                )}
                <div className="text-slate-500 text-xs mt-1">
                  {suggestion.properties.country || 'Location'}
                </div>
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-500 mt-1">
          {isMapVisible
            ? 'Type to see suggestions, press Enter to search, or click on the map to set location'
            : 'Type to see suggestions, press Enter to search, or click "Show Map" to use the interactive map'}
        </p>
      </div>

      {/* Map Container */}
      {isMapVisible && (
        <div className="relative">
          {!GEOAPIFY_API_KEY && (
            <div className="w-full h-96 rounded-lg border border-red-500 bg-red-500/10 flex items-center justify-center">
              <p className="text-red-400 text-center px-4">
                Geoapify API key is missing. Please set VITE_GEOAPIFY_API_KEY in your .env file
              </p>
            </div>
          )}
          <div
            ref={mapContainer}
            className="w-full h-96 rounded-lg overflow-hidden border border-slate-700"
          />
          <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-slate-300 z-10">
            <p className="font-medium mb-1">📍 How to set location:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li>Type to see suggestions</li>
              <li>Click anywhere on the map</li>
              <li>Drag the green marker to adjust</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
