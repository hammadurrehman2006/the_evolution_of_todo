# Quickstart Guide: Backend Task Management API

**Feature**: Backend Task Management API
**Date**: 2026-01-02
**Purpose**: Step-by-step guide to set up, develop, test, and deploy the backend API

---

## Prerequisites

### Required Software
- Python 3.11+ installed
- PostgreSQL client (for database verification)
- Git for version control
- Text editor or IDE (VS Code recommended)

### Required Accounts
- Neon account (serverless PostgreSQL hosting)
- JWT issuer configured (Better Auth, Auth0, or similar)

### Environment Setup
```bash
# Install uv (recommended Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or use pip
pip install uv
```

---

## Step 1: Project Setup

### 1.1 Create Project Directory

```bash
# Navigate to project root
cd /home/hammadurrehman2006/Desktop/the_evolution_of_todo

# Create backend directory structure
mkdir -p backend/{routes,services,utils,tests}
cd backend
```

### 1.2 Initialize Python Project

```bash
# Initialize UV project
uv init

# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows
```

### 1.3 Install Dependencies

```bash
# Install core dependencies
uv pip install fastapi uvicorn sqlmodel asyncpg python-jose python-dateutil pydantic-settings alembic

# Install development dependencies
uv pip install pytest pytest-asyncio httpx black ruff

# Freeze dependencies
uv pip freeze > requirements.txt
```

**Dependency Justifications:**
- `fastapi`: Web framework for REST API
- `uvicorn`: ASGI server for running FastAPI
- `sqlmodel`: ORM and data validation (combines Pydantic + SQLAlchemy)
- `asyncpg`: Async PostgreSQL driver for SQLModel
- `python-jose[cryptography]`: JWT token validation
- `python-dateutil`: iCalendar RRULE parsing for recurring tasks
- `pydantic-settings`: Environment variable management
- `alembic`: Database migrations
- `pytest`: Testing framework
- `pytest-asyncio`: Async test support
- `httpx`: HTTP client for testing FastAPI
- `black`: Code formatter
- `ruff`: Fast Python linter

---

## Step 2: Database Setup

### 2.1 Provision Neon Database (Using MCP)

**Option A: Use Neon MCP Tool** (Recommended)
```python
# In Claude Code session or Python script
connection_string = mcp__Neon__get_connection_string(project_id="your-project-id")
print(connection_string)
# Output: postgresql://user:password@hostname/database
```

**Option B: Manual Setup**
1. Go to https://neon.tech
2. Create new project
3. Copy connection string from dashboard

### 2.2 Configure Environment Variables

Create `.env` file in backend/ directory:
```bash
# .env
DATABASE_URL=postgresql://user:password@hostname/database?sslmode=require
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=["http://localhost:3000"]
```

**Security Note**: Add `.env` to `.gitignore` to prevent committing secrets.

### 2.3 Verify Database Connection

```python
# test_connection.py
from sqlmodel import create_engine, text

DATABASE_URL = "your-connection-string"
engine = create_engine(DATABASE_URL, echo=True)

with engine.connect() as conn:
    result = conn.execute(text("SELECT version();"))
    print(result.fetchone())
```

```bash
# Run test
python test_connection.py
# Expected output: PostgreSQL version info
```

---

## Step 3: Implement Core Files

### 3.1 Create `config.py` (Configuration)

```python
# backend/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    cors_origins: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

### 3.2 Create `database.py` (Database Connection)

```python
# backend/database.py
from sqlmodel import SQLModel, create_engine, Session
from backend.config import settings

# Create async engine
engine = create_engine(
    settings.database_url,
    echo=True,  # Log SQL queries (disable in production)
    pool_pre_ping=True,  # Verify connections before using
)

def create_db_and_tables():
    """Create all tables (use Alembic in production)"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for FastAPI routes"""
    with Session(engine) as session:
        yield session
```

### 3.3 Create `models.py` (Data Models)

```python
# backend/models.py
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class PriorityEnum(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        nullable=False,
        sa_column=Column(PGUUID(as_uuid=True))
    )
    user_id: str = Field(nullable=False, index=True)
    title: str = Field(min_length=1, max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: bool = Field(default=False, nullable=False)
    priority: PriorityEnum = Field(default=PriorityEnum.MEDIUM, nullable=False)
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(JSONB))
    due_date: Optional[datetime] = Field(default=None)
    reminder_at: Optional[datetime] = Field(default=None)
    is_recurring: bool = Field(default=False, nullable=False)
    recurrence_rule: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
```

### 3.4 Create `dependencies.py` (Authentication)

```python
# backend/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from backend.config import settings

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extract and validate user_id from JWT token"""
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        user_id: str = payload.get("sub") or payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id"
            )

        return user_id

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
```

### 3.5 Create `routes/tasks.py` (API Endpoints)

```python
# backend/routes/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from backend.models import Task
from backend.database import get_session
from backend.dependencies import get_current_user
import uuid

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: Task,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new task"""
    task_data.user_id = user_id  # Enforce user isolation
    session.add(task_data)
    session.commit()
    session.refresh(task_data)
    return task_data

@router.get("/")
async def list_tasks(
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List all tasks for authenticated user"""
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()
    return {"items": tasks, "total": len(tasks)}

@router.get("/{task_id}")
async def get_task(
    task_id: uuid.UUID,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get single task by ID"""
    task = session.get(Task, task_id)

    if not task or task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task

# Add more endpoints (update, delete, toggle) following same pattern
```

### 3.6 Create `main.py` (Application Entry)

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import create_db_and_tables
from backend.routes import tasks

app = FastAPI(
    title="Task Management API",
    version="1.0.0",
    description="Backend API for task management with JWT authentication"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(tasks.router)

# Health check endpoint (no auth required)
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Create tables on startup (use Alembic in production)
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Step 4: Run and Test

### 4.1 Start Development Server

```bash
# From backend/ directory with activated venv
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process
```

### 4.2 Test Health Check

```bash
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","version":"1.0.0"}
```

### 4.3 View API Documentation

Open browser: http://localhost:8000/docs

**Interactive API Docs**: FastAPI auto-generates Swagger UI for testing endpoints.

### 4.4 Test Authentication

```bash
# Generate test JWT token (for development only)
python -c "
from jose import jwt
from datetime import datetime, timedelta

payload = {
    'sub': 'test-user-123',
    'exp': datetime.utcnow() + timedelta(hours=24)
}

token = jwt.encode(payload, 'your-secret-key', algorithm='HS256')
print(token)
"

# Use token in API requests
curl -H "Authorization: Bearer <token>" http://localhost:8000/tasks
```

### 4.5 Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=backend --cov-report=html

# Run specific test file
pytest tests/test_tasks.py -v
```

---

## Step 5: Database Migrations (Production)

### 5.1 Initialize Alembic

```bash
# From backend/ directory
alembic init alembic
```

### 5.2 Configure Alembic

Edit `alembic/env.py`:
```python
from backend.config import settings
from backend.models import SQLModel

config.set_main_option("sqlalchemy.url", settings.database_url)
target_metadata = SQLModel.metadata
```

### 5.3 Generate Migration

```bash
# Auto-generate migration from SQLModel models
alembic revision --autogenerate -m "Initial schema"

# Review generated migration in alembic/versions/
```

### 5.4 Apply Migration

```bash
# Apply all pending migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

---

## Step 6: Production Deployment

### 6.1 Environment Variables (Production)

```bash
# .env.production
DATABASE_URL=postgresql://prod-user:prod-password@prod-host/prod-db?sslmode=require
JWT_SECRET=<strong-random-secret>
JWT_ALGORITHM=HS256
CORS_ORIGINS=["https://yourdomain.com"]
```

### 6.2 Production Server (Gunicorn + Uvicorn)

```bash
# Install production server
uv pip install gunicorn

# Run with Gunicorn
gunicorn backend.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile - \
    --error-logfile -
```

### 6.3 Docker Deployment (Optional)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "backend.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

```bash
# Build and run
docker build -t task-api .
docker run -p 8000:8000 --env-file .env.production task-api
```

---

## Common Issues and Troubleshooting

### Issue: Database Connection Fails

**Symptoms**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solutions**:
1. Verify connection string in `.env`
2. Check Neon database status (console.neon.tech)
3. Ensure `sslmode=require` in connection string
4. Test connection with `psql` or database client

### Issue: JWT Token Validation Fails

**Symptoms**: `401 Unauthorized: Invalid token`

**Solutions**:
1. Verify `JWT_SECRET` matches token issuer's secret
2. Check token expiration (`exp` claim)
3. Ensure `JWT_ALGORITHM` matches (HS256, RS256, etc.)
4. Validate token structure at jwt.io

### Issue: CORS Errors in Frontend

**Symptoms**: `Access to XMLHttpRequest blocked by CORS policy`

**Solutions**:
1. Add frontend URL to `CORS_ORIGINS` in `.env`
2. Restart FastAPI server after config changes
3. Check browser console for specific CORS error
4. Verify `Access-Control-Allow-Origin` header in response

### Issue: Migrations Fail

**Symptoms**: `alembic.util.exc.CommandError: Target database is not up to date`

**Solutions**:
1. Check current migration version: `alembic current`
2. Review pending migrations: `alembic history`
3. Apply migrations: `alembic upgrade head`
4. If stuck, rollback and retry: `alembic downgrade -1 && alembic upgrade head`

---

## Validation Checklist

Before deploying, verify:

- [ ] Health check returns 200 OK: `GET /health`
- [ ] Swagger docs accessible: http://localhost:8000/docs
- [ ] Database connection successful (check logs)
- [ ] JWT authentication working (test with valid token)
- [ ] User isolation enforced (users can't access others' tasks)
- [ ] CRUD operations functional (create, read, update, delete)
- [ ] Search and filtering working (`GET /tasks?q=...`)
- [ ] Recurring task logic correct (toggle creates new instance)
- [ ] Error responses follow standard format (400, 401, 404)
- [ ] Migrations applied successfully (production only)

---

## Next Steps

1. **Implement Remaining Endpoints**: Complete update, delete, and toggle endpoints in `routes/tasks.py`
2. **Add Advanced Filtering**: Implement query parameter handling for search, sort, pagination
3. **Implement Recurring Logic**: Create `services/task_service.py` for recurring task creation
4. **Write Tests**: Add comprehensive test coverage in `tests/`
5. **Add Logging**: Implement structured logging for debugging and monitoring
6. **Performance Optimization**: Add database indexes, connection pooling, caching
7. **Security Hardening**: Add rate limiting, input sanitization, security headers
8. **Monitoring**: Integrate with observability tools (Sentry, DataDog, etc.)

---

## Additional Resources

- FastAPI Documentation: https://fastapi.tiangolo.com/
- SQLModel Documentation: https://sqlmodel.tiangolo.com/
- Neon Documentation: https://neon.tech/docs
- JWT Best Practices: https://jwt.io/introduction
- Alembic Documentation: https://alembic.sqlalchemy.org/

---

**Ready to Start**: Follow steps 1-4 to get a working MVP. Steps 5-6 are for production deployment.
