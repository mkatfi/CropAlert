import api from './api';

export interface ZoneData {
  id: number;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
  user?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateZoneDto {
  latitude: number;
  longitude: number;
  userId: number;
}

export interface UpdateZoneDto {
  title?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
}

class ZoneDataService {
  // Create a new zone
  async createZone(zoneData: CreateZoneDto): Promise<ZoneData> {
    const response = await api.post('/ZoneData/create', zoneData);
    return response.data;
  }

  // Update existing zone
  async updateZone(id: number, updateData: UpdateZoneDto): Promise<ZoneData> {
    const response = await api.patch(`/ZoneData/update/${id}`, updateData);
    return response.data;
  }

  // Get all zones
  async getAllZones(): Promise<ZoneData[]> {
    const response = await api.get('/ZoneData');
    return response.data;
  }

  // Get zone by ID
  async getZoneById(id: number): Promise<ZoneData> {
    const response = await api.get(`/ZoneData/${id}`);
    return response.data;
  }

  // Delete zone
  async deleteZone(id: number): Promise<{ message: string; id: number }> {
    const response = await api.delete(`/ZoneData/${id}`);
    return response.data;
  }
}

export default new ZoneDataService();
