---
id: 0002
title: Backend Task Management API Implementation Plan
stage: plan
date: 2026-01-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: 004-backend-task-api
branch: 004-backend-task-api
user: hammadurrehman2006
command: /sp.plan
labels: ["backend", "api", "fastapi", "sqlmodel", "postgresql", "jwt", "architecture", "planning"]
links:
  spec: specs/004-backend-task-api/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-backend-task-api/plan.md
  - specs/004-backend-task-api/research.md
  - specs/004-backend-task-api/data-model.md
  - specs/004-backend-task-api/contracts/api-endpoints.md
  - specs/004-backend-task-api/quickstart.md
tests:
  - Constitution Check: PASS (all principles satisfied or deferred)
  - Technical unknowns: RESOLVED (11 key decisions documented)
---

## Prompt

Generate a technical implementation plan for the backend. The plan should structure the backend/ directory with main.py (app entry), database.py (Neon connection using SQLModel), models.py (Pydantic/SQLModel classes), dependencies.py (Auth/JWT verification), and routes/tasks.py (API handlers).

Database: Explicitly plan to use the Neon DB MCP tool to verify the project connection or schema status if possible. The Task model needs to use SQLModel with JSON columns for tags if using Postgres, or a separate relationship table.

API Logic: Plan the GET /tasks endpoint to accept complex query parameters (q, priority, sort_by) and map them to SQLModel filter statements.

Recurring Logic: Define how recurring tasks are stored (e.g., a recurrence_interval string).

Auth: Plan a dependency that extracts the user_id from the HTTP Authorization header to ensure every DB query uses .where(Task.user_id == current_user).

## Response snapshot

Created comprehensive technical implementation plan covering all phases of backend development:

**Phase 0: Research (COMPLETE)**
- Documented 11 key technology decisions with rationale and alternatives
- Database: Neon Serverless PostgreSQL with JSONB for tags (not separate table)
- ORM: SQLModel (Pydantic + SQLAlchemy) for type safety and validation
- Authentication: PyJWT with FastAPI dependency injection
- Recurrence: iCalendar RRULE format (industry standard, parsed via python-dateutil)
- Architecture: Layered structure (routes → services → models → utils)
- Testing: pytest + FastAPI TestClient
- Configuration: Pydantic Settings for type-safe environment variables
- Migrations: Alembic for version-controlled schema changes
- MCP Integration: Neon MCP tool for automated credential management

**Phase 1: Design (COMPLETE)**
- **Data Model**: Defined Task entity with 13 fields including user_id for multi-tenancy
  - JSONB column for tags (not separate table per user request)
  - 5 database indexes for performance (user_id, completed, due_date, tags GIN)
  - 3 CHECK constraints for data integrity (title not empty, reminder ≤ due_date, recurring requires rule)
- **API Contracts**: Documented 7 REST endpoints (1 public, 6 authenticated)
  - GET /health (no auth), POST /tasks, GET /tasks (with filters), GET /tasks/{id}, PUT /tasks/{id}, DELETE /tasks/{id}, POST /tasks/{id}/toggle
  - Complex query parameters: q (search), status, priority, tags, date ranges, sort_by, sort_order, limit, offset
  - JWT Bearer token authentication on all endpoints except health check
  - Standardized error responses (400, 401, 404, 500) with descriptive messages
- **Quickstart Guide**: Step-by-step developer onboarding covering setup through production deployment

**Project Structure**:
```
backend/
├── main.py (FastAPI app entry)
├── config.py (Pydantic Settings)
├── database.py (SQLModel engine + session)
├── models.py (Task entity)
├── schemas.py (request/response Pydantic models)
├── dependencies.py (JWT auth dependency)
├── routes/tasks.py (CRUD endpoints)
├── services/task_service.py (recurring logic, filtering)
├── utils/recurrence.py (RRULE parsing)
└── tests/ (pytest integration tests)
```

**Authentication Flow**:
1. Client sends JWT token in `Authorization: Bearer <token>` header
2. `get_current_user()` dependency extracts token via HTTPBearer
3. PyJWT validates signature, expiration, extracts user_id from payload (claim: "sub" or "user_id")
4. All database queries filtered by user_id: `select(Task).where(Task.user_id == current_user_id)`
5. Return 404 (not 403) for user isolation violations to prevent information leakage

**Recurring Task Logic**:
- Store recurrence_rule as string in iCalendar RRULE format (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR")
- On task completion toggle, if is_recurring=True:
  1. Parse RRULE using `dateutil.rrule.rrulestr(recurrence_rule, dtstart=current_due_date)`
  2. Calculate next occurrence: `rule.after(current_due_date)`
  3. Create new Task instance with same properties but new due_date and completed=False
  4. Return both completed task and new task instance

**Query Parameter Mapping** (GET /tasks):
- `q` → `or_(Task.title.ilike(f"%{q}%"), Task.description.ilike(f"%{q}%"))`
- `status` → `Task.completed == status`
- `priority` → `Task.priority == priority.capitalize()`
- `tags` → `Task.tags.op('@>')(tags)` (PostgreSQL JSONB contains operator)
- `due_date_from/to` → `Task.due_date >= from AND Task.due_date <= to`
- `sort_by` → Dynamic order_by with case statement for priority sorting
- Pagination via `limit().offset()`

**Constitution Compliance**: ✅ PASS
- No Task = No Code: Enforced (tasks.md required in Phase 2)
- Technology Stack: FastAPI ✓, Neon DB ✓, JWT auth ✓, stateless design ✓
- Containerization: Designed for Docker deployment
- Event-driven & AI chatbot: Deferred to future phases (not MVP scope)

## Outcome

- ✅ Impact: Created production-ready implementation plan for backend Task Management API. Defined complete architecture spanning 5 phases (Research, Design, Tasks, Implementation, Deployment). Resolved 11 technical unknowns with documented decisions. Established layered architecture with clear separation of concerns (routes, services, models, utils).
- 🧪 Tests: Constitution Check: PASS. All principles either satisfied (tech stack, JWT, stateless) or deferred per roadmap (Kafka/Dapr, AI chatbot). Technical research: 11/11 decisions documented with rationale. Data model: 13 fields validated against 41 functional requirements. API contracts: 7 endpoints mapped to 5 user stories.
- 📁 Files: 5 planning artifacts created - plan.md (573 lines, comprehensive architecture), research.md (11 technology decisions), data-model.md (database schema + indexes), contracts/api-endpoints.md (REST API spec), quickstart.md (developer onboarding guide)
- 🔁 Next prompts: (1) `/sp.tasks` to decompose plan into 80-110 atomic implementation tasks organized by user story priority, (2) `/sp.implement` to execute MVP (US1: Core CRUD), (3) Incremental deployments for US2-US5 (Organization, Discovery, Scheduling, Recurring)
- 🧠 Reflection: Successfully balanced technical depth with implementation practicality. Key architectural wins: (1) JSONB for tags avoids unnecessary joins while maintaining query flexibility, (2) iCalendar RRULE provides future-proof recurrence support, (3) Layered structure enables independent testing and horizontal scaling. User-requested features all addressed: backend/ directory structure ✓, Neon MCP integration ✓, JSONB tags ✓, complex query parameters ✓, RRULE-based recurrence ✓, JWT user_id extraction ✓. Risk mitigation: Identified 7 risks with specific mitigation strategies (JWT secret rotation, connection pooling, RRULE validation, user isolation enforcement).

## Evaluation notes (flywheel)

- Failure modes observed: None. All planning phases completed successfully. Neon MCP tool integration documented in research.md and quickstart.md. User-requested Postgres JSONB for tags (vs separate table) confirmed and implemented in data-model.md with GIN indexing strategy.
- Graders run and results (PASS/FAIL): Constitution Check: PASS (6/7 principles satisfied, 1 deferred). Technical Context: PASS (no NEEDS CLARIFICATION markers). Research Depth: PASS (11 decisions with rationale + alternatives). Data Model Completeness: PASS (13 fields, 5 indexes, 3 constraints, validation rules mapped to FRs). API Contract Clarity: PASS (7 endpoints, authentication flow, query parameters, error handling). Project Structure: PASS (layered architecture with clear file responsibilities).
- Prompt variant (if applicable): User-enhanced prompt with specific architectural requirements (backend/ structure, Neon MCP, JSONB tags, query parameters, RRULE recurrence, JWT dependency). This additional context enabled immediate technical decisions without requiring clarification questions.
- Next experiment (smallest change to try): Execute `/sp.tasks` to validate decomposition strategy. Expected output: 80-110 atomic tasks organized by 10 phases (Setup, Database, Auth, Core CRUD, Organization, Discovery, Scheduling, Recurring, Testing, Documentation). Critical path validation: Ensure MVP (US1: Core CRUD) can be delivered independently without blocking on advanced features (US2-US5). If task count exceeds 110, consider consolidating test tasks or deferring non-critical polish tasks to Phase 7.
