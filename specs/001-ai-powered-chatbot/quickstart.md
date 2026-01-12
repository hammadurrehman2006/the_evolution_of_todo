# Quickstart Guide: AI-Powered Chatbot

## Overview
This guide provides developers with the essential information to get started with the AI-Powered Chatbot system. The system enables natural language task management through an AI assistant that can add, list, complete, update, and delete tasks.

## Prerequisites

### Environment Requirements
- Python 3.13+ (as specified in project constitution)
- pip package manager
- Git for version control
- Docker (optional, for containerized deployment)

### External Services
- **Neon PostgreSQL**: Database service for storing conversations and messages
- **Better Auth**: Authentication service for user management
- **OpenRouter**: AI model provider (single model configuration)
- **API Keys**:
  - OPENROUTER_API_KEY (for AI model access)
  - BETTER_AUTH_SECRET (for authentication)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Set Up Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 4. Environment Configuration
Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/chatbot_db

# Authentication
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_JWT_SECRET=your_jwt_secret

# AI Model Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
DEFAULT_MODEL=openrouter/auto  # Or specific model like openai/gpt-4-turbo

# Application Settings
APP_ENV=development
DEBUG=true
```

## Project Structure
```
backend/
├── models/
│   ├── __init__.py
│   ├── conversation.py      # Conversation SQLModel
│   ├── message.py          # Message SQLModel
│   └── task.py             # Task SQLModel (existing)
├── mcp/
│   ├── __init__.py
│   ├── server.py           # MCP Server implementation
│   └── tools/
│       ├── __init__.py
│       ├── task_tools.py   # add_task, list_tasks, complete_task, etc.
│       └── utils.py        # Helper functions for MCP tools
├── agents/
│   ├── __init__.py
│   ├── runner.py           # AgentRunner class with Hydrate->Run->Persist cycle
│   ├── config.py           # Agent configuration (OpenRouter, tools, etc.)
│   └── prompts.py          # System prompts for the AI agent
├── routes/
│   ├── __init__.py
│   └── chat.py             # POST /chat endpoint
├── services/
│   ├── __init__.py
│   ├── conversation_service.py  # Conversation management logic
│   ├── message_service.py       # Message handling logic
│   └── auth_service.py          # Authentication utilities
├── core/
│   ├── __init__.py
│   ├── config.py               # Application configuration
│   ├── database.py             # Database connection setup
│   └── security.py             # Security utilities (user_id validation)
├── main.py                    # Application entry point
└── requirements.txt           # Dependencies
```

## Running the Application

### 1. Database Setup
First, ensure your Neon PostgreSQL database is created and accessible, then run migrations:

```bash
# Run database migrations
python -m backend.core.database migrate
```

### 2. Start the Application
```bash
# Run the development server
python -m backend.main
```

The application will start on `http://localhost:8000` by default.

### 3. Verify Installation
Visit `http://localhost:8000/docs` to access the interactive API documentation.

## Using the Chat API

### 1. Authentication
All API calls require a valid JWT token from Better Auth. Obtain a token by authenticating through your frontend or authentication endpoint.

### 2. Sending a Chat Message
```bash
curl -X POST "http://localhost:8000/api/user_abc123/chat" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a task to buy milk",
    "conversation_id": "conv_xyz789"
  }'
```

### 3. Example Responses
#### Success Response
```json
{
  "conversation_id": "conv_xyz789",
  "message_id": "msg_abc123",
  "response": "I've added the task 'buy milk' to your list.",
  "tool_calls": [
    {
      "name": "add_task",
      "arguments": {"user_id": "user_abc123", "title": "buy milk"},
      "result": {"success": true, "task_id": "task_def456"}
    }
  ],
  "timestamp": "2024-01-15T10:30:20Z"
}
```

## MCP Server Integration

### 1. Starting the MCP Server
The MCP server runs as part of the main application. It exposes the following tools:
- `add_task`: Add a new task for a user
- `list_tasks`: List tasks for a user (with filtering)
- `complete_task`: Mark a task as completed
- `delete_task`: Delete a task
- `update_task`: Update task details

### 2. Tool Signature
All tools accept `user_id` as a mandatory parameter for security:
```python
@mcp.tool()
def add_task(user_id: str, title: str, description: str = "") -> dict:
    # Implementation with user validation
    pass
```

## Development Workflow

### 1. Adding New MCP Tools
1. Create the tool function in `backend/mcp/tools/task_tools.py`
2. Add proper type hints and documentation
3. Ensure user_id validation for security
4. Register the tool with the MCP server in `backend/mcp/server.py`

### 2. Modifying Data Models
1. Update the SQLModel classes in `backend/models/conversation.py` or `backend/models/message.py`
2. Run database migrations to update the schema
3. Update related service classes to handle new fields

### 3. Customizing AI Behavior
1. Modify system prompts in `backend/agents/prompts.py`
2. Adjust the AgentRunner configuration in `backend/agents/config.py`
3. Test the changes with sample conversations

## Testing

### Running Unit Tests
```bash
# Run all tests
pytest

# Run tests with coverage
pytest --cov=backend

# Run specific test file
pytest tests/unit/test_chat_endpoint.py
```

### Running Integration Tests
```bash
# Run integration tests
pytest tests/integration/
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
- Verify `DATABASE_URL` in your `.env` file
- Ensure your Neon PostgreSQL instance is accessible
- Check network connectivity and firewall settings

#### 2. Authentication Failures
- Confirm your JWT token is valid and not expired
- Verify `BETTER_AUTH_SECRET` matches the one used to generate the token
- Check that the user exists in the authentication system

#### 3. AI Model Access Issues
- Verify `OPENROUTER_API_KEY` is correct and has sufficient credits
- Check that the configured model is available
- Review OpenRouter dashboard for any account limitations

#### 4. MCP Tools Not Responding
- Ensure the MCP server is properly initialized
- Check that all required dependencies are installed
- Verify tool signatures match expected parameters

### Debugging Tips
1. Enable DEBUG mode in your `.env` file to get more detailed error messages
2. Check application logs for detailed error information
3. Use the `/docs` endpoint to test API calls interactively
4. Verify all environment variables are properly set

## Next Steps

1. **Customize the AI prompts** in `backend/agents/prompts.py` for your specific use case
2. **Extend the MCP tools** to support additional functionality
3. **Add custom authentication** if needed beyond Better Auth
4. **Deploy to production** following the containerized deployment guidelines
5. **Monitor performance** and adjust configurations as needed