---
description: "Atomic development tasks for Backend Task Management API"
---

# Tasks: Backend Task Management API

**Input**: Design documents from `/specs/004-backend-task-api/`
**Prerequisites**: plan.md (✅ COMPLETE), spec.md (✅ COMPLETE), research.md (✅ COMPLETE), data-model.md (✅ COMPLETE), contracts/ (✅ COMPLETE)

**Tests**: Tests are NOT explicitly requested in the spec, so test tasks are omitted. Focus on implementation and manual validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

This is a backend-only project following this structure:
```
backend/
├── main.py
├── config.py
├── database.py
├── models.py
├── schemas.py
├── dependencies.py
├── routes/
│   └── tasks.py
├── services/
│   ├── task_service.py
│   └── auth_service.py
└── utils/
    └── recurrence.py
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment setup

- [ ] T001 Create backend directory structure: backend/, backend/routes/, backend/services/, backend/utils/, backend/tests/
- [ ] T002 Initialize Python project with uv and create requirements.txt with FastAPI, SQLModel, asyncpg, PyJWT, python-dateutil, Pydantic Settings, Alembic dependencies
- [ ] T003 [P] Create .env file template with DATABASE_URL, JWT_SECRET, JWT_ALGORITHM, CORS_ORIGINS placeholders in backend/.env.example
- [ ] T004 [P] Create .gitignore file to exclude .env, __pycache__, .venv, *.pyc in backend/.gitignore

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Use Neon MCP tool (mcp__Neon__get_connection_string) to retrieve database connection string and populate .env file
- [ ] T006 [P] Implement environment configuration with Pydantic Settings in backend/config.py with fields: database_url, jwt_secret, jwt_algorithm, cors_origins
- [ ] T007 Implement database engine and session management with SQLModel in backend/database.py with create_db_and_tables() and get_session() functions
- [ ] T008 [P] Define PriorityEnum (High/Medium/Low) in backend/models.py
- [ ] T009 Create Task model in backend/models.py with all 13 fields: id (UUID), user_id, title, description, completed, priority, tags (JSONB), due_date, reminder_at, is_recurring, recurrence_rule, created_at, updated_at
- [ ] T010 Implement JWT authentication dependency in backend/dependencies.py with get_current_user() function that extracts user_id from Bearer token using PyJWT
- [ ] T011 Create Pydantic schemas in backend/schemas.py for TaskCreate, TaskUpdate, TaskResponse, TaskListResponse with validation rules (title 1-200 chars, description max 2000 chars, reminder_at <= due_date)
- [ ] T012 Create FastAPI application instance in backend/main.py with CORS middleware configuration and health check endpoint GET /health
- [ ] T013 Create tasks router in backend/routes/tasks.py with prefix="/tasks" and register it in main.py
- [ ] T014 Test database connection by running create_db_and_tables() and verifying tasks table exists in Neon PostgreSQL

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Task Management (Priority: P1) 🎯 MVP

**Goal**: Users can create, view, update, delete, and toggle completion status of tasks with strict user isolation

**Independent Test**: Authenticate a user, create tasks with various titles/descriptions, view task list (only user's tasks), update task details, toggle completion, delete tasks

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement POST /tasks endpoint in backend/routes/tasks.py to create new task with user_id from JWT, return 201 Created with task data
- [ ] T016 [P] [US1] Implement GET /tasks endpoint (basic version without filters) in backend/routes/tasks.py to list all tasks for authenticated user, return 200 OK with items array
- [ ] T017 [P] [US1] Implement GET /tasks/{task_id} endpoint in backend/routes/tasks.py to retrieve single task by ID with user isolation check, return 404 if not found or doesn't belong to user
- [ ] T018 [US1] Implement PUT /tasks/{task_id} endpoint in backend/routes/tasks.py to update task fields (partial updates supported), enforce user isolation, return 200 OK with updated task
- [ ] T019 [US1] Implement DELETE /tasks/{task_id} endpoint in backend/routes/tasks.py to permanently delete task with user isolation check, return 204 No Content
- [ ] T020 [US1] Implement POST /tasks/{task_id}/toggle endpoint (basic version without recurring logic) in backend/routes/tasks.py to toggle completion status, return 200 OK with updated task
- [ ] T021 [US1] Add custom exception handlers in backend/main.py for 400 Bad Request, 401 Unauthorized, 404 Not Found with standardized JSON error format
- [ ] T022 [US1] Manual validation: Create JWT test token, create/read/update/delete/toggle tasks via Swagger UI at http://localhost:8000/docs

**Checkpoint**: At this point, User Story 1 (Basic CRUD) should be fully functional and testable independently

---

## Phase 4: User Story 2 - Task Organization with Priorities and Tags (Priority: P2)

**Goal**: Users can assign priorities (High/Medium/Low) and tags to tasks for better organization

**Independent Test**: Create tasks with different priority levels and multiple tags, verify priorities and tags are stored and displayed correctly

### Implementation for User Story 2

- [ ] T023 [US2] Verify Task model priority field uses PriorityEnum (High/Medium/Low) with case-insensitive validation and default value Medium
- [ ] T024 [US2] Verify Task model tags field uses JSONB column in PostgreSQL with automatic de-duplication in backend/models.py
- [ ] T025 [US2] Update TaskCreate schema in backend/schemas.py to accept optional priority (string, case-insensitive) and tags (array of strings)
- [ ] T026 [US2] Update TaskUpdate schema in backend/schemas.py to allow updating priority and tags fields
- [ ] T027 [US2] Implement tag de-duplication logic in POST /tasks and PUT /tasks/{task_id} endpoints by converting tags to set before storage
- [ ] T028 [US2] Create database migration using Alembic to add GIN index on tags column for fast JSONB containment queries in backend/alembic/versions/
- [ ] T029 [US2] Manual validation: Create tasks with various priorities and tags, verify storage, update priorities/tags, confirm de-duplication works

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Advanced Task Discovery (Priority: P3)

**Goal**: Users can search, filter, and sort tasks by keyword, status, priority, tags, and date ranges

**Independent Test**: Create diverse tasks with various attributes, verify search returns matching tasks, filters correctly narrow results, sorting orders tasks as expected

### Implementation for User Story 3

- [ ] T030 [US3] Create TaskQueryParams Pydantic model in backend/schemas.py with fields: q (search), status (bool), priority (str), tags (list), due_date_from/to (datetime), sort_by (enum: due_date/title/priority), sort_order (enum: asc/desc), limit (default 50, max 100), offset (default 0)
- [ ] T031 [US3] Update GET /tasks endpoint in backend/routes/tasks.py to accept TaskQueryParams using Depends()
- [ ] T032 [US3] Implement keyword search logic in GET /tasks using SQLModel where() with Task.title.ilike() OR Task.description.ilike() for case-insensitive matching
- [ ] T033 [US3] Implement status filtering in GET /tasks using where(Task.completed == params.status) when status parameter is provided
- [ ] T034 [US3] Implement priority filtering in GET /tasks using where(Task.priority == params.priority.capitalize()) when priority parameter is provided
- [ ] T035 [US3] Implement tags filtering in GET /tasks using PostgreSQL JSONB @> operator: Task.tags.op('@>')(params.tags)
- [ ] T036 [US3] Implement date range filtering in GET /tasks using where(Task.due_date >= params.due_date_from) AND where(Task.due_date <= params.due_date_to)
- [ ] T037 [US3] Implement sorting logic in GET /tasks with order_by() for due_date (ascending/descending), title (alphabetical), priority (High=1, Medium=2, Low=3 using case())
- [ ] T038 [US3] Implement pagination in GET /tasks using limit() and offset(), return total count in TaskListResponse
- [ ] T039 [US3] Update TaskListResponse schema in backend/schemas.py to include items, total, limit, offset fields
- [ ] T040 [US3] Manual validation: Create 20+ tasks with varied attributes, test all filter combinations, verify search accuracy, confirm sorting and pagination work correctly

**Checkpoint**: All search, filter, and sort functionality should now work independently

---

## Phase 6: User Story 4 - Due Dates and Reminders (Priority: P4)

**Goal**: Users can assign due dates and reminder times to tasks with proper validation

**Independent Test**: Create tasks with specific due dates and reminder times, verify data is stored correctly, tasks can be filtered by date ranges

### Implementation for User Story 4

- [ ] T041 [US4] Verify Task model due_date and reminder_at fields accept optional datetime values in ISO 8601 format in backend/models.py
- [ ] T042 [US4] Add Pydantic validator to TaskCreate schema in backend/schemas.py to enforce reminder_at <= due_date constraint, raise 400 Bad Request if violated
- [ ] T043 [US4] Add Pydantic validator to TaskUpdate schema in backend/schemas.py to enforce reminder_at <= due_date constraint when either field is updated
- [ ] T044 [US4] Update POST /tasks endpoint to validate due_date and reminder_at fields using TaskCreate schema
- [ ] T045 [US4] Update PUT /tasks/{task_id} endpoint to validate due_date and reminder_at fields using TaskUpdate schema
- [ ] T046 [US4] Create database migration using Alembic to add partial index on due_date column (WHERE due_date IS NOT NULL) in backend/alembic/versions/
- [ ] T047 [US4] Manual validation: Create tasks with due dates and reminders, verify dates are stored in UTC, test date range filtering from US3, confirm validation rejects reminder_at > due_date

**Checkpoint**: Due date and reminder functionality should now be complete

---

## Phase 7: User Story 5 - Recurring Tasks (Priority: P5)

**Goal**: Users can create recurring tasks that automatically reschedule after completion using iCalendar RRULE format

**Independent Test**: Create a recurring task with a recurrence rule, complete it, verify a new instance is created with advanced due_date per the rule

### Implementation for User Story 5

- [ ] T048 [P] [US5] Implement RRULE parsing utility in backend/utils/recurrence.py with calculate_next_occurrence(current_due_date: datetime, rrule_string: str) -> datetime function using python-dateutil.rrule.rrulestr()
- [ ] T049 [P] [US5] Implement RRULE validation utility in backend/utils/recurrence.py with validate_rrule(rrule_string: str) -> bool function that attempts parsing and catches exceptions
- [ ] T050 [US5] Add Pydantic validator to TaskCreate schema in backend/schemas.py to validate recurrence_rule format using validate_rrule() when is_recurring=True
- [ ] T051 [US5] Add Pydantic validator to TaskCreate schema to enforce recurrence_rule is required when is_recurring=True, raise 400 Bad Request if missing
- [ ] T052 [US5] Create TaskService class in backend/services/task_service.py with create_recurring_instance(original_task: Task, session: Session) -> Task method
- [ ] T053 [US5] Implement create_recurring_instance() logic: parse RRULE, calculate next due_date, create new Task with same title/description/priority/tags, set completed=False, preserve is_recurring and recurrence_rule
- [ ] T054 [US5] Update POST /tasks/{task_id}/toggle endpoint in backend/routes/tasks.py to detect recurring tasks (is_recurring=True) and call TaskService.create_recurring_instance() when marking complete
- [ ] T055 [US5] Update toggle endpoint response format to return both original task (now completed) and new_task (next instance) in JSON: {"task": {...}, "new_task": {...}}
- [ ] T056 [US5] Handle edge case where reminder_at needs to be advanced for new recurring instance by same interval as due_date
- [ ] T057 [US5] Manual validation: Create recurring tasks with various RRULE formats (FREQ=DAILY, FREQ=WEEKLY, FREQ=MONTHLY), toggle completion, verify new instances are created with correct due_dates

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Database Migrations & Production Readiness

**Purpose**: Prepare database schema and production configuration

- [ ] T058 Initialize Alembic in backend/ directory with alembic init alembic command
- [ ] T059 Configure Alembic env.py to use settings.database_url and Task model metadata from backend/models.py
- [ ] T060 Generate initial migration with alembic revision --autogenerate -m "Initial schema with Task table and indexes"
- [ ] T061 [P] Review generated migration in backend/alembic/versions/ and verify all indexes, constraints, and fields are correct
- [ ] T062 Apply migration to Neon PostgreSQL with alembic upgrade head command
- [ ] T063 [P] Add database migration instructions to quickstart.md for production deployment
- [ ] T064 [P] Update main.py to remove create_db_and_tables() from startup event and add comment to use Alembic migrations instead

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T065 [P] Add structured logging with Python logging module in backend/main.py for all API requests (user_id, endpoint, status_code)
- [ ] T066 [P] Add error logging in exception handlers in backend/main.py to capture stack traces for 500 errors
- [ ] T067 [P] Update TaskResponse schema to ensure all datetime fields are serialized as ISO 8601 strings with timezone (UTC)
- [ ] T068 [P] Add request ID middleware in backend/main.py to generate unique request IDs for tracing
- [ ] T069 Verify all endpoints enforce user isolation: every database query filters by user_id from JWT token
- [ ] T070 Security audit: Verify no SQL injection vulnerabilities (SQLModel uses parameterized queries), no JWT secret in code (loaded from .env), HTTPS enforcement in production docs
- [ ] T071 Performance verification: Test GET /tasks with 1000+ tasks, confirm response time <2s, pagination limits prevent large result sets
- [ ] T072 [P] Update README.md with API overview, setup instructions, and link to quickstart.md
- [ ] T073 [P] Update quickstart.md with actual file paths and correct commands based on implementation
- [ ] T074 Run complete validation: Follow quickstart.md from scratch, verify all endpoints work, check Swagger docs at http://localhost:8000/docs
- [ ] T075 Create Dockerfile for containerized deployment with Python 3.11-slim base image, gunicorn + uvicorn workers
- [ ] T076 [P] Create docker-compose.yml for local development with backend service and Neon PostgreSQL connection
- [ ] T077 Final manual test: Create JWT token, test all 7 endpoints (health, create, list, get, update, delete, toggle) with various scenarios from spec.md acceptance criteria

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - Can proceed sequentially in priority order: US1 → US2 → US3 → US4 → US5
  - Or US1 (MVP) first, then US2-5 in parallel if team capacity allows
- **Database Migrations (Phase 8)**: Can start after US1 is complete, required before production deployment
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 models but independently testable
- **User Story 3 (P3)**: Depends on US1 (extends GET /tasks endpoint) - Builds on list functionality
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Adds date fields, independently testable
- **User Story 5 (P5)**: Depends on US1 (extends toggle endpoint) and US4 (uses due_date field) - Final advanced feature

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before validation
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks can run in parallel
- T001-T004 have no dependencies

**Phase 2 (Foundational)**: Some parallelizable
- T006 and T008 can run in parallel with T005
- T011 can start once T008-T009 complete

**Phase 3 (US1)**: Many endpoints parallelizable
- T015, T016, T017 can all start simultaneously (different endpoint handlers)
- T018, T019 can start after basic endpoints tested
- T020 depends on T015 (toggle needs create to test)

**Phase 4 (US2)**: Mostly sequential
- T023-T026 are verification/schema updates (quick)
- T028 migration can run parallel to manual testing

**Phase 5 (US3)**: Query logic is sequential
- T030-T031 first, then T032-T038 build on each other
- T040 is final validation

**Phase 6 (US4)**: Validation logic sequential
- T041-T045 sequential schema updates
- T046 migration can run parallel to testing

**Phase 7 (US5)**: Core logic parallelizable
- T048-T049 (utility functions) can run parallel
- T050-T051 (schema validators) can run parallel
- T052-T053 (service) depends on utils
- T054-T055 (endpoint) depends on service

**Phase 8 (Migrations)**: Mostly sequential
- T061 and T063-T064 can run parallel to migration application

**Phase 9 (Polish)**: Many tasks parallelizable
- T065-T068, T072-T073, T075-T076 all independent

---

## Parallel Example: User Story 1

```bash
# Launch multiple endpoint implementations in parallel (different files/functions):
Task T015: "Implement POST /tasks endpoint"
Task T016: "Implement GET /tasks endpoint"
Task T017: "Implement GET /tasks/{task_id} endpoint"

# Then in a second wave:
Task T018: "Implement PUT /tasks/{task_id} endpoint"
Task T019: "Implement DELETE /tasks/{task_id} endpoint"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only - Fastest Path to Value)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T014) - **CRITICAL GATE**
3. Complete Phase 3: User Story 1 (T015-T022)
4. **STOP and VALIDATE**: Test all CRUD operations independently
5. Deploy MVP to staging or demo environment

**Estimated Tasks for MVP**: 22 tasks (Setup + Foundational + US1)
**Value Delivered**: Full CRUD task management with user isolation

### Incremental Delivery (Add Features After MVP)

1. MVP (US1) deployed and validated ✅
2. Add User Story 2 (T023-T029) → Deploy → Demo (Priorities & Tags)
3. Add User Story 3 (T030-T040) → Deploy → Demo (Search & Filters)
4. Add User Story 4 (T041-T047) → Deploy → Demo (Due Dates)
5. Add User Story 5 (T048-T057) → Deploy → Demo (Recurring Tasks)
6. Complete Migrations (T058-T064) before final production deployment
7. Add Polish (T065-T077) for production readiness

Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. All complete Setup + Foundational together (T001-T014)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T015-T022) - Priority 1
   - **Developer B**: User Story 2 (T023-T029) after US1 endpoints exist
   - **Developer C**: Database migrations (T058-T064) after US1 complete
3. Sequential for complex stories:
   - US3 after US1 (extends list endpoint)
   - US5 after US1 + US4 (depends on toggle and due_date)

---

## Summary

**Total Tasks**: 77 atomic tasks
**MVP Tasks**: 22 (Setup + Foundational + US1)
**User Story Breakdown**:
- US1 (Basic CRUD): 8 tasks - **Highest Priority - MVP**
- US2 (Priorities & Tags): 7 tasks
- US3 (Search & Filters): 11 tasks
- US4 (Due Dates): 7 tasks
- US5 (Recurring Tasks): 10 tasks
- Migrations: 7 tasks
- Polish: 13 tasks

**Parallel Opportunities**: 28 tasks marked [P] can run in parallel with other tasks in same phase

**Independent Deliverables**:
- US1 alone = functional task management system (MVP)
- US1 + US2 = organized task management
- US1 + US2 + US3 = power user task management
- US1 + US2 + US3 + US4 = deadline-aware task management
- All stories = full-featured task management API

**Suggested MVP Scope**: Phases 1-3 only (T001-T022) for fastest time to value

---

## Notes

- [P] tasks = different files/functions, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Use Neon MCP tool for database setup (T005)
- JWT secret should be strong random value (generate with `openssl rand -hex 32`)
- All timestamps stored in UTC
- Swagger UI available at http://localhost:8000/docs for manual testing
