import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Filter, AlertTriangle, TrendingUp, Users, Leaf, Cloud } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import AlertCard from '../components/AlertCard';
import MapView from '../components/MapView';
import WeatherDashboard from '../components/WeatherDashboard';
import WeatherWidget from '../components/WeatherWidget';
import { useAuth } from '../contexts/AuthContext';

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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    cropType: '',
    severity: '',
    radius: 50, // km
  });
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [stats, setStats] = useState({
    totalAlerts: 0,
    criticalAlerts: 0,
    nearbyAlerts: 0,
  });

  useEffect(() => {
    getUserLocation();
    fetchAlerts();
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [filters, userLocation]);

  const getUserLocation = () => {
    if (user?.location) {
      setUserLocation(user.location);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  };

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      
      if (userLocation) {
        params.append('latitude', userLocation.latitude.toString());
        params.append('longitude', userLocation.longitude.toString());
        params.append('radius', filters.radius.toString());
      }
      
      if (filters.cropType) params.append('cropType', filters.cropType);
      if (filters.severity) params.append('severity', filters.severity);

      const response = await axios.get(`/ZoneData/update?${params.toString()}`);
      setAlerts(response.data);
      
      // Calculate stats
      const totalAlerts = response.data.length;
      const criticalAlerts = response.data.filter((alert: Alert) => alert.severity === 'critical').length;
      const nearbyAlerts = userLocation 
        ? response.data.filter((alert: Alert) => calculateDistance(
            userLocation.latitude, 
            userLocation.longitude, 
            alert.location.latitude, 
            alert.location.longitude
          ) <= 10).length 
        : 0;

      setStats({ totalAlerts, criticalAlerts, nearbyAlerts });
    } catch (error) {
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number; color: string }> = 
    ({ icon, title, value, color }) => (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
        </div>
      </motion.div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'farmer' 
              ? 'Stay informed about crop alerts in your area' 
              : 'Monitor and create crop alerts for your region'
            }
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Leaf className="h-6 w-6 text-emerald-600" />}
            title="Total Alerts"
            value={stats.totalAlerts}
            color="bg-emerald-100"
          />
          <StatCard
            icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
            title="Critical Alerts"
            value={stats.criticalAlerts}
            color="bg-red-100"
          />
          <StatCard
            icon={<MapPin className="h-6 w-6 text-blue-600" />}
            title="Nearby Alerts"
            value={stats.nearbyAlerts}
            color="bg-blue-100"
          />
          {/* Weather Widget as a stat card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <WeatherWidget 
              location={userLocation || undefined}
              className="h-full"
            />
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
              <select
                value={filters.cropType}
                onChange={(e) => setFilters({ ...filters, cropType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Crops</option>
                <option value="wheat">Wheat</option>
                <option value="corn">Corn</option>
                <option value="rice">Rice</option>
                <option value="soybeans">Soybeans</option>
                <option value="cotton">Cotton</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Radius (km)</label>
              <input
                type="number"
                value={filters.radius}
                onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                min="1"
                max="500"
              />
            </div>
          </div>
        </motion.div>

        {/* Map View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alert Map with Weather</h2>
          <MapView alerts={alerts} userLocation={userLocation || undefined} height="500px" showWeather={true} />
        </motion.div>

        {/* Weather Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <WeatherDashboard alerts={alerts} userLocation={userLocation || undefined} />
        </motion.div>

        {/* Alerts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Alerts</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <Leaf className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert._id}
                  alert={alert}
                  onClick={() => {
                    // Handle alert click - could open modal or navigate to detail
                    toast.success('Alert details would open here');
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;