// src/lib/api/client.ts
import { getBaseUrl } from './config';
import { authClient } from '../auth-client';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Define interceptor types
export type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>;
export type ResponseInterceptor<T = any> = (response: T, requestConfig: RequestInit) => T | Promise<T>;
export type ErrorInterceptor = (error: any) => any;

class ApiClient {
  private baseUrl: string;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor<T = any>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(interceptor);
  }

  // Add error interceptor
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  // Remove request interceptor
  removeRequestInterceptor(interceptor: RequestInterceptor): void {
    const index = this.requestInterceptors.indexOf(interceptor);
    if (index !== -1) {
      this.requestInterceptors.splice(index, 1);
    }
  }

  // Remove response interceptor
  removeResponseInterceptor<T = any>(interceptor: ResponseInterceptor<T>): void {
    const index = this.responseInterceptors.indexOf(interceptor);
    if (index !== -1) {
      this.responseInterceptors.splice(index, 1);
    }
  }

  // Remove error interceptor
  removeErrorInterceptor(interceptor: ErrorInterceptor): void {
    const index = this.errorInterceptors.indexOf(interceptor);
    if (index !== -1) {
      this.errorInterceptors.splice(index, 1);
    }
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Set default headers
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Get the token from Better Auth session
    let token: string | null = null;

    try {
      const session = await authClient.getSession();
      if (session?.session) {
        token = session.session.token;
      }
    } catch (error) {
      console.warn('Better Auth session not available');
    }

    // Add authorization header if token exists
    if (token) {
      headers = {
        ...headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    // Prepare request options
    let requestOptions: RequestInit = {
      ...options,
      headers,
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      try {
        requestOptions = await interceptor(requestOptions);
      } catch (error) {
        console.error('Request interceptor error:', error);
        throw error;
      }
    }

    try {
      const response = await fetch(url, requestOptions);

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        // Sign out Better Auth session
        try {
          await authClient.signOut();
        } catch (signOutError) {
          console.error('Error signing out from Better Auth:', signOutError);
        }

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized: Please log in again');
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error('Forbidden: You do not have permission to access this resource');
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new Error('Resource not found');
      }

      // Try to parse response as JSON
      let data: any;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses (like DELETE), return a success message
        data = { message: 'Success' };
      }

      // Check if response is successful
      if (!response.ok) {
        const error: ApiError = {
          message: data?.message || `HTTP error! status: ${response.status}`,
          status: response.status,
          details: data,
        };

        // Apply error interceptors
        let processedError = error;
        for (const interceptor of this.errorInterceptors) {
          try {
            processedError = await interceptor(processedError);
          } catch (interceptorError) {
            console.error('Error interceptor error:', interceptorError);
          }
        }

        throw processedError;
      }

      // Apply response interceptors
      let processedData = data;
      for (const interceptor of this.responseInterceptors) {
        try {
          processedData = await interceptor(processedData, requestOptions);
        } catch (interceptorError) {
          console.error('Response interceptor error:', interceptorError);
        }
      }

      return processedData;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError) {
        throw new Error('Network error: Please check your connection');
      }

      // Apply error interceptors
      let processedError = error;
      for (const interceptor of this.errorInterceptors) {
        try {
          processedError = await interceptor(processedError);
        } catch (interceptorError) {
          console.error('Error interceptor error:', interceptorError);
        }
      }

      // Re-throw processed error
      throw processedError;
    }
  }

  // HTTP method helpers
  get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Helper function to check if user is authenticated using Better Auth
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await authClient.getSession();
    return session?.session !== null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Helper function to get the current user using Better Auth
export async function getCurrentUser() {
  try {
    const session = await authClient.getSession();
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Helper function to sign out the user using Better Auth
export async function signOut(): Promise<void> {
  try {
    await authClient.signOut();
    // Optionally redirect to home page after sign out
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

// Helper function to get the token from Better Auth
export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await authClient.getSession();
    if (session?.session) {
      return session.session.token;
    }
  } catch (error) {
    console.warn('Better Auth session not available');
  }
  return null;
}