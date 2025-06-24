import React, { useState, useEffect } from 'react';
import { Cloud, MapPin, RefreshCw } from 'lucide-react';
import { weatherService, WeatherData } from '../services/weatherService';

interface WeatherWidgetProps {
  location?: { latitude: number; longitude: number };
  city?: string;
  compact?: boolean;
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  location, 
  city, 
  compact = false, 
  className = '' 
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeather();
  }, [location, city]);

  const loadWeather = async () => {
    if (!location && !city) return;

    setLoading(true);
    setError(null);

    try {
      let weatherData: WeatherData;
      
      if (city) {
        weatherData = await weatherService.getWeatherByCity(city);
      } else if (location) {
        weatherData = await weatherService.getWeatherByCoordinates(location.latitude, location.longitude);
      } else {
        throw new Error('No location or city provided');
      }

      setWeather(weatherData);
    } catch (err) {
      setError('Failed to load weather');
      console.error('Weather loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm text-gray-500">Loading weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <Cloud className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">{error || 'No weather data'}</p>
        <button
          onClick={loadWeather}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  const current = weather.currentConditions;

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 p-2 ${className}`}>
        <span className="text-lg">{weatherService.getWeatherIcon(current.icon)}</span>
        <div>
          <div className="font-semibold text-sm">
            {weatherService.formatTemperature(current.temp)}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {current.conditions}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium truncate">
            {city || weather.address}
          </span>
        </div>
        <button
          onClick={loadWeather}
          className="p-1 hover:bg-blue-400 rounded transition-colors"
          title="Refresh weather"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">
            {weatherService.formatTemperature(current.temp)}
          </div>
          <div className="text-sm text-blue-100 capitalize">
            {current.conditions}
          </div>
        </div>
        <div className="text-3xl">
          {weatherService.getWeatherIcon(current.icon)}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-blue-100">
        <span>Humidity: {weatherService.formatHumidity(current.humidity)}</span>
        <span>Wind: {weatherService.formatWindSpeed(current.windspeed)}</span>
      </div>
    </div>
  );
};

export default WeatherWidget;
