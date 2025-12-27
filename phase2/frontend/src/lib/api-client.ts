import { AuthSession } from './auth';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  }

  // Set authentication token
  setToken(token: string | null) {
    this.token = token;
  }

  // Get authentication token
  getToken(): string | null {
    return this.token;
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // First, ensure token is valid or refresh it
    await this.validateAndRefreshToken();

    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data,
        };
      } else {
        // Handle specific status codes
        if (response.status === 401) {
          // Token might be expired, remove it
          this.removeToken();
          localStorage.removeItem('access_token');
          // Optionally redirect to login page
          // window.location.href = '/login';
        }

        return {
          success: false,
          error: data.message || `HTTP Error: ${response.status}`,
          message: data.message || `Request failed with status ${response.status}`,
        };
      }
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        message: 'An error occurred while making the request',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<AuthSession>> {
    return this.request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<ApiResponse<{ user: any }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
  }

  async logout(): Promise<ApiResponse> {
    const result = this.request('/auth/logout', {
      method: 'POST',
    });

    if ((await result).success) {
      this.removeToken();
    }

    return result;
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/users/me');
  }

  // Todo methods
  async getTodos(): Promise<ApiResponse<any[]>> {
    return this.request('/todos');
  }

  async getTodoById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/todos/${id}`);
  }

  async createTodo(title: string, description: string): Promise<ApiResponse<any>> {
    return this.request('/todos', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  }

  async updateTodo(
    id: string,
    updates: Partial<{ title: string; description: string; completed: boolean }>
  ): Promise<ApiResponse<any>> {
    return this.request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async toggleTodoCompletion(id: string): Promise<ApiResponse<any>> {
    return this.request(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: true }),
    });
  }

  async deleteTodo(id: string): Promise<ApiResponse> {
    return this.request(`/todos/${id}`, {
      method: 'DELETE',
    });
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      // Consider token expired 5 minutes before actual expiration for safety
      return payload.exp < currentTime + 300;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for refresh token
      });

      const data = await response.json();

      if (response.ok) {
        const newToken = data.token || data.accessToken;
        if (newToken) {
          this.setToken(newToken);
          localStorage.setItem('access_token', newToken);
          return {
            success: true,
            data: { token: newToken },
          };
        } else {
          return {
            success: false,
            error: 'No token returned from refresh',
            message: 'Token refresh failed: no token in response',
          };
        }
      } else {
        return {
          success: false,
          error: data.message || `Refresh failed with status ${response.status}`,
          message: data.message || `Token refresh failed with status ${response.status}`,
        };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        message: 'An error occurred while refreshing the token',
      };
    }
  }

  // Validate and refresh token if needed
  async validateAndRefreshToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    // Check if token is about to expire (within 5 minutes)
    if (this.isTokenExpired(this.token)) {
      const refreshResult = await this.refreshToken();
      if (refreshResult.success && refreshResult.data?.token) {
        return true;
      } else {
        // Refresh failed, remove token
        this.removeToken();
        localStorage.removeItem('access_token');
        return false;
      }
    }

    // Token is still valid
    return true;
  }

  // Validate token
  async validateToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    if (this.isTokenExpired(this.token)) {
      return false;
    }

    // Optionally make a request to validate the token
    try {
      const response = await this.request('/users/me');
      return response.success;
    } catch (error) {
      return false;
    }
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Export the class for potential multiple instances if needed
export default ApiClient;