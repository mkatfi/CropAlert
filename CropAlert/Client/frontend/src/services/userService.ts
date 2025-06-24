import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'farmer' | 'agronomist';
  latitude?: number;
  longitude?: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: 'farmer' | 'agronomist';
  latitude?: number;
  longitude?: number;
}

class UserService {
  // Create a new user
  async createUser(userData: CreateUserDto): Promise<User> {
    const response = await api.post('/users/create', userData);
    return response.data;
  }

  // Get all farmers
  async getAllFarmers(): Promise<User[]> {
    const response = await api.get('/users/farmers');
    return response.data;
  }
}

export default new UserService();
