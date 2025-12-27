// src/lib/api/index.ts
// Main API module export

// Core client
export {
  apiClient,
  isAuthenticated,
  getCurrentUser,
  signOut,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  type RequestInterceptor,
  type ResponseInterceptor,
  type ErrorInterceptor,
  type ApiError
} from './client';

// Configuration
export { API_ENDPOINTS, getBaseUrl } from './config';

// Interceptors
export {
  addCommonHeaders,
  setLoadingIndicator,
  removeLoadingIndicator,
  handleCommonErrors,
  addRequestTiming,
  logRequestTiming,
  commonInterceptors,
  registerCommonInterceptors
} from './interceptors';

// Hooks
export {
  useApi,
  useTodos,
  useAuth,
  useApiState
} from './hooks';

// Test utilities
export {
  initializeApiClientForTesting,
  mockApiResponses,
  testApiClient
} from './test-utils';

// Services
export { todoService, type Todo, type CreateTodoRequest, type UpdateTodoRequest } from './services/todoService';
export { userService, type User, type LoginRequest, type RegisterRequest, type LoginResponse } from './services/userService';

// Types
export type { ApiResponse, PaginatedResponse } from './config';