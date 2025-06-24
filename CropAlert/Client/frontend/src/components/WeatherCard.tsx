import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Wind, Thermometer } from 'lucide-react';
import { WeatherData, weatherService } from '../services/weatherService';

interface WeatherCardProps {
  weather: WeatherData;
  compact?: boolean;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, compact = false }) => {
  const current = weather.currentConditions;
  const today = weather.days[0];

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-3 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">
              {weatherService.formatTemperature(current.temp)}
            </div>
            <div className="text-xs opacity-90 capitalize">
              {current.conditions}
            </div>
          </div>
          <div className="text-2xl">
            {weatherService.getWeatherIcon(current.icon)}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold truncate">
            {weather.address}
          </h3>
          <p className="text-blue-100 text-sm capitalize">
            {current.conditions}
          </p>
        </div>
        <div className="text-4xl">
          {weatherService.getWeatherIcon(current.icon)}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="text-3xl font-bold">
          {weatherService.formatTemperature(current.temp)}
        </div>
        <div className="text-right text-sm text-blue-100">
          <div>H: {weatherService.formatTemperature(today.tempmax)}</div>
          <div>L: {weatherService.formatTemperature(today.tempmin)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Droplets className="h-4 w-4 text-blue-200" />
          <div className="text-sm">
            <div className="text-blue-100">Humidity</div>
            <div className="font-semibold">{weatherService.formatHumidity(current.humidity)}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Wind className="h-4 w-4 text-blue-200" />
          <div className="text-sm">
            <div className="text-blue-100">Wind</div>
            <div className="font-semibold">{weatherService.formatWindSpeed(current.windspeed)}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Cloud className="h-4 w-4 text-blue-200" />
          <div className="text-sm">
            <div className="text-blue-100">Precipitation</div>
            <div className="font-semibold">{current.precip || 0} mm</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Thermometer className="h-4 w-4 text-blue-200" />
          <div className="text-sm">
            <div className="text-blue-100">Feels like</div>
            <div className="font-semibold">{weatherService.formatTemperature(current.temp)}</div>
          </div>
        </div>
      </div>

      {weather.description && (
        <div className="mt-4 pt-4 border-t border-blue-400">
          <p className="text-sm text-blue-100">
            {weather.description}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default WeatherCard;
