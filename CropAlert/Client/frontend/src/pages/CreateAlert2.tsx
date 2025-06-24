import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Leaf, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import MapLocationPicker from '../components/MapLocationPicker';
import { useAuth } from '../contexts/AuthContext';
import zoneService, { ZoneData } from '../services/zoneService';
import userService, { User } from '../services/userService';

const CreateAlert: React.FC = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { user } = useAuth();
  
  // Get editing zone from navigation state
  const editingZone = routerLocation.state?.editingZone as ZoneData | undefined;
  
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [farmers, setFarmers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    title: editingZone?.title || '',
    description: editingZone?.description || '',
    cropType: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  });
  const [locationState, setLocationState] = useState<{ latitude: number; longitude: number } | null>(
    editingZone ? { latitude: editingZone.latitude, longitude: editingZone.longitude } : null
  );

  const cropTypes = [
    'wheat', 'corn', 'rice', 'soybeans', 'cotton', 'barley', 'oats', 'sunflower', 'canola', 'potato'
  ];

  useEffect(() => {
    fetchZonesAndFarmers();
  }, []);

  const fetchZonesAndFarmers = async () => {
    try {
      setZonesLoading(true);
      const [zonesData, farmersData] = await Promise.all([
        zoneService.getAllZones(),
        userService.getAllFarmers()
      ]);
      
      setZones(zonesData);
      setFarmers(farmersData);
    } catch (error) {
      toast.error('Failed to fetch zones and farmers');
      console.error('Error fetching data:', error);
    } finally {
      setZonesLoading(false);
    }
  };

  const getLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setGettingLocation(false);
          toast.success('Location captured successfully');
        },
        (error) => {
          setGettingLocation(false);
          toast.error('Unable to get location');
          console.error('Location error:', error);
        }
      );
    } else {
      setGettingLocation(false);
      toast.error('Geolocation is not supported by this browser');
    }
  };

  const handleLocationSelect = (latitude: number, longitude: number) => {
    setLocationState({ latitude, longitude });
    setShowMapPicker(false);
    toast.success('Location selected successfully!');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationState) {
      toast.error('Please set a location for the alert');
      return;
    }

    setLoading(true);
    
    try {
      if (editingZone) {
        // Update existing zone
        const updateData = {
          title: formData.title,
          description: `${formData.description} (Crop: ${formData.cropType}, Severity: ${formData.severity})`,
          status: (formData.severity === 'critical' ? 'active' : 'pending') as 'active' | 'inactive' | 'pending'
        };
        
        await zoneService.updateZone(editingZone.id, updateData);
        toast.success('Zone updated successfully!');
        navigate('/dashboard');
      } else {
        // Create a new zone with the alert data
        const zoneData = {
          latitude: locationState.latitude,
          longitude: locationState.longitude,
          userId: user?.id || farmers[0]?.id || 1,
        };
        
        const createdZone = await zoneService.createZone({
          ...zoneData,
          userId: Number(zoneData.userId)
        });
        
        // Update zone with alert details
        if (createdZone) {
          await zoneService.updateZone(createdZone.id, {
            title: formData.title,
            description: `${formData.description} (Crop: ${formData.cropType}, Severity: ${formData.severity})`,
            status: (formData.severity === 'critical' ? 'active' : 'pending') as 'active' | 'inactive' | 'pending'
          });
        }
        
        toast.success('Alert/Zone created successfully!');
        fetchZonesAndFarmers();
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          cropType: '',
          severity: 'medium',
        });
        setLocationState(null);
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create/update alert');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {editingZone ? `Edit Zone: ${editingZone.title || `Zone ${editingZone.id}`}` : 'Create New Alert'}
          </h1>
          <p className="text-gray-600">
            {editingZone ? 'Update zone information and location' : 'Share important crop information with farmers in your area'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingZone ? 'Zone Title' : 'Alert Title'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="e.g., Pest outbreak detected in corn fields"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Provide detailed information..."
                    required
                  />
                </div>

                {!editingZone && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Crop Type
                      </label>
                      <select
                        value={formData.cropType}
                        onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required
                      >
                        <option value="">Select crop type</option>
                        {cropTypes.map((crop) => (
                          <option key={crop} value={crop}>
                            {crop.charAt(0).toUpperCase() + crop.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Severity Level
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['low', 'medium', 'high', 'critical'] as const).map((severity) => (
                          <label
                            key={severity}
                            className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.severity === severity
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="severity"
                              value={severity}
                              checked={formData.severity === severity}
                              onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                              className="sr-only"
                            />
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className={`h-4 w-4 ${getSeverityColor(severity)}`} />
                              <span className={`capitalize font-medium ${getSeverityColor(severity)}`}>
                                {severity}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={getLocation}
                      disabled={gettingLocation}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <MapPin className="h-5 w-5 text-gray-400" />
                      {gettingLocation ? (
                        <span>Getting location...</span>
                      ) : locationState ? (
                        <span className="text-emerald-600">Location set ({locationState.latitude.toFixed(4)}, {locationState.longitude.toFixed(4)})</span>
                      ) : (
                        <span>Use current location</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <span>Select on map</span>
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !locationState}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{editingZone ? 'Updating zone...' : 'Creating alert...'}</span>
                    </div>
                  ) : (
                    editingZone ? 'Update Zone' : 'Create Alert'
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Map Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingZone ? 'Zone Location Preview' : 'Alert Location Preview'}
              </h3>
              
              {locationState ? (
                <MapView
                  alerts={[]}
                  userLocation={locationState}
                  height="400px"
                />
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Set location to preview on map</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Map Location Picker Modal */}
        {showMapPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Select Alert Location</h2>
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
                initialPosition={locationState ? [locationState.latitude, locationState.longitude] : [33.97, -6.85]}
              />
            </div>
          </div>
        )}

        {/* Existing Zones Section */}
        {!editingZone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Existing Agricultural Zones</h2>
              
              {zonesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : (
                <>
                  {zones.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {zones.map((zone) => (
                        <ZoneCard 
                          key={zone.id} 
                          zone={zone} 
                          onUpdate={handleUpdateZone}
                          onDelete={handleDeleteZone}
                          userRole={user?.role}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No zones found</h3>
                      <p className="text-gray-500">Create your first zone using the form above.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Zone Card Component
const ZoneCard: React.FC<{ 
  zone: ZoneData; 
  onUpdate: (id: number, data: any) => void;
  onDelete: (id: number) => void;
  userRole?: string;
}> = ({ zone, onUpdate, onDelete, userRole }) => {
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
                onClick={() => setEditing(true)}
                className="w-full bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Edit className="h-3 w-3" />
                <span>Edit Zone</span>
              </button>
              {userRole === 'agronomist' && (
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

export default CreateAlert;
