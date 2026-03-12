import { apiClient } from './api';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login/', credentials);
      console.log('Login successful, setting token:', response.token);
      apiClient.setToken(response.token);
      
      // Verify token was set
      const storedToken = localStorage.getItem('auth_token');
      console.log('Token stored successfully:', !!storedToken);
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      console.log('Attempting logout...');
      await apiClient.post('/auth/logout/', {});
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      apiClient.clearToken();
      console.log('Token cleared from localStorage');
    }
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('auth_token');
    console.log('Getting current user, token available:', !!token);
    return apiClient.get<User>('/auth/me/');
  },

  isAuthenticated(): boolean {
    const hasToken = !!localStorage.getItem('auth_token');
    console.log('Authentication check:', hasToken);
    return hasToken;
  },
};
