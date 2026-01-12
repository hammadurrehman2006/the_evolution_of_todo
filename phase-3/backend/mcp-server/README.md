# Todo MCP Server Specification

## Overview
This MCP server provides a standardized interface for managing Todo items. It implements CRUD operations and exposes them as MCP Tools and Resources.

## Agents Roles & Responsibilities

While the MCP server is tool-agnostic, we envision the following agent roles interacting with it:

1.  **TaskManager Agent**:
    -   **Responsibilities**: Orchestrates the creation and organization of tasks. Uses `create_task` and `update_task` tools.
    -   **Goal**: Ensure all user requests are captured as structured tasks.

2.  **TaskViewer Agent**:
    -   **Responsibilities**: Retrieves and summarizes tasks. Uses `read_tasks` tool or `task://list` resource.
    -   **Goal**: Provide users with up-to-date views of their todo list.

3.  **TaskCleaner Agent**:
    -   **Responsibilities**: Identifies and removes completed or obsolete tasks. Uses `read_tasks` (filtering for completed) and `delete_task` tools.
    -   **Goal**: Maintain a clutter-free task list.

## Data Schemas

### Task
-   `id` (UUID, string): Unique identifier.
-   `title` (string): Short summary.
-   `description` (string, optional): Detailed notes.
-   `completed` (boolean): Status.
-   `priority` (string): High, Medium, Low.
-   `tags` (List[string]): Categorization tags.
-   `created_at` (datetime): ISO 8601 timestamp.
-   `updated_at` (datetime): ISO 8601 timestamp.

## API Endpoints (MCP Tools)

-   `create_task(title, description?, priority?, tags?, client_request_id?)`: Creates a task.
-   `read_tasks(completed?, priority?, tag?)`: Returns a list of tasks matching filters.
-   `update_task(task_id, ...)`: Updates specified fields.
-   `delete_task(task_id)`: Removes a task.

## Resources

-   `task://list`: A JSON representation of all current tasks.

## Persistence & Infrastructure

-   **Database**: Uses **Neon DB** (Serverless PostgreSQL) via **SQLModel**.
-   **Optimizations**: Connection pooling (PgBouncer) and SSL are configured for performance and security.
-   **Configuration**: Settings are managed via environment variables and Pydantic Settings.

## Configuration

The server requires the following environment variables (in a `.env` file or exported):

-   `DATABASE_URL`: Connection string for the PostgreSQL database (same as main backend).
-   `MCP_USER_ID`: The User ID to impersonate when performing operations (required because the MCP protocol is stateless/single-user in this context).

## Error Handling

-   Tools return clear error messages (e.g., "Task {id} not found") instead of crashing.
-   Input validation is handled via Pydantic models.
-   Database operations are wrapped in transactions with automatic rollback on failure.

## Integration with AI Agents (OpenAI, Claude, etc.)

This server follows the standard **Model Context Protocol (MCP)**. You can connect it to various AI agents:

### 1. OpenAI Agents
To use this with OpenAI agents, you can use a bridge like `mcp-openai-bridge` or a custom client that uses the MCP SDK to fetch tools and provide them to the OpenAI `tools` parameter.

### 2. Claude Desktop
Add the following to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "todo-mcp": {
      "command": "uv",
      "args": [
        "--directory",
        "PATH_TO_PROJECT/phase-3/backend/mcp-server",
        "run",
        "python3",
        "src/server.py"
      ],
      "env": {
        "PYTHONPATH": "."
      }
    }
  }
}
```

## Running Locally
```bash
uv run python3 src/server.py
```
