# Data Model: AI-Powered Chatbot

## Overview
This document defines the data models for the AI-powered chatbot system, focusing on conversation persistence and message history management. The models ensure stateless operation by storing all conversation data in the database rather than server memory.

## Entity Definitions

### 1. Conversation Entity

#### Fields
- `id` (Integer, Primary Key, Auto-increment)
  - Unique identifier for each conversation
  - Required: Yes
  - Indexed: Yes (Primary key)

- `user_id` (String, Required, Indexed)
  - Foreign key linking to the user who owns this conversation
  - Required: Yes
  - Indexed: Yes (for fast user-based queries)
  - Purpose: Enables user isolation and data security

- `title` (String, Optional)
  - Auto-generated title based on conversation content
  - Max length: 200 characters
  - Default: Null

- `created_at` (DateTime, Required)
  - Timestamp when the conversation was created
  - Required: Yes
  - Default: Current timestamp

- `updated_at` (DateTime, Required)
  - Timestamp when the conversation was last updated
  - Required: Yes
  - Default: Current timestamp (updates automatically)

#### Relationships
- One Conversation has Many Messages (One-to-Many)
- Messages reference this entity via `conversation_id` foreign key

#### Constraints
- `user_id` must exist in the Users table (foreign key constraint)
- `created_at` ≤ `updated_at` (logical constraint)

#### Validation Rules
- `user_id` must not be empty
- `created_at` and `updated_at` must be valid timestamps

### 2. Message Entity

#### Fields
- `id` (Integer, Primary Key, Auto-increment)
  - Unique identifier for each message
  - Required: Yes
  - Indexed: Yes (Primary key)

- `conversation_id` (Integer, Required, Indexed)
  - Foreign key linking to the parent conversation
  - Required: Yes
  - Indexed: Yes (for fast conversation-based queries)
  - Purpose: Links message to its conversation

- `role` (String, Required)
  - Role of the message sender (e.g., "user", "assistant", "system")
  - Required: Yes
  - Values: "user" | "assistant" | "system"
  - Case-insensitive

- `content` (Text, Required)
  - The actual message content
  - Required: Yes
  - Max length: 10,000 characters (adjustable based on requirements)

- `tool_calls` (JSON, Optional)
  - Serialized representation of tools called by the AI
  - Format: JSON string containing tool names and parameters
  - Purpose: Track which MCP tools were invoked

- `tool_responses` (JSON, Optional)
  - Serialized responses from MCP tools
  - Format: JSON string containing tool results
  - Purpose: Store tool execution results for context

- `timestamp` (DateTime, Required)
  - When the message was created
  - Required: Yes
  - Default: Current timestamp

#### Relationships
- Many Messages belong to One Conversation (Many-to-One)
- References Conversation entity via `conversation_id` foreign key

#### Constraints
- `conversation_id` must exist in the Conversation table (foreign key constraint)
- `role` must be one of allowed values ("user", "assistant", "system")
- `timestamp` must be valid

#### Validation Rules
- `conversation_id` must be a valid conversation
- `role` must be one of the allowed values
- `content` must not be empty
- `timestamp` must be in the past or present

## Entity Relationships

### Conversation ↔ Message
```
Conversation (1) ←→ (Many) Message
PK id ←→ FK conversation_id
```

- A Conversation can have multiple Messages
- Each Message belongs to exactly one Conversation
- Cascade delete: When a Conversation is deleted, all related Messages are also deleted
- Integrity: Cannot create a Message without a valid Conversation

## Additional Models (Referenced)

### User Entity (Existing)
The system relies on an existing User entity with:
- `id` (String/UUID) - Primary identifier
- Authentication handled by Better Auth
- User isolation enforced through `user_id` in Conversation entity

## Database Indexes

### Conversation Table
1. Primary Key: `id`
2. Index: `user_id` (for user-specific queries)
3. Index: `(user_id, created_at)` (for user-specific chronological queries)

### Message Table
1. Primary Key: `id`
2. Index: `conversation_id` (for conversation-specific queries)
3. Index: `(conversation_id, timestamp)` (for chronological ordering within conversations)

## Sample Data Structure

### Conversation Example
```json
{
  "id": 1,
  "user_id": "user_abc123",
  "title": "Task Management Discussion",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:45:00Z"
}
```

### Message Example
```json
{
  "id": 1,
  "conversation_id": 1,
  "role": "user",
  "content": "Add a task to buy groceries",
  "tool_calls": null,
  "tool_responses": null,
  "timestamp": "2024-01-15T10:30:15Z"
}
```

### Message with Tool Calls Example
```json
{
  "id": 2,
  "conversation_id": 1,
  "role": "assistant",
  "content": "I've added the task 'buy groceries' to your list.",
  "tool_calls": "[{\"name\": \"add_task\", \"arguments\": {\"user_id\": \"user_abc123\", \"title\": \"buy groceries\"}}]",
  "tool_responses": "[{\"result\": {\"id\": 123, \"title\": \"buy groceries\", \"status\": \"created\"}}]",
  "timestamp": "2024-01-15T10:30:20Z"
}
```

## Migration Considerations

### From Existing Schema
- If upgrading from a version without conversation/message history:
  - Create new Conversation and Message tables
  - Existing Task entities remain unchanged
  - MCP tools continue to operate on Task entities
  - New chat functionality uses the new tables for history

### Future Extensibility
- Additional fields can be added to Message entity if needed (e.g., message type, metadata)
- Conversation entity can be extended with additional metadata if needed
- Relationships can be enhanced if cross-conversation features are needed