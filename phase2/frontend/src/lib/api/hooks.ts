// src/lib/api/hooks.ts
// React hooks for API interactions

import { useState, useEffect, useCallback } from 'react';
import { apiClient, type ApiError } from './client';

// Generic hook for API calls
export function useApi<TData = any, TError = ApiError>() {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<TError | null>(null);
  const [response, setResponse] = useState<Response | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<TData>) => {
      setLoading(true);
      setError(null);
      setData(null);
      setResponse(null);

      try {
        const result = await apiCall();
        setData(result);
        return result;
      } catch (err) {
        setError(err as TError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    error,
    response,
    execute,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
      setResponse(null);
    },
  };
}

// Specific hook for fetching todos
export function useTodos() {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/todos');
      const fetchedTodos = Array.isArray(response) ? response : response.todos || [];
      setTodos(fetchedTodos);
    } catch (err) {
      setError((err as any).message || 'Failed to fetch todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    refetch: fetchTodos,
  };
}

// Specific hook for authentication
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      // In a real implementation, you would call the login API
      // const response = await apiClient.post('/auth/login', { email, password });
      // localStorage.setItem('access_token', response.access_token);
      // setIsAuthenticated(true);
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
}

// Hook for handling API state (loading, error, data)
export function useApiState<TData = any>() {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<TData>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        setData(result);
        return result;
      } catch (err) {
        const errorMessage = (err as any).message || 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}