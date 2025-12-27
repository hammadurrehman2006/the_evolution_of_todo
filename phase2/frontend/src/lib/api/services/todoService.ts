// src/lib/api/services/todoService.ts
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

// Define Todo interface
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Define request types
export interface CreateTodoRequest {
  title: string;
  description: string;
  completed?: boolean;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

// Todo service functions
export const todoService = {
  // Get all todos
  getAll: async (): Promise<Todo[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TODO.GET_ALL);
      // The backend returns an array directly or wrapped in a todos property
      return Array.isArray(response) ? response : response.todos || [];
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  },

  // Get a specific todo by ID
  getById: async (id: string): Promise<Todo> => {
    try {
      const endpoint = API_ENDPOINTS.TODO.GET_BY_ID(id);
      const response = await apiClient.get<Todo>(endpoint);
      return response;
    } catch (error) {
      console.error(`Error fetching todo with id ${id}:`, error);
      throw error;
    }
  },

  // Create a new todo
  create: async (data: CreateTodoRequest): Promise<Todo> => {
    try {
      const response = await apiClient.post<Todo>(API_ENDPOINTS.TODO.CREATE, data);
      return response;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  },

  // Update a todo
  update: async (id: string, data: UpdateTodoRequest): Promise<Todo> => {
    try {
      const endpoint = API_ENDPOINTS.TODO.UPDATE(id);
      const response = await apiClient.put<Todo>(endpoint, data);
      return response;
    } catch (error) {
      console.error(`Error updating todo with id ${id}:`, error);
      throw error;
    }
  },

  // Toggle todo completion status
  toggleCompletion: async (id: string): Promise<Todo> => {
    try {
      const endpoint = API_ENDPOINTS.TODO.TOGGLE(id);
      const response = await apiClient.patch<Todo>(endpoint);
      return response;
    } catch (error) {
      console.error(`Error toggling todo completion with id ${id}:`, error);
      throw error;
    }
  },

  // Delete a todo
  delete: async (id: string): Promise<void> => {
    try {
      const endpoint = API_ENDPOINTS.TODO.DELETE(id);
      await apiClient.delete(endpoint);
    } catch (error) {
      console.error(`Error deleting todo with id ${id}:`, error);
      throw error;
    }
  },
};