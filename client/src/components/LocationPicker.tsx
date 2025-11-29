import { useEffect, useRef, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

declare global {
  interface Window {
    google: typeof google | undefined;
    initGoogleMaps?: () => void;
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
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Load Google Maps script once
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    // Check if script already exists to prevent duplicate loading
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    
    if (existingScript) {
      // Script exists, check if Google is loaded
      if (window.google?.maps?.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        geocoder.current = new window.google.maps.Geocoder();
      }
      return;
    }

    if (window.google?.maps?.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      geocoder.current = new window.google.maps.Geocoder();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Initialize services once script loads
      if (window.google?.maps?.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        geocoder.current = new window.google.maps.Geocoder();
      }
    };
    
    document.head.appendChild(script);

    return () => {
      // We don't remove the script to avoid reloading Maps; it's fine to keep.
    };
  }, [GOOGLE_MAPS_API_KEY]);

  // Initialize services when Google is ready (backup check)
  useEffect(() => {
    if (!window.google?.maps?.places) return;
    if (autocompleteService.current) return; // Already initialized

    autocompleteService.current = new window.google.maps.places.AutocompleteService();
    geocoder.current = new window.google.maps.Geocoder();
  }, []);

  // Fetch suggestions as user types
  const fetchSuggestions = (query: string) => {
    if (!autocompleteService.current || !query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'in' }, // bias to India
        types: ['establishment', 'geocode'],
      },
      (predictions, status) => {
        if (
          status === window.google!.maps.places.PlacesServiceStatus.OK &&
          predictions &&
          predictions.length > 0
        ) {
          setSuggestions(predictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  };

  const setLocationFromLatLng = (lat: number, lng: number, address?: string) => {
    const position = { lat, lng };

    // Update marker
    if (map.current) {
      if (marker.current) {
        marker.current.setPosition(position);
      } else {
        marker.current = new window.google.maps.Marker({
          position,
          map: map.current,
          draggable: true,
        });

        marker.current.addListener('dragend', () => {
          const pos = marker.current!.getPosition();
          if (!pos || !geocoder.current) return;

          geocoder.current.geocode({ location: pos }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const addr = results[0].formatted_address;
              setSearchQuery(addr);
              onLocationSelect({
                address: addr,
                longitude: pos.lng(),
                latitude: pos.lat(),
              });
            }
          });
        });
      }

      map.current.setCenter(position);
      map.current.setZoom(14);
    }

    // If address already known
    if (address) {
      setSearchQuery(address);
      onLocationSelect({ address, longitude: lng, latitude: lat });
      return;
    }

    // Reverse geocode if needed
    if (geocoder.current) {
      geocoder.current.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const addr = results[0].formatted_address;
          setSearchQuery(addr);
          onLocationSelect({
            address: addr,
            longitude: lng,
            latitude: lat,
          });
        } else {
          const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setSearchQuery(fallback);
          onLocationSelect({
            address: fallback,
            longitude: lng,
            latitude: lat,
          });
        }
      });
    }
  };

  const handleSearch = (query?: string) => {
    const searchTerm = (query || searchQuery).trim();
    if (!searchTerm || !window.google || !geocoder.current) return;

    setIsSearching(true);
    setShowSuggestions(false);

    geocoder.current.geocode(
      {
        address: searchTerm,
        componentRestrictions: { country: 'in' },
      },
      (results, status) => {
        setIsSearching(false);
        
        if (status === 'OK' && results && results.length > 0) {
          // Filter out generic country-level results
          const specificResults = results.filter(
            (r) => r.formatted_address && r.formatted_address.trim().toLowerCase() !== 'india'
          );

          let chosen = specificResults.length > 0 ? specificResults[0] : results[0];

          const loc = chosen.geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          const addr = chosen.formatted_address || searchTerm;
          
          setLocationFromLatLng(lat, lng, addr);
        } else {
          alert('Location not found. Please try a different search term or click on the map.');
        }
      }
    );
  };

  const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    const label = prediction.description;
    setSearchQuery(label);
    setShowSuggestions(false);

    // Prefer Places details if service is available and map is ready
    if (placesService.current) {
      placesService.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['geometry', 'formatted_address'],
        },
        (place, status) => {
          if (
            status === window.google!.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry &&
            place.geometry.location
          ) {
            const loc = place.geometry.location;
            const lat = loc.lat();
            const lng = loc.lng();
            const addr = place.formatted_address || label;
            setLocationFromLatLng(lat, lng, addr);
          } else {
            // Fallback to geocode by text
            handleSearch(label);
          }
        }
      );
    } else {
      // If Places service not ready yet, just geocode the text
      handleSearch(label);
    }
  };

  // Handle input change with debounced suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length >= 2 && window.google) {
      searchTimeoutRef.current = window.setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Initialize map when visible
  useEffect(() => {
    if (!isMapVisible) {
      if (marker.current) {
        marker.current.setMap(null);
        marker.current = null;
      }
      return;
    }

    let checkInterval: number | null = null;

    const initMap = () => {
      if (!mapContainer.current || !window.google || map.current) return;

      const defaultCenter = initialCoordinates
        ? { lat: initialCoordinates[1], lng: initialCoordinates[0] }
        : { lat: 28.6139, lng: 77.209 };

      map.current = new window.google.maps.Map(mapContainer.current, {
        center: defaultCenter,
        zoom: initialCoordinates ? 14 : 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      placesService.current = new window.google.maps.places.PlacesService(map.current);
      geocoder.current = new window.google.maps.Geocoder();

      // Map click to set marker & reverse geocode
      map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setLocationFromLatLng(lat, lng);
      });

      // If initial coordinates, set marker
      if (initialCoordinates) {
        setLocationFromLatLng(
          initialCoordinates[1],
          initialCoordinates[0],
          initialAddress || undefined
        );
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocationFromLatLng(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            // ignore error, keep default center
          }
        );
      }
    };

    if (window.google) {
      initMap();
    } else {
      // Poll until Google Maps script has loaded
      checkInterval = window.setInterval(() => {
        if (window.google) {
          window.clearInterval(checkInterval!);
          initMap();
        }
      }, 200);
    }

    return () => {
      if (checkInterval) {
        window.clearInterval(checkInterval);
      }
      if (marker.current) {
        marker.current.setMap(null);
        marker.current = null;
      }
      // Do not reset map.current here to avoid flicker
    };
  }, [isMapVisible]);

  // Cleanup search debounce
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        window.clearTimeout(searchTimeoutRef.current);
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
        <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-emerald-500">
          <Search className="ml-3 mr-2 w-5 h-5 text-slate-500" />
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
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Search for Indian universities, shops, or addresses..."
            className="flex-1 bg-transparent border-none outline-none py-3 pr-2 text-white placeholder-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="mr-3 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                type="button"
                onClick={() => handleSelectPrediction(s)}
                className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
              >
                <div className="text-white font-medium">
                  {s.structured_formatting.main_text}
                </div>
                {s.structured_formatting.secondary_text && (
                  <div className="text-slate-400 text-sm mt-0.5">
                    {s.structured_formatting.secondary_text}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-500 mt-1">
          {isMapVisible
            ? 'Type to see suggestions, press Enter to search, or click on the map to set location'
            : 'Type to see suggestions, press Enter to search, or click \"Show Map\" to use the interactive map'}
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
        </div>
      )}
    </div>
  );
}


