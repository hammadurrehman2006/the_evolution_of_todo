import { authClient } from './auth-client'
import { ApiError, ApiResponse } from './types'
import type { Todo } from './types'

/**
 * Centralized API Client for all remote communication
 *
 * This client handles:
 * - Automatic JWT token injection from Better Auth session
 * - Standardized error handling (401, 403, 404, 500)
 * - Request timeout configuration (10 seconds)
 * - Base URL configuration from environment
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://teot-phase2.vercel.app/'
const API_TIMEOUT_MS = 10000 // 10 seconds

export class ApiClient {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl: string = API_BASE_URL, timeout: number = API_TIMEOUT_MS) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    this.timeout = timeout
  }

  /**
   * Retrieve JWT token from Better Auth
   */
  private async getToken(): Promise<string | null> {
    try {
      // Get JWT token using the jwtClient plugin
      const { data, error } = await authClient.token()
      if (error) {
        console.error('Failed to retrieve auth token:', error)
        return null
      }
      if (data?.token) {
        return data.token
      }
      return null
    } catch (error) {
      console.error('Failed to retrieve auth token:', error)
      return null
    }
  }

  /**
   * Build full URL for API endpoint
   */
  private buildUrl(endpoint: string): string {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${this.baseUrl}${path}`
  }

  /**
   * Create timeout promise
   */
  private createTimeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new ApiError('Request timeout', 408)), this.timeout)
    })
  }

  /**
   * Handle API error responses
   */
  private handleError(status: number, message?: string, code?: string): ApiError {
    switch (status) {
      case 401:
        return new ApiError(message || 'Unauthorized - Please log in', 401, code)
      case 403:
        return new ApiError(message || 'Forbidden - You do not have permission', 403, code)
      case 404:
        return new ApiError(message || 'Resource not found', 404, code)
      case 500:
        return new ApiError(message || 'Internal server error', 500, code)
      default:
        return new ApiError(message || 'An unexpected error occurred', status, code)
    }
  }

  /**
   * Handle 401 unauthorized error - trigger logout and redirect
   */
  private async handle401Error(): Promise<void> {
    try {
      // Sign out the user
      await authClient.signOut()

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login?reason=session_expired'
      }
    } catch (error) {
      console.error('Error handling 401:', error)
      // Force redirect anyway
      if (typeof window !== 'undefined') {
        window.location.href = '/login?reason=session_expired'
      }
    }
  }

  /**
   * Core fetch method with authentication and error handling
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Get JWT token
    const token = await this.getToken()

    // Build headers with authentication
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add Authorization header if token available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Build full URL
    const url = this.buildUrl(endpoint)

    try {
      // Fetch with timeout
      const response = await Promise.race([
        fetch(url, {
          ...options,
          headers,
        }),
        this.createTimeout(),
      ]) as Response

      // Handle 401 unauthorized
      if (response.status === 401) {
        await this.handle401Error()
        throw new ApiError('Session expired - redirecting to login', 401)
      }

      // Handle non-success responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw this.handleError(
          response.status,
          errorData.message || errorData.error,
          errorData.code
        )
      }

      // Parse JSON response
      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Handle network errors
      console.error('API request failed:', error)
      throw new ApiError(
        'Network error - please check your connection',
        0,
        'NETWORK_ERROR'
      )
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * PUT request (partial update)
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // ============================
  // TODO-SPECIFIC API METHODS
  // ============================

  /**
   * Create a new todo
   * POST /api/todos
   */
  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    return this.post<Todo>('/api/todos', todo)
  }

  /**
   * Get all todos with optional filters
   * GET /api/todos?status=active&priority=high
   */
  async getTodos(filters?: {
    status?: 'all' | 'active' | 'completed'
    priority?: 'low' | 'medium' | 'high'
    search?: string
  }): Promise<Todo[]> {
    const queryParams = new URLSearchParams()

    if (filters?.status && filters.status !== 'all') {
      queryParams.append('status', filters.status)
    }
    if (filters?.priority) {
      queryParams.append('priority', filters.priority)
    }
    if (filters?.search) {
      queryParams.append('search', filters.search)
    }

    const queryString = queryParams.toString()
    const endpoint = queryString ? `/api/todos?${queryString}` : '/api/todos'

    return this.get<Todo[]>(endpoint)
  }

  /**
   * Get a single todo by ID
   * GET /api/todos/{id}
   */
  async getTodo(id: string): Promise<Todo> {
    return this.get<Todo>(`/api/todos/${id}`)
  }

  /**
   * Update a todo (partial update)
   * PUT /api/todos/{id}
   */
  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    return this.put<Todo>(`/api/todos/${id}`, updates)
  }

  /**
   * Delete a todo
   * DELETE /api/todos/{id}
   */
  async deleteTodo(id: string): Promise<void> {
    return this.delete<void>(`/api/todos/${id}`)
  }

  /**
   * Toggle todo completion status
   * PATCH /api/todos/{id}/toggle
   */
  async toggleTodo(id: string): Promise<Todo> {
    return this.patch<Todo>(`/api/todos/${id}/toggle`)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
