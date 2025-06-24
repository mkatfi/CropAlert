import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Filter, AlertTriangle, TrendingUp, Users, Leaf, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import zoneService, { ZoneData } from '../services/zoneService';
import userService, { User } from '../services/userService';
import MapView from '../components/MapView';
import MapLocationPicker from '../components/MapLocationPicker';
import WeatherDashboard from '../components/WeatherDashboard';
import WeatherWidget from '../components/WeatherWidget';

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


const NewDashboard: React.FC = () => {
  const navigate = useNavigate();
      
const [alerts, setAlerts] = useState<Alert[]>([]);
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [farmers, setFarmers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateZone, setShowCreateZone] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [newZone, setNewZone] = useState({
    latitude: '',
    longitude: '',
    userId: ''
  });
  
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Set default location (Morocco) if geolocation fails
          setUserLocation({
            latitude: 33.97,
            longitude: -6.85,
          });
        }
      );
    } else {
      // Set default location if geolocation is not supported
      setUserLocation({
        latitude: 33.97,
        longitude: -6.85,
      });
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [zonesData, farmersData] = await Promise.all([
        zoneService.getAllZones(),
        userService.getAllFarmers()
      ]);
      
      setZones(zonesData);
      setFarmers(farmersData);
      
      // Create sample alerts from zones for weather integration
      const sampleAlerts: Alert[] = zonesData.slice(0, 5).map((zone, index) => ({
        _id: `alert_${zone.id}`,
        title: `${zone.title || `Zone ${zone.id}`} Alert`,
        description: zone.description || `Agricultural monitoring alert for ${zone.title || `Zone ${zone.id}`}`,
        cropType: ['wheat', 'corn', 'rice', 'soybeans', 'cotton'][index % 5],
        severity: ['low', 'medium', 'high', 'critical'][index % 4] as 'low' | 'medium' | 'high' | 'critical',
        location: {
          latitude: zone.latitude,
          longitude: zone.longitude,
          address: `Zone ${zone.id} Location`,
        },
        createdBy: {
          name: zone.user?.name || 'System',
          email: zone.user?.email || 'system@cropalert.com',
        },
        createdAt: zone.createdAt || new Date().toISOString(),
      }));
      
      setAlerts(sampleAlerts);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const zoneData = {
        latitude: parseFloat(newZone.latitude),
        longitude: parseFloat(newZone.longitude),
        userId: parseInt(newZone.userId)
      };
      
      const createdZone = await zoneService.createZone(zoneData);
      setZones([...zones, createdZone]);
      setShowCreateZone(false);
      setNewZone({ latitude: '', longitude: '', userId: '' });
      toast.success('Zone created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create zone');
    }
  };

  const handleUpdateZone = async (id: number, updateData: any) => {
    try {
      const updatedZone = await zoneService.updateZone(id, updateData);
      setZones(zones.map(zone => zone.id === id ? updatedZone : zone));
      toast.success('Zone updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update zone');
    }
  };

  const handleDeleteZone = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this zone?')) {
      return;
    }
    
    try {
      await zoneService.deleteZone(id);
      setZones(zones.filter(zone => zone.id !== id));
      toast.success('Zone deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete zone');
    }
  };

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setNewZone({
      ...newZone,
      latitude: latitude.toString(),
      longitude: longitude.toString()
    });
    setShowMapPicker(false);
    toast.success('Location selected successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor your agricultural zones and manage crop data
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <MapPin className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Zones</p>
                <p className="text-2xl font-bold text-gray-900">{zones.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{farmers.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Zones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {zones.filter(z => z.status === 'active').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">+12%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Create Zone Section */}
        {user?.role === 'farmer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Zone Management</h2>
              <button
                onClick={() => setShowCreateZone(!showCreateZone)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Zone</span>
              </button>
            </div>

            {showCreateZone && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Create New Zone</h3>
                <form onSubmit={handleCreateZone} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={newZone.latitude}
                        onChange={(e) => setNewZone({...newZone, latitude: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., 34.05"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={newZone.longitude}
                        onChange={(e) => setNewZone({...newZone, longitude: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., -6.75"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <MapPin className="h-5 w-5" />
                      <span>Select Location on Map</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign to Farmer
                    </label>
                    <select
                      value={newZone.userId}
                      onChange={(e) => setNewZone({...newZone, userId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="">Select Farmer</option>
                      {farmers.map(farmer => (
                        <option key={farmer.id} value={farmer.id}>
                          {farmer.name} ({farmer.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Create Zone
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateZone(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Map Location Picker Modal */}
        {showMapPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Select Zone Location</h2>
                <button
                  onClick={() => setShowMapPicker(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <MapLocationPicker
                onLocationSelect={handleLocationSelect}
                initialPosition={[33.97, -6.85]}
              />
            </div>
          </div>
        )}
        
          {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alert Map</h2>
          <MapView alerts={alerts} userLocation={userLocation || undefined} height="500px" />
        </motion.div> */}

        {/* Alert Map with Weather */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Zone Alert Map </h2>
          <div className="bg-white rounded-xl shadow-lg p-1">
            <MapView 
              alerts={alerts} 
              userLocation={userLocation || undefined} 
              height="500px" 
              showWeather={true}
            />
          </div>
        </motion.div>


        {/* Zones List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Zones</h2>
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone) => (
              <ZoneCard 
                key={zone.id} 
                zone={zone} 
                onUpdate={handleUpdateZone}
                onDelete={handleDeleteZone}
                onEdit={(zone) => navigate('/create-alert', { state: { editingZone: zone } })}
                userRole={user?.role}
              />
            ))}
          </div>
          
          {zones.length === 0 && (
            <div className="text-center py-12">
              <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No zones found</h3>
              <p className="text-gray-500">Create your first zone to get started.</p>
            </div>
          )}
        </motion.div>

        {/* Farmers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Farmers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmers.map((farmer) => (
              <div key={farmer.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{farmer.name}</h3>
                    <p className="text-sm text-gray-500">{farmer.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{farmer.role}</p>
                  </div>
                </div>
                {farmer.latitude && farmer.longitude && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Location: {farmer.latitude}, {farmer.longitude}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Zone Card Component
const ZoneCard: React.FC<{ 
  zone: ZoneData; 
  onUpdate: (id: number, data: any) => void;
  onDelete: (id: number) => void;
  onEdit?: (zone: ZoneData) => void;
  userRole?: string;
}> = ({ zone, onUpdate, onDelete, onEdit, userRole }) => {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: zone.title || '',
    description: zone.description || '',
    status: zone.status || 'pending'
  });

  const handleUpdate = () => {
    onUpdate(zone.id, editData);
    setEditing(false);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">
          {zone.title || `Zone ${zone.id}`}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(zone.status)}`}>
          {zone.status || 'pending'}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-2">
        {zone.description || 'No description provided'}
      </p>
      
      <div className="text-xs text-gray-500 mb-3">
        <p>📍 {zone.latitude}, {zone.longitude}</p>
        {zone.user && <p>👤 {zone.user.name}</p>}
        {zone.createdAt && (
          <p>📅 {new Date(zone.createdAt).toLocaleDateString()}</p>
        )}
      </div>

      {userRole === 'agronomist' && (
        <div className="space-y-2">
          {editing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({...editData, title: e.target.value})}
                placeholder="Zone title"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                placeholder="Zone description"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded h-20"
              />
              <select
                value={editData.status}
                onChange={(e) => setEditData({...editData, status: e.target.value as any})}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdate}
                  className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => onEdit ? onEdit(zone) : setEditing(true)}
                className="w-full bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Edit className="h-3 w-3" />
                <span>{onEdit ? 'Edit in CreateAlert' : 'Edit Zone'}</span>
              </button>
              {(userRole === 'agronomist') && (
                <button
                  onClick={() => onDelete(zone.id)}
                  className="w-full bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete Zone</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewDashboard;
