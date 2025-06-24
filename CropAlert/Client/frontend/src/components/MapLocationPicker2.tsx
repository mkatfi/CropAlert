import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type LatLngTuple = [number, number];

interface LocationPickerProps {
  onLocationSelect?: (latitude: number, longitude: number) => void;
  initialPosition?: LatLngTuple;
}

const LocationMarker: React.FC<{
  position: LatLngTuple | null;
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ position, onLocationSelect }) => {
  useMapEvents({
    click(e: any) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position} />;
};

const MapLocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect,
  initialPosition = [33.97, -6.85] // Default to Morocco
}) => {
  const [selectedPosition, setSelectedPosition] = useState<LatLngTuple | null>(null);

  const handleLocationSelect = (latitude: number, longitude: number) => {
    const newPosition: LatLngTuple = [latitude, longitude];
    setSelectedPosition(newPosition);
    onLocationSelect?.(latitude, longitude);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationSelect(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please click on the map to select a location.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Select Location</h3>
        <button
          onClick={handleGetCurrentLocation}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Use Current Location
        </button>
      </div>
      
      {selectedPosition && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            Selected Location: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
          </p>
        </div>
      )}

      <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ height: '400px' }}>
        <MapContainer
          center={initialPosition}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={selectedPosition} 
            onLocationSelect={handleLocationSelect}
          />
        </MapContainer>
      </div>
      
      <p className="mt-2 text-sm text-gray-600">
        Click on the map to select a location, or use the "Use Current Location" button.
      </p>
    </div>
  );
};

export default MapLocationPicker;
