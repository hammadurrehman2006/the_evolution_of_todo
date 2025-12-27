// src/lib/api/services/userService.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

// Define User interface
export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

// Define request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// User service functions
export const userService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return response;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Register
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
      return response;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },
};