import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

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
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const autocomplete = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Load Google Maps script
  useEffect(() => {
    if (window.google) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding&callback=initMap`;
    script.async = true;
    script.defer = true;
    window.initMap = () => {
      // Script loaded
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [GOOGLE_MAPS_API_KEY]);

  // Fetch suggestions as user types
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2 || !window.google || !autocompleteService.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'in' }, // Focus on India
          types: ['establishment', 'geocode'], // Include businesses and addresses
        },
        (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } catch (error) {
      console.error('Suggestions error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim() || !window.google || !geocoder.current) return;

    setIsSearching(true);
    setShowSuggestions(false);
    try {
      geocoder.current.geocode(
        {
          address: searchTerm,
          componentRestrictions: { country: 'in' },
        },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            const result = results[0];
            const location = result.geometry.location;
            const lat = location.lat();
            const lng = location.lng();
            const address = result.formatted_address || searchTerm;

            // Update form data
            onLocationSelect({
              address,
              longitude: lng,
              latitude: lat,
            });

            // Update marker if map is visible
            if (map.current) {
              if (marker.current) {
                marker.current.setPosition({ lat, lng });
              } else {
                marker.current = new google.maps.Marker({
                  position: { lat, lng },
                  map: map.current,
                  draggable: true,
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#10b981',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  },
                });

                // Handle marker drag
                marker.current.addListener('dragend', () => {
                  const position = marker.current!.getPosition();
                  if (position) {
                    const dragLat = position.lat();
                    const dragLng = position.lng();

                    // Reverse geocode
                    geocoder.current!.geocode(
                      { location: { lat: dragLat, lng: dragLng } },
                      (results: google.maps.GeocoderResult[] | null) => {
                        if (results && results.length > 0) {
                          const address = results[0].formatted_address;
                          setSearchQuery(address);
                          onLocationSelect({
                            address,
                            longitude: dragLng,
                            latitude: dragLat,
                          });
                        }
                      }
                    );
                  }
                });
              }

              // Center map on location
              map.current.setCenter({ lat, lng });
              map.current.setZoom(14);
            } else {
              // If map is not visible, show it
              setIsMapVisible(true);
            }
          } else {
            // Try without country restriction
            geocoder.current.geocode(
              { address: searchTerm },
              (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
                if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
                  const result = results[0];
                  const location = result.geometry.location;
                  const lat = location.lat();
                  const lng = location.lng();
                  const address = result.formatted_address || searchTerm;

                  onLocationSelect({
                    address,
                    longitude: lng,
                    latitude: lat,
                  });

                  if (map.current) {
                    if (marker.current) {
                      marker.current.setPosition({ lat, lng });
                    } else {
                      marker.current = new google.maps.Marker({
                        position: { lat, lng },
                        map: map.current,
                        draggable: true,
                        icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 8,
                          fillColor: '#10b981',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                        },
                      });
                    }
                    map.current.setCenter({ lat, lng });
                    map.current.setZoom(14);
                  } else {
                    setIsMapVisible(true);
                  }
                } else {
                  alert('Location not found. Please try a different search term or click on the map to set location.');
                }
                setIsSearching(false);
              }
            );
            return;
          }
          setIsSearching(false);
        }
      );
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search location. Please try again or click on the map to set location.');
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
    if (value.trim().length >= 2 && window.google) {
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
        marker.current.setMap(null);
        marker.current = null;
      }
      if (map.current) {
        map.current = null;
      }
      return;
    }

    // Wait for Google Maps to load
    if (!window.google || !mapContainer.current) {
      const checkGoogle = setInterval(() => {
        if (window.google && mapContainer.current) {
          clearInterval(checkGoogle);
          initializeMap();
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }

    initializeMap();

    function initializeMap() {
      if (!mapContainer.current || !window.google || map.current) return;

      // Default center (Delhi, India)
      const defaultCenter = initialCoordinates
        ? { lat: initialCoordinates[1], lng: initialCoordinates[0] }
        : { lat: 28.6139, lng: 77.2090 };

      // Initialize map
      map.current = new google.maps.Map(mapContainer.current, {
        center: defaultCenter,
        zoom: initialCoordinates ? 14 : 10,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        styles: [
          {
            featureType: 'all',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }],
          },
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }],
          },
        ],
      });

      // Initialize geocoder
      geocoder.current = new google.maps.Geocoder();
      autocompleteService.current = new google.maps.places.AutocompleteService();
      placesService.current = new google.maps.places.PlacesService(map.current);

      // Handle map click
      map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          // Update marker
          if (marker.current) {
            marker.current.setPosition({ lat, lng });
          } else {
            marker.current = new google.maps.Marker({
              position: { lat, lng },
              map: map.current,
              draggable: true,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#10b981',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
            });

            // Handle marker drag
            marker.current.addListener('dragend', () => {
              const position = marker.current!.getPosition();
              if (position) {
                const dragLat = position.lat();
                const dragLng = position.lng();

                geocoder.current!.geocode(
                  { location: { lat: dragLat, lng: dragLng } },
                  (results: google.maps.GeocoderResult[] | null) => {
                    if (results && results.length > 0) {
                      const address = results[0].formatted_address;
                      setSearchQuery(address);
                      onLocationSelect({
                        address,
                        longitude: dragLng,
                        latitude: dragLat,
                      });
                    }
                  }
                );
              }
            });
          }

          // Reverse geocode
          geocoder.current!.geocode(
            { location: { lat, lng } },
            (results: google.maps.GeocoderResult[] | null) => {
              if (results && results.length > 0) {
                const address = results[0].formatted_address;
                setSearchQuery(address);
                onLocationSelect({
                  address,
                  longitude: lng,
                  latitude: lat,
                });
              }
            }
          );
        }
      });

      // If initial coordinates provided, set marker
      if (initialCoordinates) {
        marker.current = new google.maps.Marker({
          position: { lat: initialCoordinates[1], lng: initialCoordinates[0] },
          map: map.current,
          draggable: true,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        marker.current.addListener('dragend', () => {
          const position = marker.current!.getPosition();
          if (position) {
            const dragLat = position.lat();
            const dragLng = position.lng();

            geocoder.current!.geocode(
              { location: { lat: dragLat, lng: dragLng } },
              (results: google.maps.GeocoderResult[] | null) => {
                if (results && results.length > 0) {
                  const address = results[0].formatted_address;
                  setSearchQuery(address);
                  onLocationSelect({
                    address,
                    longitude: dragLng,
                    latitude: dragLat,
                  });
                }
              }
            );
          }
        });
      }

      // Get user location on load
      if (navigator.geolocation && !initialCoordinates) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.current?.setCenter({ lat: latitude, lng: longitude });
            map.current?.setZoom(12);
          },
          () => {
            // Error getting location, use default
          }
        );
      }
    }

    return () => {
      if (marker.current) {
        marker.current.setMap(null);
        marker.current = null;
      }
      if (map.current) {
        map.current = null;
      }
    };
  }, [isMapVisible, initialCoordinates, onLocationSelect]);

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
                  setSearchQuery(suggestion.description);
                  setShowSuggestions(false);
                  handleSearch(suggestion.description);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
              >
                <div className="text-white font-medium">{suggestion.structured_formatting.main_text}</div>
                {suggestion.structured_formatting.secondary_text && (
                  <div className="text-slate-400 text-sm mt-0.5">{suggestion.structured_formatting.secondary_text}</div>
                )}
                <div className="text-slate-500 text-xs mt-1">
                  {suggestion.types?.join(', ') || 'Location'}
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
          {!GOOGLE_MAPS_API_KEY && (
            <div className="w-full h-96 rounded-lg border border-red-500 bg-red-500/10 flex items-center justify-center">
              <p className="text-red-400 text-center px-4">
                Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file
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
