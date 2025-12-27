# API Client Utilities

This directory contains the API client utilities for the Next.js application, providing a centralized and consistent way to interact with the backend API.

## Overview

The API client utilities provide:

- Centralized API request handling
- Proper error handling and interception
- Request/response interceptors
- Consistent API patterns
- Authentication integration (both Better Auth and token-based fallback)
- React hooks for common API operations

## Components

### 1. ApiClient Class

The main API client class with interceptor support:

```typescript
import { apiClient } from '@/lib/api';

// Basic usage
const todos = await apiClient.get('/todos');
const newTodo = await apiClient.post('/todos', { title: 'New Todo', description: 'Description' });
```

### 2. Interceptors

The client supports three types of interceptors:

- **Request Interceptors**: Modify requests before they're sent
- **Response Interceptors**: Process responses before they're returned
- **Error Interceptors**: Handle errors globally

```typescript
import { apiClient, commonInterceptors } from '@/lib/api';

// Add interceptors
apiClient.addRequestInterceptor(commonInterceptors.request[0]);
apiClient.addResponseInterceptor(commonInterceptors.response[0]);
apiClient.addErrorInterceptor(commonInterceptors.error[0]);
```

### 3. Services

Predefined service classes for specific API endpoints:

```typescript
import { todoService } from '@/lib/api';

// Using the todo service
const todos = await todoService.getAll();
const newTodo = await todoService.create({ title: 'New Todo', description: 'Description' });
```

### 4. React Hooks

Convenient React hooks for API operations:

```typescript
import { useApi, useTodos } from '@/lib/api';

// Using the useApi hook
const { data, loading, error, execute } = useApi();
const result = await execute(() => apiClient.get('/todos'));

// Using the useTodos hook
const { todos, loading, error, refetch } = useTodos();
```

## Authentication

The API client supports both Better Auth and token-based authentication with automatic fallback:

```typescript
import { isAuthenticated, signOut, getAuthToken } from '@/lib/api';

// Check if user is authenticated
const authenticated = await isAuthenticated();

// Sign out
await signOut();

// Get current token
const token = await getAuthToken();
```

## Usage Examples

### Basic API Call

```typescript
import { apiClient } from '@/lib/api';

try {
  const todos = await apiClient.get('/todos');
  console.log(todos);
} catch (error) {
  console.error('Error fetching todos:', error);
}
```

### Using Todo Service

```typescript
import { todoService } from '@/lib/api';

// Get all todos
const todos = await todoService.getAll();

// Create a new todo
const newTodo = await todoService.create({
  title: 'New Todo',
  description: 'Todo description'
});

// Update a todo
const updatedTodo = await todoService.update('todo-id', {
  title: 'Updated Title',
  completed: true
});

// Delete a todo
await todoService.delete('todo-id');
```

### Using React Hooks

```typescript
import { useApi } from '@/lib/api';
import { useEffect } from 'react';

function TodoComponent() {
  const { data: todos, loading, error, execute } = useApi();

  useEffect(() => {
    execute(async () => {
      return await todoService.getAll();
    });
  }, [execute]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {todos?.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
}
```

### Adding Custom Interceptors

```typescript
import { apiClient } from '@/lib/api';

// Add a request interceptor to include additional headers
apiClient.addRequestInterceptor(async (config) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      'X-Custom-Header': 'custom-value'
    }
  };
});

// Add a response interceptor to process data
apiClient.addResponseInterceptor(async (response, requestConfig) => {
  // Process the response data
  return response;
});

// Add an error interceptor to handle specific errors
apiClient.addErrorInterceptor(async (error) => {
  if (error.status === 401) {
    // Handle unauthorized access
    console.log('Unauthorized, redirecting to login...');
  }
  return error;
});
```

## Error Handling

The API client provides consistent error handling:

```typescript
import { apiClient, type ApiError } from '@/lib/api';

try {
  const data = await apiClient.get('/todos');
} catch (error) {
  const apiError = error as ApiError;
  console.error('API Error:', apiError.message);
  console.error('Status:', apiError.status);
  console.error('Details:', apiError.details);
}
```

## Configuration

The API client uses the base URL from the config file:

```typescript
// src/lib/api/config.ts
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
}
```

Set the `NEXT_PUBLIC_API_BASE_URL` environment variable to change the API base URL.