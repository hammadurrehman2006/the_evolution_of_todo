# Research Summary: AI-Powered Chatbot Implementation

## 1. MCP (Model Context Protocol) Server Implementation

### Technology: Python MCP SDK
- **Library**: `/gwbischof/python-mcp` - High reputation, 95 code snippets
- **Key Features**:
  - FastMCP for simplified server creation with `@mcp.tool()` decorators
  - Support for stateless tools that accept user_id as argument for security
  - Low-level Server class for advanced customization
  - Tool definitions with type hints and async support

### Implementation Pattern:
```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("TaskManager", stateless_http=True)

@mcp.tool(description="Add a new task for a user")
def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Add a new task with user isolation"""
    # Implementation with user_id validation for security
    pass
```

## 2. Database Models with SQLModel

### Technology: SQLModel
- **Library**: `/fastapi/sqlmodel` - High reputation, 2464 code snippets
- **Key Features**:
  - Support for relationships with `Relationship()` and `back_populates`
  - Foreign key constraints with `Field(foreign_key="table.column")`
  - Proper indexing for performance
  - Optional fields with default values

### Implementation Pattern:
```python
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # For user isolation
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    messages: List["Message"] = Relationship(back_populates="conversation")

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id")
    role: str  # "user" or "assistant"
    content: str
    tool_calls: Optional[str] = Field(default=None)  # JSON string for tool calls

    conversation: Optional[Conversation] = Relationship(back_populates="messages")
```

## 3. OpenAI Agents SDK Implementation

### Technology: OpenAI Agents Python
- **Library**: `/openai/openai-agents-python` - High reputation, 255 code snippets
- **Key Features**:
  - AgentRunner pattern with `Runner.run()` method
  - Session management with `SQLiteSession` for conversation history
  - Automatic conversation context maintenance
  - Support for tool integration

### Implementation Pattern:
```python
from agents import Agent, Runner, SQLiteSession

class AgentRunner:
    def __init__(self, tools: list):
        self.agent = Agent(
            name="TaskAssistant",
            instructions="Help users manage their tasks using available tools.",
            tools=tools
        )

    async def hydrate(self, conversation_id: str, db_session):
        """Load conversation history from database"""
        # Retrieve conversation and messages from DB
        # Convert to format suitable for agent session
        session = SQLiteSession(conversation_id, "conversations.db")
        return session

    async def run(self, user_message: str, session):
        """Execute the agent with the given message"""
        result = await Runner.run(
            self.agent,
            user_message,
            session=session
        )
        return result

    async def persist(self, conversation_id: str, user_msg: str, ai_response: str, db_session):
        """Save conversation to database"""
        # Save both user message and AI response to DB
        pass
```

## 4. FastAPI Chat Endpoint

### Technology: FastAPI
- **Library**: `/fastapi/fastapi` - High reputation, 12067 code snippets
- **Key Features**:
  - Dependency injection with `Depends()` for authentication
  - Path parameters for user_id extraction
  - Type hints for automatic validation
  - Built-in interactive documentation

### Implementation Pattern:
```python
from fastapi import FastAPI, Depends, Path
from typing import Optional

app = FastAPI()

@app.post("/api/{user_id}/chat")
async def chat_endpoint(
    user_id: str = Path(..., description="User identifier for isolation"),
    message: str,
    conversation_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    # Verify user_id matches authenticated user
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Process chat request
    pass
```

## 5. Authentication with Better Auth

### Technology: Better Auth
- **Library**: `/better-auth/better-auth` - High reputation, 2135 code snippets
- **Key Features**:
  - JWT-based authentication
  - Session validation with `auth.api.getSession()`
  - Middleware for route protection
  - User isolation via session data

### Implementation Pattern:
```python
# In FastAPI middleware or dependency
async def get_current_user(authorization: str = Header(...)):
    # Extract token from Authorization header
    token = authorization.replace("Bearer ", "")

    # Validate session with Better Auth
    session = await auth.api.getSession({
        headers: {"authorization": authorization}
    })

    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return session.user
```

## 6. OpenRouter Configuration

### Technology: OpenRouter
- **Library**: `/websites/openrouter_ai` - High reputation, 1852 code snippets
- **Key Features**:
  - Unified API for multiple AI models
  - Cost optimization and fallback handling
  - Single model configuration capability
  - API key authentication

### Implementation Pattern:
```python
# Configuration for single model
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
SINGLE_MODEL_ID = "openrouter/auto"  # Or specific model like "openai/gpt-4-turbo"

# API call example
headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "model": SINGLE_MODEL_ID,
    "messages": [...],
    "tools": [...]  # MCP tools defined earlier
}
```

## 7. Integration Architecture

### Key Decisions:
1. **Stateless Architecture**: Conversation history retrieved from DB for each request, not stored in server memory
2. **User Isolation**: All operations scoped by user_id with validation at multiple layers
3. **Security**: MCP tools accept user_id as mandatory parameter for validation
4. **Data Persistence**: Conversation and Message models with proper relationships
5. **AI Integration**: OpenAI Agents SDK with OpenRouter for cost-effective single model
6. **Authentication**: Better Auth for JWT-based user validation

### Overall Flow:
1. User sends message to POST /api/{user_id}/chat
2. Authentication validates user_id matches authenticated user
3. Conversation history loaded from DB and converted to agent session
4. MCP tools initialized with user_id validation
5. Agent processes user intent and invokes tools as needed
6. Results stored back to DB (both user message and AI response)
7. Response returned to user