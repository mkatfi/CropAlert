import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus, X, RefreshCw } from 'lucide-react';
import { weatherService, WeatherData, LocationWeather } from '../services/weatherService';
import WeatherCard from './WeatherCard';
import toast from 'react-hot-toast';

interface WeatherDashboardProps {
  alerts?: Array<{
    _id: string;
    location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
  }>;
  userLocation?: { latitude: number; longitude: number };
}

const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ alerts = [], userLocation }) => {
  const [weatherLocations, setWeatherLocations] = useState<LocationWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [showAddCity, setShowAddCity] = useState(false);

  useEffect(() => {
    loadInitialWeather();
  }, [userLocation, alerts]);

  const loadInitialWeather = async () => {
    if (!userLocation && alerts.length === 0) return;

    setLoading(true);
    try {
      const locations: Array<{ latitude: number; longitude: number; name?: string }> = [];

      // Add user location
      if (userLocation) {
        locations.push({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          name: 'Your Location'
        });
      }

      // Add unique alert locations (max 3 to avoid too many API calls)
      const uniqueAlertLocations = alerts
        .filter((alert, index, self) => 
          index === self.findIndex(a => 
            Math.abs(a.location.latitude - alert.location.latitude) < 0.01 &&
            Math.abs(a.location.longitude - alert.location.longitude) < 0.01
          )
        )
        .slice(0, 3)
        .map(alert => ({
          latitude: alert.location.latitude,
          longitude: alert.location.longitude,
          name: alert.location.address || `Alert Location ${alert._id.slice(-4)}`
        }));

      locations.push(...uniqueAlertLocations);

      if (locations.length > 0) {
        const weatherData = await weatherService.getWeatherForMultipleLocations(locations);
        setWeatherLocations(weatherData);
      }
    } catch (error) {
      console.error('Failed to load weather data:', error);
      toast.error('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const addCityWeather = async () => {
    if (!cityInput.trim()) return;

    setLoading(true);
    try {
      const weather = await weatherService.getWeatherByCity(cityInput);
      const newLocation: LocationWeather = {
        location: cityInput,
        latitude: 0, // Will be provided by the weather API response
        longitude: 0, // Will be provided by the weather API response
        weather
      };

      setWeatherLocations(prev => [...prev, newLocation]);
      setCityInput('');
      setShowAddCity(false);
      toast.success(`Weather added for ${cityInput}`);
    } catch (error) {
      console.error('Failed to add city weather:', error);
      toast.error('Failed to add weather for this city');
    } finally {
      setLoading(false);
    }
  };

  const removeWeatherLocation = (index: number) => {
    setWeatherLocations(prev => prev.filter((_, i) => i !== index));
  };

  const refreshWeather = async () => {
    if (weatherLocations.length === 0) return;

    setLoading(true);
    try {
      const locations = weatherLocations.map(loc => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
        name: loc.location
      }));

      const updatedWeather = await weatherService.getWeatherForMultipleLocations(locations);
      setWeatherLocations(updatedWeather);
      toast.success('Weather data refreshed');
    } catch (error) {
      console.error('Failed to refresh weather:', error);
      toast.error('Failed to refresh weather data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">Weather Information</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshWeather}
            disabled={loading || weatherLocations.length === 0}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh weather data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setShowAddCity(!showAddCity)}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add City</span>
          </button>
        </div>
      </div>

      {showAddCity && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addCityWeather()}
            />
            <button
              onClick={addCityWeather}
              disabled={loading || !cityInput.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddCity(false);
                setCityInput('');
              }}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {loading && weatherLocations.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading weather data...</span>
        </div>
      ) : weatherLocations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No weather data</h3>
          <p className="text-gray-500 mb-4">Add a city to see weather information</p>
          <button
            onClick={() => setShowAddCity(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add City
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weatherLocations.map((locationWeather, index) => (
            <motion.div
              key={`${locationWeather.location}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <button
                onClick={() => removeWeatherLocation(index)}
                className="absolute top-2 right-2 z-10 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="group">
                <WeatherCard weather={locationWeather.weather} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default WeatherDashboard;
