// src/lib/api/interceptors.ts
// Common interceptors for the API client

import { RequestInterceptor, ResponseInterceptor, ErrorInterceptor } from './client';

// Request interceptor to add common headers
export const addCommonHeaders: RequestInterceptor = (config) => {
  const newConfig = { ...config };

  // Add common headers
  newConfig.headers = {
    ...newConfig.headers,
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  };

  // Add timestamp for cache busting if needed
  const url = newConfig.url || '';
  if (url.includes('GET') || newConfig.method === 'GET') {
    const separator = url.includes('?') ? '&' : '?';
    newConfig.url = `${url}${separator}_t=${Date.now()}`;
  }

  return newConfig;
};

// Request interceptor to add loading indicators
export const setLoadingIndicator: RequestInterceptor = (config) => {
  // Show loading indicator
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('apiRequestStart'));
  }

  return config;
};

// Response interceptor to hide loading indicators
export const removeLoadingIndicator: ResponseInterceptor = (response, requestConfig) => {
  // Hide loading indicator
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('apiRequestEnd'));
  }

  return response;
};

// Error interceptor to handle common errors
export const handleCommonErrors: ErrorInterceptor = (error) => {
  // Hide loading indicator on error
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('apiRequestEnd'));
  }

  // Log error for debugging
  console.error('API Error:', error);

  // Handle specific error cases
  if (error.status === 401) {
    // Token might be expired, redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
  } else if (error.status === 429) {
    // Rate limit exceeded
    throw new Error('Too many requests. Please try again later.');
  } else if (error.status >= 500) {
    // Server error
    throw new Error('Server error. Please try again later.');
  }

  // Return the original error
  return error;
};

// Request interceptor to add request timing
export const addRequestTiming: RequestInterceptor = (config) => {
  const startTime = Date.now();
  (config as any)._startTime = startTime;
  return config;
};

// Response interceptor to log request timing
export const logRequestTiming: ResponseInterceptor = (response, requestConfig) => {
  const startTime = (requestConfig as any)._startTime;
  if (startTime) {
    const duration = Date.now() - startTime;
    console.log(`API request took ${duration}ms`);
  }
  return response;
};

// Common interceptors configuration
export const commonInterceptors = {
  request: [addCommonHeaders, setLoadingIndicator, addRequestTiming],
  response: [removeLoadingIndicator, logRequestTiming],
  error: [handleCommonErrors],
};

// Function to register all common interceptors
export const registerCommonInterceptors = (apiClient: any) => {
  // Add request interceptors
  commonInterceptors.request.forEach(interceptor => {
    apiClient.addRequestInterceptor(interceptor);
  });

  // Add response interceptors
  commonInterceptors.response.forEach(interceptor => {
    apiClient.addResponseInterceptor(interceptor);
  });

  // Add error interceptors
  commonInterceptors.error.forEach(interceptor => {
    apiClient.addErrorInterceptor(interceptor);
  });
};