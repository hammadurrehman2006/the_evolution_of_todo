# Todo MCP Server Documentation

## Overview
This MCP (Model Context Protocol) server provides a set of tools and resources for managing a Todo list. It ensures data consistency, idempotency, and follows standard MCP communication protocols.

## Agent Roles & Responsibilities

### Task Manager Agent
- **Role**: Primary controller for Todo operations.
- **Responsibilities**:
  - Validates incoming task data.
  - Ensures idempotency for creation requests using `client_request_id`.
  - Manages the lifecycle of tasks (CRUD).
  - Handles persistence and error reporting.

## Data Schemas

### Task Object
```json
{
  "id": "uuid-string",
  "title": "string",
  "description": "string | null",
  "completed": "boolean",
  "priority": "High | Medium | Low",
  "tags": ["string"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### CreateTaskInput
- `title` (required): The task title.
- `description` (optional): Detailed notes.
- `priority` (optional): Defaults to "Medium".
- `tags` (optional): List of strings.
- `client_request_id` (optional): Unique string to prevent duplicate creation on retry.

## Communication Protocols
The server communicates using the **Model Context Protocol (MCP)** over standard I/O (JSON-RPC 2.0).

### Standard Flow:
1. Client sends `call_tool` request.
2. Server processes logic via `TaskManager`.
3. Server returns a formatted string or JSON response.
4. Errors are caught and returned as descriptive strings in the tool output.

## API Endpoints (Tools)

| Tool Name | Arguments | Description |
|-----------|-----------|-------------|
| `create_task` | `title`, `description?`, `priority?`, `tags?`, `client_request_id?` | Creates a new task. |
| `read_tasks` | `completed?`, `priority?`, `tag?` | Lists tasks with optional filtering. |
| `update_task` | `task_id`, `title?`, `description?`, `completed?`, `priority?`, `tags?` | Updates an existing task. |
| `delete_task` | `task_id` | Removes a task. |

## Resources
- `task://list`: A dynamic resource that provides the entire task list in JSON format.

## Error Handling & Idempotency
- **Idempotency**: The `create_task` tool accepts a `client_request_id`. If a second request with the same ID is received, the server returns the existing task instead of creating a duplicate.
- **Error Handling**: All tools are wrapped in try-except blocks. If an operation fails (e.g., file system error, validation error), a descriptive error message is returned to the agent instead of crashing the server.
- **Retry Mechanism**: Clients are encouraged to retry operations that return error messages, especially if the error suggests a transient issue. For `create_task`, always use the same `client_request_id` during retries.
