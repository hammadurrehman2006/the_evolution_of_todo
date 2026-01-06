# Feature Specification: Backend Task Management API

**Feature Branch**: `004-backend-task-api`
**Created**: 2026-01-02
**Status**: Draft
**Input**: User description: "Create a comprehensive backend specification file for a robust REST API using Python FastAPI, SQLModel, and Neon Serverless PostgreSQL. The API must support: Core CRUD operations (Add, Update, Delete, View, Toggle Completion), Organization features (Priorities: High/Medium/Low, Tags/Categories), Discovery features (Advanced Search by keyword, Filtering by status/priority/date, Sorting by due date/alphabetical/priority), Advanced Scheduling (Recurring Tasks with auto-reschedule logic, Due Dates/Time Reminders). The Task model must include: title, description, status, priority, tags, due_date, reminder_at, is_recurring, recurrence_rule, and a strict user_id field for multi-tenancy. All endpoints must accept and parse JWT Bearer Tokens to extract user_id for security."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Task Management (Priority: P1)

A user needs to manage their daily tasks by creating, viewing, updating, and deleting tasks. Each task has a title, description, and completion status. Users can mark tasks as complete or incomplete to track their progress.

**Why this priority**: This is the core MVP functionality. Without basic CRUD operations, no other features can provide value. This establishes the foundation for all task management capabilities.

**Independent Test**: Can be fully tested by authenticating a user, creating multiple tasks with various titles and descriptions, viewing the task list, updating task details, toggling completion status, and deleting tasks. Delivers immediate value as a functional task list.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** they create a new task with title "Buy groceries" and description "Milk, bread, eggs", **Then** the task is saved with a unique ID and returned with all provided details
2. **Given** a user has created tasks, **When** they request their task list, **Then** only their own tasks are returned (strict user isolation via user_id)
3. **Given** a user has a task with ID 123, **When** they update the title to "Buy groceries and fruits", **Then** the task is updated and the new title is reflected
4. **Given** a user has an incomplete task, **When** they toggle its completion status, **Then** the task is marked as complete
5. **Given** a user has a task with ID 456, **When** they delete it, **Then** the task is permanently removed and no longer appears in their task list

---

### User Story 2 - Task Organization with Priorities and Tags (Priority: P2)

A user needs to organize their tasks by assigning priorities (High, Medium, Low) and categorizing them with tags (e.g., "Work", "Home", "Personal", "Urgent"). This helps users focus on what matters most and filter tasks by context.

**Why this priority**: Enhances the basic task list by adding organization capabilities. Users can prioritize their workload and categorize tasks by context, significantly improving productivity. Builds on US1 without requiring it to change.

**Independent Test**: Can be tested by creating tasks with different priority levels and multiple tags, then verifying that tasks display their assigned priorities and tags correctly. Delivers value by enabling users to organize their workload.

**Acceptance Scenarios**:

1. **Given** a user creates a task, **When** they assign priority "High", **Then** the task is saved with priority set to "High"
2. **Given** a user creates a task, **When** they add tags ["Work", "Urgent"], **Then** the task is saved with both tags associated
3. **Given** a user has tasks with mixed priorities, **When** they view their task list, **Then** tasks display their assigned priority level
4. **Given** a user updates a task, **When** they change priority from "Low" to "High", **Then** the priority is updated successfully
5. **Given** a user has a task with tags ["Home", "Personal"], **When** they update it to add "Weekend" tag, **Then** the task now has three tags

---

### User Story 3 - Advanced Task Discovery (Priority: P3)

A user needs to find specific tasks quickly using search, filtering, and sorting capabilities. They can search by keyword (matching title or description), filter by status (complete/incomplete), priority level, or date ranges, and sort results by due date, alphabetically, or priority.

**Why this priority**: As task lists grow, discovery becomes critical. Users need efficient ways to locate tasks without scrolling through long lists. This enhances usability for power users managing many tasks.

**Independent Test**: Can be tested by creating a diverse set of tasks (various statuses, priorities, keywords) and verifying that search returns matching tasks, filters correctly narrow results, and sorting orders tasks as expected. Delivers value by making task management scalable.

**Acceptance Scenarios**:

1. **Given** a user has tasks with titles containing "meeting", **When** they search for "meeting", **Then** all tasks with "meeting" in title or description are returned
2. **Given** a user has both complete and incomplete tasks, **When** they filter by status "incomplete", **Then** only incomplete tasks are returned
3. **Given** a user has tasks with mixed priorities, **When** they filter by priority "High", **Then** only high-priority tasks are returned
4. **Given** a user has tasks with various due dates, **When** they sort by due date ascending, **Then** tasks are ordered from earliest to latest due date
5. **Given** a user applies multiple filters (status: incomplete, priority: High), **When** they request tasks, **Then** only tasks matching ALL criteria are returned
6. **Given** a user searches for "groceries" and sorts by priority, **When** results are returned, **Then** matching tasks are sorted by priority (High → Medium → Low)

---

### User Story 4 - Due Dates and Reminders (Priority: P4)

A user needs to assign due dates and set reminder times for their tasks. The system tracks when tasks are due and when reminders should be triggered, enabling time-based task management and proactive notifications.

**Why this priority**: Adds temporal awareness to task management. Users can plan ahead and receive timely reminders, preventing missed deadlines. This is a key feature for productivity applications.

**Independent Test**: Can be tested by creating tasks with specific due dates and reminder times, verifying the data is stored correctly, and that tasks can be filtered by date ranges. Delivers value by enabling deadline management.

**Acceptance Scenarios**:

1. **Given** a user creates a task, **When** they set due_date to "2026-01-10T17:00:00Z", **Then** the task is saved with that due date
2. **Given** a user creates a task with a due date, **When** they set reminder_at to "2026-01-10T16:00:00Z" (1 hour before), **Then** the reminder time is stored
3. **Given** a user has tasks with various due dates, **When** they filter by date range "2026-01-05 to 2026-01-15", **Then** only tasks with due dates in that range are returned
4. **Given** a user updates a task, **When** they change the due date from "2026-01-10" to "2026-01-15", **Then** the due date is updated
5. **Given** a user has overdue tasks (due_date in the past and status incomplete), **When** they view their task list, **Then** overdue tasks can be identified by comparing due_date with current timestamp

---

### User Story 5 - Recurring Tasks (Priority: P5)

A user needs to create recurring tasks that automatically reschedule after completion. For example, "Pay rent" recurs monthly, "Water plants" recurs weekly. The system maintains recurrence rules and creates new task instances based on the schedule.

**Why this priority**: Automates repetitive task management. Users don't need to manually recreate recurring tasks, reducing friction for routine activities. This is advanced functionality that builds on all previous stories.

**Independent Test**: Can be tested by creating a task with is_recurring=true and a recurrence_rule (e.g., "FREQ=WEEKLY"), verifying the rule is stored, and that when the task is completed, it reschedules according to the rule. Delivers value by automating repetitive task creation.

**Acceptance Scenarios**:

1. **Given** a user creates a task, **When** they set is_recurring to true and recurrence_rule to "FREQ=DAILY", **Then** the task is saved as a recurring task with daily frequency
2. **Given** a user has a recurring task with rule "FREQ=WEEKLY", **When** they complete it, **Then** a new instance is created with due_date advanced by 7 days
3. **Given** a user creates a recurring task due "2026-01-10" with "FREQ=MONTHLY", **When** they complete it on 2026-01-10, **Then** the next instance has due_date "2026-02-10"
4. **Given** a user has a recurring task, **When** they update the recurrence_rule from "FREQ=WEEKLY" to "FREQ=MONTHLY", **Then** future instances follow the new monthly schedule
5. **Given** a user has a recurring task, **When** they set is_recurring to false, **Then** the task becomes non-recurring and does not auto-reschedule after completion

---

### Edge Cases

- **Empty task lists**: What happens when a user has no tasks and requests their task list? (Return empty array with 200 OK)
- **Invalid JWT tokens**: How does the system handle expired, malformed, or missing tokens? (Return 401 Unauthorized with clear error message)
- **User isolation breach attempts**: What happens if a user tries to access another user's task by guessing IDs? (Return 404 Not Found to prevent information leakage)
- **Invalid priority values**: How does the system handle priority values outside "High", "Medium", "Low"? (Return 400 Bad Request with validation error)
- **Duplicate tags**: What happens when a user assigns the same tag multiple times to a task? (De-duplicate tags automatically)
- **Invalid date formats**: How does the system handle malformed due_date or reminder_at values? (Return 400 Bad Request with clear validation message)
- **Past due dates**: Can users create tasks with due dates in the past? (Yes, allowed for historical tracking)
- **Reminder after due date**: What happens if reminder_at is set after due_date? (Return 400 Bad Request - reminder must be before or equal to due date)
- **Invalid recurrence rules**: How does the system handle malformed recurrence_rule strings? (Return 400 Bad Request with format guidance)
- **Concurrent updates**: What happens when two requests try to update the same task simultaneously? (Use database optimistic locking or last-write-wins with timestamps)
- **Large text fields**: What happens when title exceeds 200 characters or description exceeds 2000 characters? (Return 400 Bad Request with field length limits)
- **SQL injection attempts**: How does the system protect against malicious input in search queries? (Use parameterized queries via SQLModel)
- **Performance with large datasets**: How does the system handle users with 10,000+ tasks? (Implement pagination with limit/offset parameters)

## Requirements *(mandatory)*

### Functional Requirements

#### Core CRUD Operations

- **FR-001**: System MUST allow authenticated users to create new tasks with title (required, 1-200 characters) and description (optional, max 2000 characters)
- **FR-002**: System MUST assign a unique task ID to each created task and associate it with the authenticated user's user_id
- **FR-003**: System MUST allow users to retrieve all their tasks via a list endpoint that returns only tasks belonging to the authenticated user (strict user isolation)
- **FR-004**: System MUST allow users to retrieve a specific task by ID if and only if it belongs to the authenticated user
- **FR-005**: System MUST allow users to update any field of their tasks (title, description, status, priority, tags, due_date, reminder_at, is_recurring, recurrence_rule)
- **FR-006**: System MUST allow users to delete their tasks permanently
- **FR-007**: System MUST allow users to toggle task completion status between "complete" and "incomplete"

#### Organization Features

- **FR-008**: System MUST support priority levels: "High", "Medium", "Low" (case-insensitive, stored in normalized form)
- **FR-009**: System MUST allow tasks to have zero or more tags (e.g., "Work", "Home", "Personal")
- **FR-010**: System MUST store tags as a collection associated with each task, allowing multi-valued tags
- **FR-011**: System MUST de-duplicate tags automatically (e.g., adding "Work" twice results in one "Work" tag)

#### Discovery Features

- **FR-012**: System MUST support keyword search that matches against task title and description (case-insensitive)
- **FR-013**: System MUST support filtering by status (complete, incomplete)
- **FR-014**: System MUST support filtering by priority level (High, Medium, Low)
- **FR-015**: System MUST support filtering by date range (tasks with due_date between start_date and end_date)
- **FR-016**: System MUST support filtering by tags (return tasks that have any of the specified tags)
- **FR-017**: System MUST support combining multiple filters (e.g., status=incomplete AND priority=High AND tag=Work)
- **FR-018**: System MUST support sorting by due_date (ascending/descending)
- **FR-019**: System MUST support sorting alphabetically by title (ascending/descending)
- **FR-020**: System MUST support sorting by priority (High → Medium → Low or reverse)
- **FR-021**: System MUST support pagination with limit (default 50, max 100) and offset parameters

#### Advanced Scheduling

- **FR-022**: System MUST allow tasks to have an optional due_date field (ISO 8601 datetime format)
- **FR-023**: System MUST allow tasks to have an optional reminder_at field (ISO 8601 datetime format)
- **FR-024**: System MUST validate that reminder_at, if provided, is before or equal to due_date
- **FR-025**: System MUST allow tasks to be marked as recurring via is_recurring boolean field
- **FR-026**: System MUST store recurrence rules in recurrence_rule field using iCalendar RRULE format (e.g., "FREQ=DAILY", "FREQ=WEEKLY;INTERVAL=2", "FREQ=MONTHLY")
- **FR-027**: System MUST automatically create a new task instance when a recurring task is marked complete, advancing the due_date according to the recurrence_rule
- **FR-028**: System MUST preserve all other task properties (title, description, priority, tags) when creating new recurring instances

#### Security & Multi-Tenancy

- **FR-029**: System MUST require a valid JWT Bearer Token on all endpoints (except health checks)
- **FR-030**: System MUST extract user_id from the JWT token's payload (expected claim name: "sub" or "user_id")
- **FR-031**: System MUST reject requests with missing, expired, or invalid JWT tokens with HTTP 401 Unauthorized
- **FR-032**: System MUST enforce strict user isolation: users can only access, modify, or delete their own tasks
- **FR-033**: System MUST prevent user ID tampering by deriving user_id exclusively from the validated JWT token, never from request body or query parameters
- **FR-034**: System MUST return HTTP 404 Not Found (not 403 Forbidden) when a user attempts to access another user's task to prevent information leakage

#### Data Validation & Error Handling

- **FR-035**: System MUST validate task title is not empty and does not exceed 200 characters
- **FR-036**: System MUST validate task description does not exceed 2000 characters if provided
- **FR-037**: System MUST validate priority is one of: "High", "Medium", "Low" (case-insensitive)
- **FR-038**: System MUST validate due_date and reminder_at are valid ISO 8601 datetime strings if provided
- **FR-039**: System MUST return HTTP 400 Bad Request with descriptive error messages for validation failures
- **FR-040**: System MUST return HTTP 404 Not Found when a task ID does not exist or does not belong to the user
- **FR-041**: System MUST return HTTP 500 Internal Server Error only for unexpected system failures, never for validation or business logic errors

### Key Entities *(include if feature involves data)*

- **Task**: Represents a single task or to-do item. Core attributes: title (string, required), description (string, optional), status (boolean or enum: complete/incomplete), priority (enum: High/Medium/Low), tags (array of strings), due_date (datetime, optional), reminder_at (datetime, optional), is_recurring (boolean), recurrence_rule (string, iCalendar RRULE format), user_id (string/UUID, required for multi-tenancy), created_at (datetime, auto-generated), updated_at (datetime, auto-updated)

- **User**: Represents a user of the system. Referenced by user_id in JWT token. The user entity itself is managed by the authentication system (not part of this API), but user_id is the foreign key that links tasks to users

- **Tag**: A categorical label applied to tasks (e.g., "Work", "Home"). Stored as strings in a collection/array field on the Task entity. No separate Tag entity required unless tag usage statistics are needed later

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new task and receive confirmation in under 500ms for 95% of requests
- **SC-002**: Users can retrieve their task list (up to 100 tasks) in under 1 second for 99% of requests
- **SC-003**: System supports 1,000 concurrent users performing CRUD operations without degradation
- **SC-004**: Search and filter operations return results in under 2 seconds for task lists up to 10,000 items
- **SC-005**: 100% of API endpoints enforce JWT authentication and user isolation (no unauthorized data access)
- **SC-006**: API returns clear, actionable error messages for 100% of validation failures (no generic "Bad Request" without details)
- **SC-007**: Recurring task rescheduling logic executes correctly in 100% of cases (new instance created with correct due_date)
- **SC-008**: Zero instances of user data leakage (users cannot access other users' tasks under any circumstances)
- **SC-009**: API achieves 99.9% uptime during business hours
- **SC-010**: All API responses include appropriate HTTP status codes per REST best practices

## Assumptions

1. **JWT Token Format**: Assumed JWT tokens follow standard format with user_id in "sub" or "user_id" claim. If different, configuration for claim name will be needed.

2. **Authentication Provider**: Assumed JWT tokens are issued by an external authentication system (e.g., Better Auth, Auth0). Token validation uses shared secret or public key provided via environment variable.

3. **Database Schema**: Assumed Neon PostgreSQL is provisioned and accessible. Connection string provided via environment variable (DATABASE_URL).

4. **Recurrence Rule Format**: Assumed recurrence_rule follows iCalendar RRULE format. Parsing and date calculation will use standard library (e.g., python-dateutil).

5. **Tag Storage**: Assumed tags are stored as JSON array in PostgreSQL (JSONB column) or as a separate junction table. Implementation detail deferred to planning phase.

6. **Pagination Defaults**: Assumed default page size of 50 tasks, maximum 100 per request to prevent performance issues.

7. **Timezone Handling**: Assumed all timestamps (due_date, reminder_at) are stored in UTC. Client applications handle timezone conversion.

8. **Task Deletion**: Assumed hard delete (permanent removal). Soft delete (marking as deleted) not required unless specified later.

9. **Concurrent Updates**: Assumed database handles concurrent modifications. If conflicts occur, last-write-wins with updated_at timestamp.

10. **API Versioning**: Assumed API is unversioned initially (no /v1/ prefix). Versioning strategy deferred until breaking changes are anticipated.

## Dependencies

- **External Authentication System**: JWT token issuer must be operational and accessible for token validation
- **Neon PostgreSQL Database**: Database instance must be provisioned, accessible, and connection string provided
- **Frontend Application**: Assumes a frontend (Next.js app from phase-2) will consume this API and pass JWT tokens in Authorization headers
- **Environment Configuration**: Requires environment variables for DATABASE_URL, JWT_SECRET (or JWT_PUBLIC_KEY), and optionally JWT_ALGORITHM

## Out of Scope

- **User Management**: User registration, login, password reset are NOT part of this API (handled by external auth system)
- **Real-time Notifications**: Reminder notifications are NOT triggered by this API (data is stored for external notification service to consume)
- **Task Sharing**: Multi-user task collaboration, sharing, or team features are NOT included
- **Task Comments**: Commenting or discussion features on tasks are NOT included
- **File Attachments**: Uploading files or images to tasks is NOT included
- **Task Templates**: Pre-defined task templates or quick-add features are NOT included
- **Analytics**: Usage statistics, reporting, or analytics dashboards are NOT included
- **Rate Limiting**: API rate limiting per user is NOT included (can be added later)
- **Bulk Operations**: Bulk task creation, updates, or deletes are NOT included (operate on single tasks only)
- **Audit Logging**: Detailed change history or audit trails are NOT included (only created_at/updated_at timestamps)

## Non-Functional Requirements

- **Performance**: API endpoints must respond within 2 seconds for 99% of requests under normal load
- **Scalability**: System must support horizontal scaling to handle increased user load
- **Security**: All data must be transmitted over HTTPS; JWT tokens must expire (recommended 1-24 hours)
- **Availability**: Target 99.9% uptime during business hours
- **Maintainability**: Code must follow Python PEP 8 style guide and include inline documentation
- **Observability**: API must log errors and include health check endpoint (/health or /api/health)
