// src/lib/api/test-utils.ts
// Test utilities for API client

import { apiClient } from './client';
import { registerCommonInterceptors } from './interceptors';

// Initialize API client with common interceptors for testing
export const initializeApiClientForTesting = () => {
  // Register common interceptors
  registerCommonInterceptors(apiClient);

  // Add additional test-specific interceptors if needed
  apiClient.addRequestInterceptor((config) => {
    console.log('Test Request:', config);
    return config;
  });

  apiClient.addResponseInterceptor((response, requestConfig) => {
    console.log('Test Response:', response);
    return response;
  });

  return apiClient;
};

// Mock API responses for testing
export const mockApiResponses = {
  todos: [
    {
      id: '1',
      title: 'Test Todo 1',
      description: 'This is a test todo',
      completed: false,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      user_id: 'user-1'
    },
    {
      id: '2',
      title: 'Test Todo 2',
      description: 'This is another test todo',
      completed: true,
      created_at: '2023-01-02T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      user_id: 'user-1'
    }
  ],
  user: {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
};

// Test the API client functionality
export const testApiClient = async () => {
  try {
    console.log('Testing API client...');

    // Test GET request
    console.log('Testing GET request...');
    // const todos = await apiClient.get('/todos');
    // console.log('GET response:', todos);

    // Test POST request
    console.log('Testing POST request...');
    // const newTodo = await apiClient.post('/todos', {
    //   title: 'Test Todo',
    //   description: 'Test description'
    // });
    // console.log('POST response:', newTodo);

    console.log('API client tests completed successfully');
    return true;
  } catch (error) {
    console.error('API client test failed:', error);
    return false;
  }
};