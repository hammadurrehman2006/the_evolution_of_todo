# Data Model: ChatKit Integration

## Overview
This document defines the data structures and entities required for the ChatKit integration feature, including the persistent AI chatbot interface that communicates with our backend API. Note that we are using a standard React chat widget (like react-chat-widget) rather than OpenAI's ChatKit (which doesn't exist) as specified in the original requirements.

## Key Entities

### ChatSession
Represents an ongoing conversation between user and AI assistant, maintaining context and history.

**Fields:**
- `id` (string): Unique identifier for the session
- `userId` (string): Reference to the authenticated user
- `createdAt` (timestamp): Timestamp when the session was created
- `updatedAt` (timestamp): Timestamp of the last activity
- `context` (object): Current conversation context and history
- `isActive` (boolean): Boolean indicating if the session is currently active

**Relationships:**
- Belongs to User (via userId)
- Contains multiple ChatMessages

### ChatMessage
Represents individual messages in a conversation between user and AI.

**Fields:**
- `id` (string): Unique identifier for the message
- `sessionId` (string): Reference to the parent chat session
- `sender` (enum): 'user' or 'ai'
- `content` (string): Message text content
- `timestamp` (timestamp): When the message was sent
- `metadata` (object): Additional message metadata (intent, entities, etc.)

**Relationships:**
- Belongs to ChatSession (via sessionId)

### TaskOperation
Represents a task management action initiated through the chatbot, including natural language input and structured output.

**Fields:**
- `id` (string): Unique identifier for the operation
- `sessionId` (string): Reference to the associated chat session
- `userId` (string): Reference to the user who initiated
- `inputText` (string): Original natural language input from user
- `operationType` (enum): 'create', 'update', 'delete', 'search', 'categorize'
- `structuredCommand` (object): Parsed structured command
- `taskId` (string, optional): Reference to affected task (for update/delete operations)
- `status` (enum): 'pending', 'processing', 'completed', 'failed'
- `result` (object, optional): Operation result data
- `createdAt` (timestamp): When the operation was created

**Relationships:**
- Belongs to ChatSession (via sessionId)
- Belongs to User (via userId)
- Optionally linked to Todo (via taskId)

### AuthenticationToken
Represents the Better Auth JWT used to secure all chatbot communications.

**Fields:**
- `token` (string): The JWT token string
- `userId` (string): Reference to the user the token belongs to
- `expiresAt` (timestamp): Expiration timestamp
- `createdAt` (timestamp): Timestamp when the token was issued
- `isValid` (boolean): Boolean indicating if the token is currently valid

**Relationships:**
- Belongs to User (via userId)

## API Contract Models

### Frontend to Backend Requests

#### ChatRequest
```typescript
interface ChatRequest {
  message: string;           // User's message content
  sessionId?: string;        // Existing session ID or null for new session
  context?: object;          // Additional context for the AI
}
```

#### ChatResponse
```typescript
interface ChatResponse {
  response: string;          // AI's response message
  sessionId: string;         // Session ID (new or existing)
  operationType?: string;    // Type of task operation if applicable ('create', 'update', 'delete', etc.)
  taskId?: string;           // ID of affected task if applicable
  context?: object;          // Updated context for conversation continuity
}
```

## Validation Rules

### ChatSession Validation
- `userId` must be a valid authenticated user
- `isActive` defaults to true for new sessions
- Session should be marked inactive after 24 hours of inactivity

### ChatMessage Validation
- `sender` must be either 'user' or 'ai'
- `content` must not exceed 10,000 characters
- `sessionId` must reference an active session
- Messages cannot be modified after creation (immutable)

### TaskOperation Validation
- `operationType` must be one of the defined enum values
- `inputText` must be present and not empty
- `userId` must match the authenticated user
- Operations must reference valid sessions and users

## State Transitions

### ChatSession States
- `inactive` → `active`: When user starts a new conversation
- `active` → `inactive`: After 24 hours of inactivity or explicit session closure

### TaskOperation States
- `pending` → `processing`: When operation is being executed
- `processing` → `completed`: When operation succeeds
- `processing` → `failed`: When operation encounters an error
- `pending` → `failed`: When validation fails

## Relationships

```
User (1) ←→ (Many) ChatSession ←→ (Many) ChatMessage
User (1) ←→ (Many) TaskOperation → (Optional) Todo
ChatSession (1) ←→ (Many) TaskOperation
ChatSession (1) ←→ (Many) ChatMessage
```

## Database Schema Considerations

The implementation will leverage the existing Neon PostgreSQL database with SQLModel, extending the schema as needed to support these entities. The entities will integrate with the existing User model and Todo model for task operations.