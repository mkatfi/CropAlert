import React from 'react';
import { AlertTriangle, MapPin, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface AlertCardProps {
  alert: Alert;
  onClick?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const baseClasses = "h-4 w-4";
    switch (severity) {
      case 'critical': return <AlertTriangle className={`${baseClasses} text-red-600`} />;
      default: return <AlertTriangle className={`${baseClasses}`} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{alert.title}</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getSeverityColor(alert.severity)}`}>
          {getSeverityIcon(alert.severity)}
          <span className="capitalize">{alert.severity}</span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{alert.description}</p>

      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-medium">
            {alert.cropType}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <span>{alert.location.address || `${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}`}</span>
        </div>

        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{alert.createdBy.name}</span>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertCard;