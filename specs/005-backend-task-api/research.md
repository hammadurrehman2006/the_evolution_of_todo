# Research: Backend Task Management API

**Feature**: Backend Task Management API
**Date**: 2026-01-02
**Purpose**: Technical research and architectural decisions for FastAPI + SQLModel + Neon PostgreSQL implementation

---

## 1. Database Technology: Neon Serverless PostgreSQL

### Decision
Use **Neon Serverless PostgreSQL** as the primary database with SQLModel as the ORM/data modeling layer.

### Rationale
- **Serverless scaling**: Auto-scales based on load, reducing operational overhead
- **PostgreSQL compatibility**: Full PostgreSQL 15+ feature set including JSONB for tags storage
- **SQLModel integration**: Native support for SQLModel (Pydantic + SQLAlchemy)
- **Connection pooling**: Built-in connection pooling for FastAPI async operations
- **Cost efficiency**: Pay-per-use model, ideal for development and production

### Implementation Approach
- Use `asyncpg` driver for async database operations in FastAPI
- Connection string from environment variable: `DATABASE_URL`
- SQLModel for ORM and data validation (combines Pydantic + SQLAlchemy)
- Use Neon MCP tool (`mcp__Neon__get_connection_string`) to retrieve connection details

### Alternatives Considered
- **SQLite**: Too limited for production (no JSONB, poor concurrency)
- **MySQL**: Less robust JSON support compared to PostgreSQL
- **MongoDB**: Not chosen due to preference for relational model and SQL

---

## 2. Tag Storage Strategy: JSONB Column

### Decision
Store tags as a **JSONB column** in the Task table rather than a separate junction table.

### Rationale
- **Simplicity**: Single table query, no joins required for basic operations
- **Performance**: PostgreSQL JSONB is highly optimized with indexing support (`GIN` indexes)
- **Schema flexibility**: Easy to add tag metadata later (colors, icons) without schema changes
- **Query capabilities**: PostgreSQL supports JSONB operators (`@>`, `?`, `?|`) for filtering

### Implementation Approach
```python
class Task(SQLModel, table=True):
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
```

- Use PostgreSQL JSONB operators for tag filtering
- Automatic de-duplication via Python `set()` before storage
- GIN index on `tags` column for fast tag queries

### Alternatives Considered
- **Separate Tag table**: More normalized but adds complexity and join overhead
- **Array column**: Less flexible than JSONB, harder to extend with metadata

---

## 3. JWT Authentication: PyJWT + FastAPI Dependencies

### Decision
Use **PyJWT** library with FastAPI dependency injection for JWT validation and user_id extraction.

### Rationale
- **Industry standard**: PyJWT is the most widely used JWT library for Python
- **FastAPI integration**: Clean dependency injection pattern via `Depends()`
- **Security**: Supports multiple algorithms (HS256, RS256, ES256)
- **Token validation**: Built-in expiration, signature, and claim validation

### Implementation Approach
- Create `dependencies.py` with `get_current_user()` function
- Extract token from `Authorization: Bearer <token>` header
- Validate signature using `JWT_SECRET` or `JWT_PUBLIC_KEY` from environment
- Extract `user_id` from token payload (claim: `sub` or `user_id`)
- Return `user_id` for use in route handlers
- Use `HTTPBearer` security scheme for OpenAPI documentation

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub") or payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Alternatives Considered
- **python-jose**: Less maintained than PyJWT
- **authlib**: More features but heavier dependency

---

## 4. Recurring Task Logic: iCalendar RRULE Format

### Decision
Store recurrence rules using **iCalendar RRULE format** (RFC 5545) and use `python-dateutil` for parsing and date calculation.

### Rationale
- **Industry standard**: RRULE is the de facto standard for recurrence (used by Google Calendar, Outlook, etc.)
- **Expressive**: Supports daily, weekly, monthly, yearly, with intervals, end dates, occurrences
- **Library support**: `python-dateutil.rrule` provides robust parsing and calculation
- **Future-proof**: Extensible format that handles complex patterns

### Implementation Approach
- Store recurrence_rule as `String` column (e.g., `"FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR"`)
- On task completion (`is_recurring=True`), parse RRULE and calculate next due_date
- Create new Task instance with:
  - Same title, description, priority, tags
  - New due_date (calculated from RRULE)
  - Reset status to `incomplete`
  - Preserve recurrence_rule

```python
from dateutil.rrule import rrulestr
from datetime import datetime

def calculate_next_occurrence(current_due_date: datetime, rrule_string: str) -> datetime:
    rule = rrulestr(rrule_string, dtstart=current_due_date)
    return rule.after(current_due_date)
```

### Alternatives Considered
- **Simple intervals**: Less expressive (e.g., "daily", "weekly", "monthly")
- **Custom DSL**: Reinventing the wheel, lacks tooling support

---

## 5. Query Parameter Handling: Pydantic Models

### Decision
Use **Pydantic models** for query parameter validation and type coercion in `GET /tasks` endpoint.

### Rationale
- **Type safety**: Automatic validation and error messages
- **Documentation**: OpenAPI schema generation from Pydantic models
- **Reusability**: Same models for request validation across endpoints
- **Complex filtering**: Supports optional parameters with defaults

### Implementation Approach
```python
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class SortOrder(str, Enum):
    asc = "asc"
    desc = "desc"

class SortField(str, Enum):
    due_date = "due_date"
    title = "title"
    priority = "priority"

class TaskQueryParams(BaseModel):
    q: Optional[str] = None  # Keyword search
    status: Optional[bool] = None  # Complete (true) or incomplete (false)
    priority: Optional[str] = None  # High, Medium, Low
    tags: Optional[List[str]] = None  # Filter by tags
    due_date_from: Optional[datetime] = None
    due_date_to: Optional[datetime] = None
    sort_by: SortField = SortField.due_date
    sort_order: SortOrder = SortOrder.asc
    limit: int = Field(default=50, ge=1, le=100)
    offset: int = Field(default=0, ge=0)

@router.get("/tasks")
async def list_tasks(
    params: TaskQueryParams = Depends(),
    user_id: str = Depends(get_current_user)
):
    query = select(Task).where(Task.user_id == user_id)

    if params.q:
        query = query.where(
            or_(
                Task.title.ilike(f"%{params.q}%"),
                Task.description.ilike(f"%{params.q}%")
            )
        )

    if params.status is not None:
        query = query.where(Task.completed == params.status)

    if params.priority:
        query = query.where(Task.priority == params.priority.capitalize())

    if params.tags:
        query = query.where(Task.tags.op('@>')(params.tags))  # JSONB contains

    if params.due_date_from:
        query = query.where(Task.due_date >= params.due_date_from)

    if params.due_date_to:
        query = query.where(Task.due_date <= params.due_date_to)

    # Sorting
    if params.sort_by == SortField.due_date:
        order_col = Task.due_date
    elif params.sort_by == SortField.title:
        order_col = Task.title
    elif params.sort_by == SortField.priority:
        # Custom sort: High > Medium > Low
        order_col = case(
            (Task.priority == "High", 1),
            (Task.priority == "Medium", 2),
            (Task.priority == "Low", 3)
        )

    query = query.order_by(order_col.desc() if params.sort_order == SortOrder.desc else order_col.asc())
    query = query.limit(params.limit).offset(params.offset)

    return await session.execute(query)
```

### Alternatives Considered
- **Manual parameter parsing**: Error-prone, no validation
- **FastAPI Query()**: Works but less reusable than Pydantic models

---

## 6. Project Structure: Layered Architecture

### Decision
Use **layered architecture** with clear separation of concerns:
```
backend/
├── main.py              # FastAPI app entry, CORS, middleware
├── database.py          # SQLModel engine, session management
├── models.py            # SQLModel data models (Task, User reference)
├── schemas.py           # Pydantic request/response schemas
├── dependencies.py      # Auth dependency (get_current_user)
├── routes/
│   └── tasks.py         # Task CRUD endpoints
├── services/
│   ├── task_service.py  # Business logic (recurring tasks)
│   └── auth_service.py  # JWT validation logic
└── utils/
    └── recurrence.py    # RRULE parsing and date calculation
```

### Rationale
- **Separation of concerns**: Models vs schemas vs routes vs business logic
- **Testability**: Services can be tested independently
- **Maintainability**: Clear file responsibilities
- **Scalability**: Easy to add new routers, services, utilities

### Implementation Approach
- `main.py`: Create FastAPI app, register routers, configure CORS
- `database.py`: SQLModel engine initialization, async session factory
- `models.py`: SQLModel table definitions with relationships
- `schemas.py`: Pydantic models for API request/response (separate from DB models)
- `dependencies.py`: Reusable dependencies (auth, pagination, etc.)
- `routes/tasks.py`: FastAPI router with CRUD endpoints
- `services/task_service.py`: Business logic (recurring task creation)

### Alternatives Considered
- **Flat structure**: All code in one file - not scalable
- **Domain-driven design**: Over-engineered for this project size

---

## 7. Error Handling: FastAPI Exception Handlers

### Decision
Use **custom exception handlers** with standardized error response format.

### Rationale
- **Consistent API**: All errors return same JSON structure
- **Client-friendly**: Clear error messages with field-level validation
- **HTTP standards**: Proper status codes (400, 401, 404, 500)
- **Debugging**: Include error codes and request IDs

### Implementation Approach
```python
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "message": "Invalid request parameters"
        }
    )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "Not Found",
            "message": "Resource not found"
        }
    )
```

### Alternatives Considered
- **Default FastAPI errors**: Less consistent, verbose validation errors
- **Custom middleware**: More complex, harder to maintain

---

## 8. Testing Strategy: Pytest + FastAPI TestClient

### Decision
Use **pytest** with FastAPI's `TestClient` for integration tests and unit tests for services.

### Rationale
- **FastAPI integration**: TestClient simulates HTTP requests without running server
- **Pytest fixtures**: Clean test setup/teardown with database isolation
- **Coverage**: Can test full request/response cycle including auth
- **Async support**: pytest-asyncio for async test functions

### Implementation Approach
```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlmodel import create_engine, Session
from backend.main import app
from backend.database import get_session

@pytest.fixture
def client():
    # Use in-memory SQLite for tests
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)

    def override_get_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    with TestClient(app) as client:
        yield client

@pytest.fixture
def auth_headers():
    # Generate test JWT token
    token = generate_test_token(user_id="test-user-123")
    return {"Authorization": f"Bearer {token}"}

# tests/test_tasks.py
def test_create_task(client, auth_headers):
    response = client.post(
        "/tasks",
        headers=auth_headers,
        json={"title": "Test Task", "description": "Test"}
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Task"
```

### Alternatives Considered
- **unittest**: Less Pythonic, more boilerplate
- **Manual HTTP requests**: Harder to test, requires running server

---

## 9. Environment Configuration: Pydantic Settings

### Decision
Use **Pydantic Settings** for environment variable management with validation.

### Rationale
- **Type safety**: Environment variables validated and typed
- **Defaults**: Sensible defaults for development
- **Dotenv support**: Automatic `.env` file loading
- **Documentation**: Self-documenting configuration

### Implementation Approach
```python
# backend/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

### Alternatives Considered
- **python-decouple**: Less type-safe
- **Manual os.getenv()**: No validation, error-prone

---

## 10. Database Migrations: Alembic

### Decision
Use **Alembic** for database schema migrations with SQLModel integration.

### Rationale
- **Version control**: Track schema changes over time
- **Rollback capability**: Safely revert problematic migrations
- **Team collaboration**: Consistent schema across environments
- **SQLModel integration**: Auto-generate migrations from SQLModel models

### Implementation Approach
```bash
# Initialize Alembic
alembic init alembic

# Generate migration from SQLModel models
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### Alternatives Considered
- **Manual SQL**: Error-prone, no version control
- **SQLModel.metadata.create_all()**: No migration history, risky for production

---

## 11. Neon MCP Integration

### Decision
Use **Neon MCP tool** (`mcp__Neon__get_connection_string`) to retrieve database connection details programmatically.

### Rationale
- **Automation**: No manual copying of connection strings
- **Security**: Credentials not stored in code or plaintext files
- **Consistency**: Single source of truth for database configuration
- **Integration**: Seamless workflow with Claude Code and MCP ecosystem

### Implementation Approach
1. During setup, use `mcp__Neon__get_connection_string` to retrieve connection string
2. Store in `.env` file (git-ignored)
3. Load via Pydantic Settings in application code

```python
# During setup (not in application code)
connection_string = mcp__Neon__get_connection_string(project_id="...")
# Write to .env file
```

### Alternatives Considered
- **Manual configuration**: Error-prone, security risk
- **Hardcoded strings**: Security violation

---

## Summary of Key Decisions

| Decision Area | Technology | Rationale |
|---------------|------------|-----------|
| Database | Neon Serverless PostgreSQL | Serverless scaling, full PostgreSQL features |
| ORM/Validation | SQLModel | Combines Pydantic + SQLAlchemy for type safety |
| Tag Storage | JSONB column | Simple, performant, flexible |
| JWT Library | PyJWT | Industry standard, FastAPI integration |
| Recurrence Format | iCalendar RRULE | Standard format, robust library support |
| Query Validation | Pydantic models | Type-safe, auto-documented |
| Project Structure | Layered architecture | Separation of concerns, testability |
| Error Handling | Custom exception handlers | Consistent API responses |
| Testing | Pytest + TestClient | FastAPI integration, async support |
| Configuration | Pydantic Settings | Type-safe, validated env vars |
| Migrations | Alembic | Version control, rollback capability |
| MCP Integration | Neon MCP tool | Automated credential management |

All technical unknowns have been resolved. Ready to proceed to Phase 1 (Data Model and API Contracts).
