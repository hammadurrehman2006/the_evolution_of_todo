# Backend Task Management API

A production-ready REST API for task management built with FastAPI, SQLModel, and Neon PostgreSQL.

## Features Implemented

### ✅ Phase 1: Setup (Complete)
- Backend directory structure
- Python dependencies management
- Environment configuration
- Git ignore files

### ✅ Phase 2: Foundational Infrastructure (Complete)
- **Configuration**: Pydantic Settings with environment variable management
- **Database**: SQLModel engine with PostgreSQL/Neon support
- **Models**: Complete Task model with 13 fields (priorities, tags, dates, recurrence)
- **Schemas**: Pydantic validation schemas with field validators
- **Authentication**: JWT Bearer token authentication with user_id extraction
- **FastAPI App**: Application setup with CORS, error handlers, health check

### ✅ Phase 3: User Story 1 - Basic CRUD (Complete)
- **POST /tasks**: Create new task with validation
- **GET /tasks**: List tasks with advanced filtering and sorting
  - Search by keyword (title/description)
  - Filter by status, priority, tags, date ranges
  - Sort by due_date, title, or priority
  - Pagination (limit/offset)
- **GET /tasks/{id}**: Retrieve single task
- **PUT /tasks/{id}**: Update task (partial updates supported)
- **DELETE /tasks/{id}**: Delete task permanently
- **POST /tasks/{id}/toggle**: Toggle completion status
- **Strict user isolation**: All operations enforce user_id from JWT

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip3 install -r requirements.txt
```

### 2. Configure Database

Get your Neon PostgreSQL connection string from https://console.neon.tech and update `.env`:

```bash
cp .env.example .env
# Edit .env and add your actual DATABASE_URL
```

**Example .env:**
```
DATABASE_URL=postgresql://username:password@hostname.neon.tech/database?sslmode=require
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
CORS_ORIGINS=["http://localhost:3000"]
```

### 3. Uncomment Database Initialization

In `main.py`, uncomment the startup event:

```python
@app.on_event("startup")
def on_startup():
    """Initialize database tables on application startup."""
    create_db_and_tables()
```

### 4. Start the Server

```bash
python3 main.py
```

Or with uvicorn:

```bash
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Access Swagger UI

Open your browser to: **http://localhost:8000/docs**

## Testing via Swagger UI

### Generate Test JWT Token

For testing, generate a JWT token with a test user_id:

```python
import jwt
from datetime import datetime, timedelta

payload = {
    'sub': 'test-user-123',  # user_id
    'exp': datetime.utcnow() + timedelta(hours=24)
}

token = jwt.encode(payload, 'dev-secret-key-replace-in-production-with-openssl-rand-hex-32', algorithm='HS256')
print(token)
```

### Test Endpoints

1. Click "Authorize" button in Swagger UI
2. Enter: `Bearer <your-token>`
3. Test endpoints:
   - **Create Task**: POST /tasks with title, priority, tags, due_date
   - **List Tasks**: GET /tasks with filters (q, status, priority, tags)
   - **Get Task**: GET /tasks/{id}
   - **Update Task**: PUT /tasks/{id}
   - **Toggle Complete**: POST /tasks/{id}/toggle
   - **Delete Task**: DELETE /tasks/{id}

## API Endpoints

### Health Check
```
GET /health (no auth required)
```

### Tasks
```
POST   /tasks                Create new task
GET    /tasks                List tasks (with filters/search/sort/pagination)
GET    /tasks/{id}           Get single task
PUT    /tasks/{id}           Update task
DELETE /tasks/{id}           Delete task
POST   /tasks/{id}/toggle    Toggle completion
```

## Query Parameters (GET /tasks)

| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Keyword search (title/description) |
| status | boolean | Filter by completion (true/false) |
| priority | string | Filter by priority (High/Medium/Low) |
| tags | string | Filter by tags (comma-separated) |
| due_date_from | datetime | Filter tasks due after this date |
| due_date_to | datetime | Filter tasks due before this date |
| sort_by | string | Sort field (due_date/title/priority) |
| sort_order | string | Sort order (asc/desc) |
| limit | integer | Page size (default 50, max 100) |
| offset | integer | Pagination offset (default 0) |

## Task Model Fields

```python
{
    "id": "uuid",
    "user_id": "string",
    "title": "string (1-200 chars, required)",
    "description": "string (max 2000 chars, optional)",
    "completed": "boolean",
    "priority": "High|Medium|Low",
    "tags": ["string"],
    "due_date": "datetime (ISO 8601)",
    "reminder_at": "datetime (ISO 8601, must be <= due_date)",
    "is_recurring": "boolean",
    "recurrence_rule": "string (iCalendar RRULE format)",
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

## Security

- **JWT Authentication**: All endpoints (except /health) require valid Bearer token
- **User Isolation**: All queries automatically filter by user_id from JWT
- **Input Validation**: Strict Pydantic validation on all inputs
- **SQL Injection Protection**: SQLModel uses parameterized queries
- **404 for Unauthorized Access**: Returns 404 (not 403) to prevent information leakage

## Architecture

```
backend/
├── main.py                 # FastAPI app, CORS, error handlers
├── config.py               # Environment settings
├── database.py             # SQLModel engine and session
├── models.py               # Task model (SQLModel table)
├── schemas.py              # Pydantic request/response schemas
├── dependencies.py         # JWT authentication dependency
├── routes/
│   └── tasks.py            # Task CRUD endpoints
├── services/               # Business logic (for future phases)
└── utils/                  # Utilities (for future phases)
```

## Next Steps

### User Story 2: Priorities and Tags (7 tasks)
- Verify priority and tags functionality (already implemented)
- Add GIN index for JSONB tags
- Test tag de-duplication

### User Story 3: Advanced Discovery (11 tasks)
- Already implemented! Test search, filters, sorting

### User Story 4: Due Dates & Reminders (7 tasks)
- Already implemented! Test date validations

### User Story 5: Recurring Tasks (10 tasks)
- Implement RRULE parsing utility
- Implement recurring task creation logic
- Update toggle endpoint to create new instances

### Database Migrations (7 tasks)
- Setup Alembic for production
- Create initial migration
- Add indexes (GIN for tags, partial for dates)

### Polish (13 tasks)
- Add structured logging
- Docker deployment
- Performance testing
- Security hardening

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Secret key for JWT validation |
| JWT_ALGORITHM | No | JWT algorithm (default: HS256) |
| CORS_ORIGINS | No | Allowed origins (default: ["http://localhost:3000"]) |

## Error Responses

All errors follow a standardized format:

```json
{
    "error": "Error Type",
    "detail": [...],  // For validation errors
    "message": "Human-readable error message"
}
```

**Status Codes:**
- 200 OK: Successful GET, PUT, POST (toggle)
- 201 Created: Successful POST (create)
- 204 No Content: Successful DELETE
- 400 Bad Request: Validation errors
- 401 Unauthorized: Authentication failures
- 404 Not Found: Resource not found or access denied
- 500 Internal Server Error: Unexpected failures

## Development

### Code Quality
```bash
# Format code
black .

# Lint code
ruff check .
```

### Testing
```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=backend --cov-report=html
```

## Production Deployment

1. Generate strong JWT secret:
```bash
openssl rand -hex 32
```

2. Setup production database on Neon

3. Configure environment variables

4. Run with Gunicorn:
```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

5. Setup HTTPS reverse proxy (Nginx/Caddy)

6. Monitor with logging and metrics

## Troubleshooting

**Database Connection Fails:**
- Verify `DATABASE_URL` in `.env`
- Check Neon database status
- Ensure `sslmode=require` in connection string

**JWT Token Invalid:**
- Verify `JWT_SECRET` matches token issuer
- Check token expiration
- Validate token structure at jwt.io

**CORS Errors:**
- Add frontend URL to `CORS_ORIGINS` in `.env`
- Restart server after config changes

## Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## License

MIT License

## Support

For issues or questions, refer to:
- FastAPI Documentation: https://fastapi.tiangolo.com/
- SQLModel Documentation: https://sqlmodel.tiangolo.com/
- Neon Documentation: https://neon.tech/docs
