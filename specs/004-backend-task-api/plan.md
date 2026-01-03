# Implementation Plan: Backend Task Management API

**Branch**: `004-backend-task-api` | **Date**: 2026-01-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-backend-task-api/spec.md`

**Note**: This plan documents the technical architecture and implementation strategy for the backend Task Management REST API.

---

## Summary

Build a production-ready REST API for task management using **FastAPI, SQLModel, and Neon Serverless PostgreSQL**. The API provides complete CRUD operations for tasks with advanced features including:

- **Core Operations**: Create, read, update, delete, and toggle task completion (US1 - P1)
- **Organization**: Priority levels (High/Medium/Low) and flexible tagging system (US2 - P2)
- **Discovery**: Full-text search, multi-criteria filtering, and customizable sorting (US3 - P3)
- **Scheduling**: Due dates, reminders, and iCalendar RRULE-based recurring tasks (US4, US5 - P4, P5)
- **Security**: JWT-based authentication with strict multi-tenant user isolation

**Key Technical Decisions** (from research.md):
- **Database**: Neon Serverless PostgreSQL with JSONB for tags storage
- **ORM**: SQLModel combining Pydantic validation and SQLAlchemy ORM
- **Authentication**: PyJWT with FastAPI dependency injection for user_id extraction
- **Recurrence**: iCalendar RRULE format parsed via python-dateutil
- **Architecture**: Layered structure (routes → services → models) for maintainability

---

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.100+, SQLModel 0.0.14+, asyncpg 0.29+, PyJWT 2.8+, python-dateutil 2.8+, Pydantic Settings 2.0+, Alembic 1.13+
**Storage**: Neon Serverless PostgreSQL 15+ with JSONB support
**Testing**: pytest 7.4+ with pytest-asyncio, FastAPI TestClient, httpx for integration tests
**Target Platform**: Linux server (Docker-compatible), async ASGI runtime (uvicorn/gunicorn)
**Project Type**: Web application (backend-only, REST API)
**Performance Goals**:
- <500ms task creation (p95) (SC-001)
- <1s task list retrieval for 100 tasks (p99) (SC-002)
- 1,000 concurrent users without degradation (SC-003)
- <2s search/filter operations for 10,000 tasks (SC-004)

**Constraints**:
- 100% JWT authentication enforcement (SC-005)
- Zero user data leakage (SC-008)
- HTTPS-only in production
- Stateless server design (aligns with constitution.md)

**Scale/Scope**:
- ~10,000 users initially
- ~50,000 tasks per user maximum
- 7 REST endpoints (1 public, 6 authenticated)
- 41 functional requirements across 5 user stories

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Alignment with Constitution Principles

| Principle | Compliance Status | Evidence |
|-----------|-------------------|----------|
| **No Task = No Code** | ✅ PASS | All implementation requires tasks in tasks.md (to be generated in Phase 2) |
| **Technology Stack Evolution** | ✅ PASS | Uses FastAPI (mandated backend framework) and Neon DB (mandated PostgreSQL provider) |
| **JWT-based Authentication** | ✅ PASS | Implements JWT Bearer token validation via Better Auth integration (FR-029 through FR-034) |
| **Stateless Server Design** | ✅ PASS | No server-side session storage; all state in PostgreSQL or JWT claims |
| **Containerized Deployment** | ✅ PASS | Designed for Docker deployment with environment-based configuration |
| **Event-Driven Architecture** | ⏳ DEFERRED | Kafka/Dapr integration deferred to future phase (out of scope for MVP) |
| **AI Chatbot Interface** | ⏳ DEFERRED | OpenAI Agents SDK integration deferred (separate feature) |

### Post-Design Re-Check ✅

**Re-evaluated after Phase 1 (research.md, data-model.md, API contracts):**

- **Security**: JWT authentication architecture validated - extracts `user_id` from token, filters all queries by `user_id`
- **Data Model**: Task entity aligns with spec requirements - 13 fields including multi-tenancy (`user_id`)
- **API Design**: REST endpoints follow best practices - proper HTTP methods, status codes, error handling
- **Scalability**: Layered architecture supports horizontal scaling - stateless design, connection pooling
- **Maintainability**: Clear separation of concerns - routes vs services vs models vs utilities

**No Constitution violations. All principles either satisfied or deferred to future phases per roadmap.**

---

## Project Structure

### Documentation (this feature)

```text
specs/004-backend-task-api/
├── spec.md                     # Feature specification with user stories (COMPLETE)
├── plan.md                     # This implementation plan (IN PROGRESS)
├── research.md                 # Technology decisions and research (COMPLETE)
├── data-model.md               # Database schema and entity definitions (COMPLETE)
├── quickstart.md               # Step-by-step setup and deployment guide (COMPLETE)
├── contracts/
│   └── api-endpoints.md        # REST API contract definitions (COMPLETE)
├── checklists/
│   └── requirements.md         # Specification quality validation (COMPLETE)
└── tasks.md                    # Implementation tasks (Phase 2 - PENDING /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── main.py                     # FastAPI application entry point
├── config.py                   # Pydantic Settings for environment variables
├── database.py                 # SQLModel engine and session management
├── models.py                   # SQLModel data models (Task entity)
├── schemas.py                  # Pydantic request/response schemas
├── dependencies.py             # FastAPI dependencies (JWT auth, pagination)
├── routes/
│   └── tasks.py                # Task CRUD endpoint handlers
├── services/
│   ├── task_service.py         # Business logic (recurring tasks, filtering)
│   └── auth_service.py         # JWT validation and user_id extraction
├── utils/
│   └── recurrence.py           # iCalendar RRULE parsing and date calculation
└── tests/
    ├── conftest.py             # Pytest fixtures (test client, database)
    ├── test_tasks.py           # Integration tests for task endpoints
    ├── test_auth.py            # Authentication tests
    ├── test_recurrence.py      # Recurring task logic tests
    └── test_filters.py         # Search/filter/sort tests

# Root-level configuration
├── .env                        # Environment variables (git-ignored)
├── requirements.txt            # Python dependencies
├── alembic/                    # Database migrations
│   ├── env.py                  # Alembic configuration
│   └── versions/               # Migration scripts
├── Dockerfile                  # Container image definition
└── docker-compose.yml          # Local development setup
```

**Structure Decision**: Backend-only project following layered architecture pattern. Clear separation between:
- **Routes** (HTTP layer): Request parsing, response formatting, HTTP status codes
- **Services** (Business logic): Task operations, recurring logic, filtering/sorting
- **Models** (Data layer): Database schema, validation, ORM mapping
- **Utils** (Helpers): Reusable utilities (RRULE parsing, date calculation)

This structure aligns with FastAPI best practices and supports independent testing of each layer.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No Constitution violations detected. No complexity justifications required.

---

## Phase 0: Research - Technology Selection

**Status**: ✅ COMPLETE

**Output**: [research.md](./research.md)

### Key Decisions Documented

1. **Database Technology**: Neon Serverless PostgreSQL
   - Rationale: Serverless scaling, full PostgreSQL features, JSONB support
   - Alternative rejected: SQLite (too limited), MongoDB (preference for relational)

2. **Tag Storage**: JSONB column in Task table
   - Rationale: Simple, performant, flexible (GIN indexes)
   - Alternative rejected: Separate Tag table (unnecessary joins, complexity)

3. **JWT Library**: PyJWT
   - Rationale: Industry standard, FastAPI integration
   - Alternative rejected: python-jose (less maintained)

4. **Recurrence Format**: iCalendar RRULE
   - Rationale: Standard format, robust library support
   - Alternative rejected: Simple intervals (less expressive)

5. **Query Validation**: Pydantic models
   - Rationale: Type-safe, auto-documented
   - Alternative rejected: Manual parsing (error-prone)

6. **Project Structure**: Layered architecture
   - Rationale: Separation of concerns, testability
   - Alternative rejected: Flat structure (not scalable)

7. **Error Handling**: Custom exception handlers
   - Rationale: Consistent API responses
   - Alternative rejected: Default FastAPI errors (verbose)

8. **Testing**: Pytest + FastAPI TestClient
   - Rationale: FastAPI integration, async support
   - Alternative rejected: unittest (more boilerplate)

9. **Configuration**: Pydantic Settings
   - Rationale: Type-safe, validated env vars
   - Alternative rejected: python-decouple (less type-safe)

10. **Migrations**: Alembic
    - Rationale: Version control, rollback capability
    - Alternative rejected: Manual SQL (no version control)

11. **Neon Integration**: Neon MCP tool
    - Rationale: Automated credential management
    - Alternative rejected: Manual configuration (security risk)

All technical unknowns resolved. No NEEDS CLARIFICATION markers remaining.

---

## Phase 1: Design - Data Model & API Contracts

**Status**: ✅ COMPLETE

**Outputs**:
- [data-model.md](./data-model.md)
- [contracts/api-endpoints.md](./contracts/api-endpoints.md)
- [quickstart.md](./quickstart.md)

### 1. Data Model Summary

**Primary Entity**: Task (SQLModel table)

**Fields** (13 total):
- `id`: UUID (primary key)
- `user_id`: String (multi-tenancy, indexed)
- `title`: String(200) - required
- `description`: String(2000) - optional
- `completed`: Boolean - default false
- `priority`: Enum('High', 'Medium', 'Low') - default Medium
- `tags`: JSONB (array of strings) - default []
- `due_date`: DateTime - optional
- `reminder_at`: DateTime - optional
- `is_recurring`: Boolean - default false
- `recurrence_rule`: String - optional (iCalendar RRULE format)
- `created_at`: DateTime - auto-generated
- `updated_at`: DateTime - auto-updated

**Indexes**:
- Primary: `idx_task_id` (UUID)
- User isolation: `idx_task_user_id`
- Composite: `idx_task_user_completed` (common query pattern)
- Date filtering: `idx_task_due_date` (partial index where due_date IS NOT NULL)
- Tag search: `idx_task_tags` (GIN index for JSONB containment queries)

**Constraints**:
- Title not empty (CHECK constraint)
- reminder_at ≤ due_date (CHECK constraint)
- Recurring tasks must have recurrence_rule (CHECK constraint)

**Validation Rules** (enforced at Pydantic/SQLModel layer):
- Title: 1-200 characters (FR-035)
- Description: max 2000 characters (FR-036)
- Priority: one of High/Medium/Low (FR-037)
- Dates: valid ISO 8601 format (FR-038)
- reminder_at ≤ due_date (FR-024)
- Tags: auto-deduplicated (FR-011)

### 2. API Contract Summary

**Total Endpoints**: 7 (1 public, 6 authenticated)

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| GET | `/health` | No | Health check |
| POST | `/tasks` | Yes | Create task |
| GET | `/tasks` | Yes | List tasks (with filters/search/sort/pagination) |
| GET | `/tasks/{task_id}` | Yes | Get single task |
| PUT | `/tasks/{task_id}` | Yes | Update task |
| DELETE | `/tasks/{task_id}` | Yes | Delete task |
| POST | `/tasks/{task_id}/toggle` | Yes | Toggle completion (handles recurring) |

**Authentication Flow**:
1. Client includes JWT token in `Authorization: Bearer <token>` header
2. API validates token signature and expiration via PyJWT
3. API extracts `user_id` from token payload (claim: `sub` or `user_id`)
4. All database queries filtered by `user_id` for strict isolation

**Query Parameters** (GET /tasks):
- `q`: Keyword search (title/description)
- `status`: Filter by completion (boolean)
- `priority`: Filter by priority (High/Medium/Low)
- `tags`: Filter by tags (comma-separated)
- `due_date_from`, `due_date_to`: Date range filtering
- `sort_by`: Sort field (due_date/title/priority)
- `sort_order`: Sort direction (asc/desc)
- `limit`: Page size (default 50, max 100)
- `offset`: Pagination offset (default 0)

**Error Responses** (standardized format):
- 400 Bad Request: Validation errors
- 401 Unauthorized: Invalid/expired JWT
- 404 Not Found: Resource not found or access denied (user isolation)
- 500 Internal Server Error: Unexpected failures only

**Success Responses**:
- 200 OK: Successful GET, PUT, POST (toggle)
- 201 Created: Successful POST (create)
- 204 No Content: Successful DELETE

### 3. Quickstart Guide

**Purpose**: Step-by-step developer onboarding

**Covers**:
1. Prerequisites (Python 3.11+, Neon account)
2. Project setup (directory structure, dependencies)
3. Database setup (Neon MCP integration, connection string)
4. Core file implementation (config, database, models, dependencies, routes, main)
5. Running and testing (development server, Swagger docs, health check)
6. Database migrations (Alembic configuration)
7. Production deployment (Gunicorn, Docker)
8. Troubleshooting (common issues and solutions)
9. Validation checklist (pre-deployment verification)

---

## Phase 2: Implementation Tasks (Next Step)

**Status**: ⏳ PENDING - Generated by `/sp.tasks` command

**Will decompose into atomic tasks**:
1. **Setup** (5-8 tasks): Project initialization, dependency installation, environment configuration
2. **Database** (8-12 tasks): Models, migrations, indexes, connection pooling
3. **Authentication** (5-7 tasks): JWT validation, user_id extraction, error handling
4. **Core CRUD** (12-15 tasks): Create, read, update, delete endpoints (US1 - P1)
5. **Organization** (6-8 tasks): Priority and tag support (US2 - P2)
6. **Discovery** (10-12 tasks): Search, filtering, sorting, pagination (US3 - P3)
7. **Scheduling** (8-10 tasks): Due dates, reminders, date filtering (US4 - P4)
8. **Recurring** (10-12 tasks): RRULE parsing, auto-rescheduling logic (US5 - P5)
9. **Testing** (15-20 tasks): Unit tests, integration tests, coverage
10. **Documentation** (5-7 tasks): API docs, deployment docs, README

**Estimated Total Tasks**: 80-110 atomic tasks

**Critical Path**: Setup → Database → Authentication → Core CRUD (MVP) → Organization/Discovery/Scheduling (enhancements) → Recurring (advanced)

---

## Implementation Notes

### Database Considerations

**Connection Pooling**:
- Use SQLModel's built-in connection pooling
- Pool size: 5-10 connections for development, 20-50 for production
- Pool pre-ping: True (verify connections before use)

**JSONB Indexing**:
- Create GIN index on `tags` column for fast containment queries
- Query example: `Task.tags.op('@>')(["Work"])` (PostgreSQL JSONB contains operator)

**Migration Strategy**:
- Use Alembic for all schema changes
- Auto-generate migrations from SQLModel models: `alembic revision --autogenerate`
- Test rollback capability before production: `alembic downgrade -1`

### Authentication Flow

**JWT Token Validation**:
1. Extract token from `Authorization: Bearer <token>` header
2. Decode using `jwt.decode(token, secret, algorithms=[algo])`
3. Catch exceptions: `ExpiredSignatureError`, `InvalidTokenError`
4. Extract `user_id` from payload: `payload.get("sub") or payload.get("user_id")`
5. Return user_id for use in route handlers

**User Isolation Pattern**:
```python
# Every database query MUST include user_id filter
query = select(Task).where(Task.user_id == current_user_id)
```

**404 vs 403 Pattern**:
- Always return 404 (not 403) when task doesn't belong to user
- Prevents information leakage (FR-034)

### Recurring Task Logic

**Algorithm**:
1. User toggles task completion → `completed=True`
2. Check if `is_recurring=True` and `recurrence_rule` exists
3. Parse RRULE using `python-dateutil.rrule.rrulestr(recurrence_rule, dtstart=current_due_date)`
4. Calculate next occurrence: `rule.after(current_due_date)`
5. Create new Task instance with:
   - Same title, description, priority, tags
   - New due_date (from RRULE calculation)
   - `completed=False`
   - Preserve is_recurring and recurrence_rule
6. Return both original task (completed) and new task (next instance)

**RRULE Examples**:
- Daily: `FREQ=DAILY`
- Weekly (Monday/Wednesday/Friday): `FREQ=WEEKLY;BYDAY=MO,WE,FR`
- Monthly (1st of month): `FREQ=MONTHLY;BYMONTHDAY=1`
- Yearly: `FREQ=YEARLY`

### Performance Optimizations

**Query Optimization**:
- Use indexed columns in WHERE clauses (user_id, completed, due_date, tags)
- Limit result sets with pagination (default 50, max 100)
- Avoid N+1 queries (SQLModel handles this with proper eager loading)

**Caching Strategy** (future):
- Cache frequently accessed tasks per user (Redis)
- Invalidate cache on task creation/update/deletion
- TTL: 5 minutes for task lists, 1 hour for individual tasks

**Load Testing**:
- Use Locust or K6 for load testing
- Target: 1,000 concurrent users, 95th percentile <500ms

### Security Hardening

**Input Validation**:
- Pydantic models validate all input fields
- SQLModel enforces database-level constraints
- Custom validators for complex rules (e.g., reminder_at ≤ due_date)

**SQL Injection Prevention**:
- SQLModel uses parameterized queries (safe by default)
- Never concatenate user input into SQL strings

**HTTPS Enforcement**:
- Production must use HTTPS only
- Set `Secure` flag on cookies (if used)
- Add HSTS headers: `Strict-Transport-Security: max-age=31536000`

**Rate Limiting** (future):
- Implement rate limiting middleware (e.g., slowapi)
- Limit: 100 requests/minute per user
- Return 429 Too Many Requests when exceeded

### Testing Strategy

**Unit Tests**:
- Test models: Validation rules, state transitions
- Test services: Recurring logic, filtering, sorting
- Test utilities: RRULE parsing, date calculation

**Integration Tests**:
- Test endpoints: Full request/response cycle
- Test authentication: Valid/invalid/expired tokens
- Test user isolation: Ensure users can't access others' tasks

**Test Database**:
- Use in-memory SQLite for fast tests
- Override `get_session` dependency in FastAPI TestClient
- Reset database between tests

**Coverage Target**: >80% code coverage

### Deployment Strategy

**Environment-Specific Configuration**:
- Development: SQLite (optional), debug logging, CORS permissive
- Staging: Neon PostgreSQL, info logging, CORS restricted
- Production: Neon PostgreSQL, error logging only, CORS strict

**Container Image**:
- Base image: `python:3.11-slim`
- Multi-stage build for smaller image size
- Health check endpoint: `/health`
- Expose port 8000

**Environment Variables** (required):
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT validation
- `JWT_ALGORITHM`: JWT algorithm (default HS256)
- `CORS_ORIGINS`: Allowed origins (comma-separated)

**Monitoring**:
- Application logs: Structured JSON logging
- Metrics: Prometheus metrics endpoint (future)
- Errors: Sentry integration (future)
- Health checks: `/health` endpoint for load balancers

---

## Dependencies

### External Services

| Service | Purpose | Provider | Status |
|---------|---------|----------|--------|
| PostgreSQL Database | Primary data store | Neon (serverless) | Required |
| JWT Token Issuer | User authentication | Better Auth / Auth0 | Required |
| MCP Server | Credential management | Neon MCP tool | Optional (for setup) |

### Python Packages

**Core Dependencies**:
- `fastapi` (v0.100+): Web framework
- `uvicorn` (v0.20+): ASGI server
- `sqlmodel` (v0.0.14+): ORM and validation
- `asyncpg` (v0.29+): PostgreSQL async driver
- `python-jose[cryptography]` (v3.3+): JWT validation
- `python-dateutil` (v2.8+): RRULE parsing
- `pydantic-settings` (v2.0+): Environment configuration
- `alembic` (v1.13+): Database migrations

**Development Dependencies**:
- `pytest` (v7.4+): Testing framework
- `pytest-asyncio` (v0.21+): Async test support
- `httpx` (v0.24+): HTTP client for testing
- `black` (v23.0+): Code formatter
- `ruff` (v0.1+): Fast linter

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JWT secret compromise | Low | High | Use strong random secrets, rotate regularly, audit access logs |
| Database connection pool exhaustion | Medium | High | Configure appropriate pool size, implement connection retry logic, monitor pool usage |
| RRULE parsing failures | Low | Medium | Validate RRULE format in Pydantic schema, catch parsing exceptions, return 400 with clear error |
| Performance degradation with large datasets | Medium | Medium | Implement pagination, add database indexes, optimize queries, consider caching |
| User isolation breach | Low | Critical | Enforce user_id filtering in all queries, write security tests, code review focus |
| Alembic migration conflicts | Medium | Low | Review migrations before applying, test rollback, document migration dependencies |
| CORS misconfiguration | Low | Medium | Whitelist origins explicitly, audit CORS configuration, test from frontend |

---

## Success Metrics

**Functional Completeness**:
- [ ] All 7 endpoints implemented and tested
- [ ] All 41 functional requirements satisfied
- [ ] All 5 user stories deliverable independently

**Performance** (from spec.md success criteria):
- [ ] SC-001: Task creation <500ms (p95)
- [ ] SC-002: Task list retrieval <1s (p99)
- [ ] SC-003: 1,000 concurrent users supported
- [ ] SC-004: Search/filter <2s for 10,000 tasks

**Security** (from spec.md):
- [ ] SC-005: 100% JWT enforcement
- [ ] SC-008: Zero user data leakage
- [ ] All endpoints validate tokens
- [ ] All queries filter by user_id

**Quality**:
- [ ] SC-006: Clear error messages for 100% of validation failures
- [ ] SC-010: Proper HTTP status codes
- [ ] >80% test coverage
- [ ] Zero critical security vulnerabilities (OWASP Top 10)

**Reliability**:
- [ ] SC-007: Recurring logic 100% correct
- [ ] SC-009: 99.9% uptime
- [ ] Health check responds within 100ms

---

## Next Steps

1. **Generate Implementation Tasks**: Run `/sp.tasks` to decompose this plan into 80-110 atomic tasks
2. **Begin MVP Implementation**: Start with Phase 1 tasks (Setup, Database, Authentication, Core CRUD)
3. **Iterative Development**: Implement user stories in priority order (US1 → US2 → US3 → US4 → US5)
4. **Continuous Testing**: Write tests concurrently with implementation (TDD approach)
5. **Documentation Updates**: Keep quickstart.md and API docs in sync with code changes
6. **Security Review**: Conduct security audit before production deployment
7. **Performance Testing**: Load test with realistic data volumes
8. **Deployment**: Deploy MVP (US1) first, then incremental feature deployments

---

**Planning Complete**: All technical unknowns resolved. Data model and API contracts defined. Ready for task decomposition via `/sp.tasks`.
