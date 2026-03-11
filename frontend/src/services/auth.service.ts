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
    const response = await apiClient.post<LoginResponse>('/auth/login/', credentials);
    apiClient.setToken(response.token);
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout/', {});
    } finally {
      apiClient.clearToken();
    }
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me/');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};
