import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { weatherService, WeatherData } from '../services/weatherService';
import 'leaflet/dist/leaflet.css';

type LatLngTuple = [number, number];

// Fix for default markers in react-leaflet
try {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  // @ts-ignore
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
} catch (e) {
  // Ignore errors in marker icon setup
}

interface Alert {
  _id: string;
  title: string;
  description: string;
  cropType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface MapViewProps {
  alerts: Alert[];
  userLocation?: { latitude: number; longitude: number };
  height?: string;
  showWeather?: boolean;
}

const createCustomIcon = (severity: string) => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444'
  };

  const icons = {
    low: '🌱',
    medium: '⚠️',
    high: '🚨',
    critical: '🔴'
  };

  const color = colors[severity as keyof typeof colors] || '#6b7280';
  const icon = icons[severity as keyof typeof icons] || '📍';
  
  try {
    // @ts-ignore
    return new L.Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="48" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <dropShadow dx="2" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
            </filter>
          </defs>
          <path d="M16 0C7.2 0 0 7.2 0 16S16 48 16 48 32 24.8 32 16 24.8 0 16 0z" fill="${color}" filter="url(#shadow)"/>
          <circle cx="16" cy="16" r="8" fill="white"/>
          <text x="16" y="20" text-anchor="middle" font-size="12" fill="${color}">${icon}</text>
        </svg>
      `)}`,
      iconSize: [32, 48],
      iconAnchor: [16, 48],
      popupAnchor: [0, -48],
    });
  } catch (e) {
    // Return undefined to use default icon if custom icon fails
    return undefined;
  }
};

const MapUpdater: React.FC<{ center: LatLngTuple }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({ alerts, userLocation, height = "400px", showWeather = true }) => {
  const [center, setCenter] = useState<LatLngTuple>([40.7128, -74.0060]); // Default to NYC
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherData }>({});
  const [loadingWeather, setLoadingWeather] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.latitude, userLocation.longitude]);
    } else if (alerts.length > 0) {
      // Center on first alert if no user location
      const firstAlert = alerts[0];
      setCenter([firstAlert.location.latitude, firstAlert.location.longitude]);
    }
  }, [userLocation, alerts]);

  // Auto-load weather for critical alerts
  useEffect(() => {
    if (showWeather && alerts.length > 0) {
      const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
      criticalAlerts.slice(0, 3).forEach(alert => {
        if (!weatherData[alert._id] && !loadingWeather[alert._id]) {
          fetchWeatherForLocation(alert._id, alert.location.latitude, alert.location.longitude);
        }
      });
    }
  }, [alerts, showWeather]);

  const fetchWeatherForLocation = async (alertId: string, latitude: number, longitude: number) => {
    if (!showWeather || weatherData[alertId] || loadingWeather[alertId]) return;

    setLoadingWeather(prev => ({ ...prev, [alertId]: true }));
    
    try {
      const weather = await weatherService.getWeatherByCoordinates(latitude, longitude);
      setWeatherData(prev => ({ ...prev, [alertId]: weather }));
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoadingWeather(prev => ({ ...prev, [alertId]: false }));
    }
  };

  return (
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{ height }}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <MapUpdater center={center} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {userLocation && (
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}
        
        {alerts.map((alert) => {
          const customIcon = createCustomIcon(alert.severity);
          return (
            <Marker
              key={alert._id}
              position={[alert.location.latitude, alert.location.longitude]}
              {...(customIcon && { icon: customIcon })}
              eventHandlers={{
                click: () => {
                  if (showWeather) {
                    fetchWeatherForLocation(alert._id, alert.location.latitude, alert.location.longitude);
                  }
                }
              }}
            >
              <Popup maxWidth={450} className="custom-popup weather-enhanced-popup">
              <div className="max-w-md">
                <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-3 -mx-3 -mt-3 mb-3 rounded-t-lg">
                  <h3 className="font-bold text-lg">{alert.title}</h3>
                  <p className="text-sm text-green-100 mt-1">{alert.description}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                        🌾 {alert.cropType}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.severity === 'critical' ? '🔴' : 
                         alert.severity === 'high' ? '🟠' :
                         alert.severity === 'medium' ? '🟡' : '🟢'} {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {alert.location.address && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-sm text-gray-700 flex items-center">
                        <span className="mr-2">📍</span>
                        {alert.location.address}
                      </p>
                    </div>
                  )}
                </div>

                {showWeather && (
                  <div className="border-t pt-3 bg-gradient-to-r from-blue-50 to-sky-50 -mx-3 -mb-3 mt-3 px-3 pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-blue-900 flex items-center">
                        <span className="text-lg mr-1">🌤️</span>
                        Weather Forecast
                      </h4>
                      {weatherData[alert._id] && (
                        <button
                          onClick={() => fetchWeatherForLocation(alert._id, alert.location.latitude, alert.location.longitude)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                          title="Refresh weather"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {loadingWeather[alert._id] ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-sm text-blue-700">Getting weather data...</span>
                      </div>
                    ) : weatherData[alert._id] ? (
                      <div className="space-y-3">
                        {/* Current Weather Display */}
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xl font-bold text-gray-900">
                                {weatherService.formatTemperature(weatherData[alert._id].currentConditions.temp)}
                              </div>
                              <div className="text-xs text-gray-600 capitalize">
                                {weatherData[alert._id].currentConditions.conditions}
                              </div>
                            </div>
                            <div className="text-3xl">
                              {weatherService.getWeatherIcon(weatherData[alert._id].currentConditions.icon)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                            <div className="text-center">
                              <div className="text-gray-500">💧 Humidity</div>
                              <div className="font-semibold text-blue-700">
                                {weatherService.formatHumidity(weatherData[alert._id].currentConditions.humidity)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">💨 Wind</div>
                              <div className="font-semibold text-blue-700">
                                {weatherService.formatWindSpeed(weatherData[alert._id].currentConditions.windspeed)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">🌧️ Rain</div>
                              <div className="font-semibold text-blue-700">
                                {weatherData[alert._id].currentConditions.precip || 0} mm
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Location and Time */}
                        <div className="text-xs text-blue-600 bg-white rounded px-2 py-1 text-center">
                          📍 {weatherData[alert._id].address} • Updated: {new Date().toLocaleTimeString()}
                        </div>
                        
                        {/* Agricultural Impact Indicator */}
                        <div className="bg-white rounded-lg p-2 border border-blue-100">
                          <div className="text-xs font-medium text-gray-700 mb-1">🌾 Crop Impact Assessment</div>
                          <div className="text-xs text-gray-600">
                            {weatherData[alert._id].currentConditions.temp > 30 ? 
                              "🔥 High temperature - Monitor crop stress" :
                              weatherData[alert._id].currentConditions.temp < 5 ?
                              "❄️ Low temperature - Frost risk possible" :
                              weatherData[alert._id].currentConditions.precip > 10 ?
                              "🌧️ Heavy rain - Monitor for flooding" :
                              "✅ Favorable conditions for crops"
                            }
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="mb-2 text-2xl">🌤️</div>
                        <button
                          onClick={() => fetchWeatherForLocation(alert._id, alert.location.latitude, alert.location.longitude)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                          Get Weather Forecast
                        </button>
                        <p className="text-xs text-blue-600 mt-1">Click to see current conditions</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t bg-gray-50 -mx-3 -mb-3 px-3 py-2 mt-4 rounded-b-lg">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center">
                      <span className="mr-1">👤</span>
                      Created by {alert.createdBy.name}
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1">📅</span>
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;