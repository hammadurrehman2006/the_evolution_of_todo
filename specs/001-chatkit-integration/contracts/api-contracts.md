# API Contracts: ChatKit Integration

## Overview
This document defines the API contracts for the ChatKit integration feature, specifying the interfaces between the frontend chat widget and the backend services.

## Backend API Endpoints

### POST /api/chat

**Description**: Main endpoint for chat interactions with the AI assistant. Handles natural language processing and task management operations.

**Authentication**: JWT Bearer token required via Authorization header

**Request**:
```json
{
  "message": "Add a new task to buy groceries",
  "sessionId": "sess_abc123",
  "context": {
    "currentRoute": "/dashboard",
    "preferences": {
      "language": "en",
      "timezone": "UTC"
    }
  }
}
```

**Request Schema**:
```json
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "User's message content",
      "minLength": 1,
      "maxLength": 10000
    },
    "sessionId": {
      "type": "string",
      "description": "Existing session ID or null for new session",
      "pattern": "^sess_[a-zA-Z0-9]+$",
      "nullable": true
    },
    "context": {
      "type": "object",
      "description": "Additional context for the AI",
      "properties": {
        "currentRoute": {
          "type": "string",
          "description": "Current page route for context"
        },
        "preferences": {
          "type": "object",
          "description": "User preferences"
        }
      }
    }
  },
  "required": ["message"]
}
```

**Response**:
```json
{
  "response": "I've created a new task 'buy groceries' for you.",
  "sessionId": "sess_abc123",
  "operationType": "create",
  "taskId": "task_def456",
  "context": {
    "conversationHistory": [
      {"role": "user", "content": "Add a new task to buy groceries"},
      {"role": "assistant", "content": "I've created a new task 'buy groceries' for you."}
    ]
  }
}
```

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "response": {
      "type": "string",
      "description": "AI's response message"
    },
    "sessionId": {
      "type": "string",
      "description": "Session ID (new or existing)",
      "pattern": "^sess_[a-zA-Z0-9]+$"
    },
    "operationType": {
      "type": "string",
      "description": "Type of task operation if applicable",
      "enum": ["create", "update", "delete", "search", "categorize", null]
    },
    "taskId": {
      "type": "string",
      "description": "ID of affected task if applicable",
      "pattern": "^task_[a-zA-Z0-9]+$",
      "nullable": true
    },
    "context": {
      "type": "object",
      "description": "Updated context for conversation continuity"
    }
  },
  "required": ["response", "sessionId"]
}
```

**HTTP Status Codes**:
- 200: Success - Chat response generated successfully
- 400: Bad Request - Invalid request format
- 401: Unauthorized - Missing or invalid authentication token
- 403: Forbidden - User not authorized to access this resource
- 422: Unprocessable Entity - Request validation failed
- 500: Internal Server Error - Unexpected server error

**Example cURL Request**:
```bash
curl -X POST "https://api.example.com/api/chat" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a new task to buy groceries",
    "sessionId": "sess_abc123"
  }'
```

## Frontend Component API

### GlobalChatWidget Props

The GlobalChatWidget component accepts the following props:

```typescript
interface GlobalChatWidgetProps {
  /**
   * Optional initial session ID
   * If not provided, a new session will be created
   */
  initialSessionId?: string;

  /**
   * Callback fired when a task operation completes
   * This allows for optimistic UI updates
   */
  onTaskOperationComplete?: (operation: TaskOperation) => void;

  /**
   * Configuration for the chat widget appearance
   */
  config?: {
    title?: string;
    subtitle?: string;
    position?: 'bottom-right' | 'bottom-left';
    minimized?: boolean;
  };
}
```

### Event Handlers

#### onMessageSend(message: string)
Called when a user sends a message through the chat widget.

**Parameters**:
- `message`: The message content sent by the user

#### onMessageReceived(response: ChatResponse)
Called when a response is received from the backend.

**Parameters**:
- `response`: The response object from the backend API

#### onError(error: Error)
Called when an error occurs during chat communication.

**Parameters**:
- `error`: The error object with details

## Authentication Flow

### Token Retrieval
1. Component calls `authClient.token()` to retrieve JWT
2. Token is included in Authorization header for all API requests
3. Backend validates token against Better Auth service

### Token Refresh
1. If token is expired, component triggers re-authentication flow
2. User may be redirected to login if session is invalid
3. New token is retrieved and subsequent requests use updated token

## Error Handling

### Client-Side Errors
- Network connectivity issues
- Authentication token invalid/expired
- Component initialization failures

### Server-Side Errors
- AI service unavailable
- Database connection issues
- Rate limiting exceeded

## Security Considerations

### Request Signing
All requests to `/api/chat` must include:
- Valid JWT token in Authorization header
- Content-Type header set to application/json

### Rate Limiting
- Per-user rate limiting to prevent abuse
- IP-based rate limiting as additional protection

### Input Sanitization
- All user inputs are sanitized before processing
- Prevents injection attacks and malicious payloads