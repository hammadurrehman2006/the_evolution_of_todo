// src/lib/api/config.ts
// Configuration for the API client

export function getBaseUrl(): string {
  // Use environment variable if available, otherwise default to relative path
  // In Next.js, relative paths work for API routes like /api/todos
  return process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
}

// Define API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  TODO: {
    BASE: '/todos',
    GET_ALL: '/todos',
    CREATE: '/todos',
    GET_BY_ID: (id: string) => `/todos/${id}` as const,
    UPDATE: (id: string) => `/todos/${id}` as const,
    DELETE: (id: string) => `/todos/${id}` as const,
    TOGGLE: (id: string) => `/todos/${id}/toggle` as const,
  },
  USERS: {
    BASE: '/users',
  },
} as const;

// Define API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}