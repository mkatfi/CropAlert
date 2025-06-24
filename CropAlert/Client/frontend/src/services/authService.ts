import api from './api';

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'farmer' | 'agronomist';
  };
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: 'farmer' | 'agronomist';
  latitude?: number;
  longitude?: number;
}

class AuthService {
  // Register new user
  async register(userData: RegisterDto): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  // Login user
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  // Get current user profile (if you implement this endpoint)
  async getProfile(): Promise<any> {
    const response = await api.get('/auth/profile');
    return response.data;
  }
}

export default new AuthService();
