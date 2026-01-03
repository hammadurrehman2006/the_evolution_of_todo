# API Endpoints: Backend Task Management API

**Feature**: Backend Task Management API
**Date**: 2026-01-02
**Purpose**: Define REST API endpoint contracts, request/response schemas, and error handling

---

## Base URL

```
Development: http://localhost:8000
Production: https://api.yourdomain.com
```

---

## Authentication

All endpoints (except `/health`) require JWT Bearer token authentication.

**Header Format:**
```http
Authorization: Bearer <jwt_token>
```

**Authentication Flow:**
1. Client obtains JWT token from external auth system (Better Auth, etc.)
2. Client includes token in `Authorization` header for all API requests
3. API validates token signature and expiration
4. API extracts `user_id` from token payload (claim: `sub` or `user_id`)
5. All database queries filtered by `user_id` for strict user isolation

---

## Endpoints Overview

| Method | Endpoint | Description | User Story |
|--------|----------|-------------|------------|
| GET | `/health` | Health check (no auth required) | - |
| POST | `/tasks` | Create a new task | US1 (P1) |
| GET | `/tasks` | List tasks with filters/search/sort | US1 (P1), US3 (P3) |
| GET | `/tasks/{task_id}` | Get single task by ID | US1 (P1) |
| PUT | `/tasks/{task_id}` | Update task fields | US1 (P1), US2 (P2) |
| DELETE | `/tasks/{task_id}` | Delete task permanently | US1 (P1) |
| POST | `/tasks/{task_id}/toggle` | Toggle completion status | US1 (P1), US5 (P5) |

---

## 1. Health Check

### `GET /health`

**Purpose**: Check API availability (no authentication required).

**Request:**
```http
GET /health HTTP/1.1
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-02T12:34:56Z",
  "version": "1.0.0"
}
```

**Use Case**: Load balancer health checks, monitoring systems.

---

## 2. Create Task

### `POST /tasks`

**Purpose**: Create a new task for the authenticated user (US1 - P1).

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "priority": "High",
  "tags": ["Home", "Urgent"],
  "due_date": "2026-01-10T17:00:00Z",
  "reminder_at": "2026-01-10T16:00:00Z",
  "is_recurring": false,
  "recurrence_rule": null
}
```

**Field Validation:**
- `title`: Required, 1-200 characters (FR-035)
- `description`: Optional, max 2000 characters (FR-036)
- `priority`: Optional, one of "High", "Medium", "Low" (case-insensitive) (FR-037)
- `tags`: Optional, array of strings (FR-009)
- `due_date`: Optional, ISO 8601 datetime (FR-038)
- `reminder_at`: Optional, ISO 8601 datetime, must be ≤ due_date (FR-024, FR-038)
- `is_recurring`: Optional, boolean, default false (FR-025)
- `recurrence_rule`: Optional, iCalendar RRULE format (FR-026)

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-123",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "priority": "High",
  "tags": ["Home", "Urgent"],
  "due_date": "2026-01-10T17:00:00Z",
  "reminder_at": "2026-01-10T16:00:00Z",
  "is_recurring": false,
  "recurrence_rule": null,
  "created_at": "2026-01-02T12:34:56Z",
  "updated_at": "2026-01-02T12:34:56Z"
}
```

**Error Responses:**

**400 Bad Request** (Validation error):
```json
{
  "error": "Validation Error",
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ],
  "message": "Invalid request parameters"
}
```

**401 Unauthorized** (Invalid/missing JWT):
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

---

## 3. List Tasks

### `GET /tasks`

**Purpose**: Retrieve all tasks for authenticated user with filtering, searching, sorting, and pagination (US1, US3).

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `q` | string | No | Keyword search (title/description) | `?q=groceries` |
| `status` | boolean | No | Filter by completion (true=completed) | `?status=false` |
| `priority` | string | No | Filter by priority (High, Medium, Low) | `?priority=High` |
| `tags` | array | No | Filter by tags (comma-separated) | `?tags=Work,Urgent` |
| `due_date_from` | datetime | No | Filter tasks due after this date | `?due_date_from=2026-01-01` |
| `due_date_to` | datetime | No | Filter tasks due before this date | `?due_date_to=2026-01-31` |
| `sort_by` | string | No | Sort field (due_date, title, priority) | `?sort_by=due_date` |
| `sort_order` | string | No | Sort order (asc, desc) | `?sort_order=asc` |
| `limit` | integer | No | Page size (default 50, max 100) | `?limit=20` |
| `offset` | integer | No | Pagination offset (default 0) | `?offset=40` |

**Example Request:**
```http
GET /tasks?q=meeting&status=false&priority=High&sort_by=due_date&sort_order=asc&limit=20&offset=0 HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user-123",
      "title": "Prepare meeting slides",
      "description": "Q1 review presentation",
      "completed": false,
      "priority": "High",
      "tags": ["Work", "Urgent"],
      "due_date": "2026-01-05T10:00:00Z",
      "reminder_at": "2026-01-05T09:00:00Z",
      "is_recurring": false,
      "recurrence_rule": null,
      "created_at": "2026-01-01T12:00:00Z",
      "updated_at": "2026-01-01T12:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

**Empty Result (200 OK):**
```json
{
  "items": [],
  "total": 0,
  "limit": 50,
  "offset": 0
}
```

**Functional Requirements Mapping:**
- FR-012: Keyword search via `q` parameter
- FR-013: Status filtering via `status` parameter
- FR-014: Priority filtering via `priority` parameter
- FR-015: Date range filtering via `due_date_from` and `due_date_to`
- FR-016: Tag filtering via `tags` parameter
- FR-017: Combined filters (all parameters can be used together)
- FR-018: Sort by due_date via `sort_by=due_date`
- FR-019: Sort by title via `sort_by=title`
- FR-020: Sort by priority via `sort_by=priority`
- FR-021: Pagination via `limit` and `offset`

---

## 4. Get Single Task

### `GET /tasks/{task_id}`

**Purpose**: Retrieve a specific task by ID (US1 - P1).

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `task_id`: UUID of the task

**Example Request:**
```http
GET /tasks/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-123",
  "title": "Buy groceries",
  "description": "Milk, bread, eggs",
  "completed": false,
  "priority": "High",
  "tags": ["Home", "Urgent"],
  "due_date": "2026-01-10T17:00:00Z",
  "reminder_at": "2026-01-10T16:00:00Z",
  "is_recurring": false,
  "recurrence_rule": null,
  "created_at": "2026-01-02T12:34:56Z",
  "updated_at": "2026-01-02T12:34:56Z"
}
```

**Error Responses:**

**404 Not Found** (Task doesn't exist or doesn't belong to user):
```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

**Note**: Returns 404 (not 403) to prevent information leakage (FR-034).

---

## 5. Update Task

### `PUT /tasks/{task_id}`

**Purpose**: Update one or more fields of an existing task (US1, US2 - P1, P2).

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
- `task_id`: UUID of the task

**Request Body** (all fields optional):
```json
{
  "title": "Buy groceries and fruits",
  "description": "Milk, bread, eggs, apples, bananas",
  "priority": "Medium",
  "tags": ["Home", "Weekend"],
  "due_date": "2026-01-15T17:00:00Z",
  "reminder_at": "2026-01-15T16:00:00Z",
  "is_recurring": true,
  "recurrence_rule": "FREQ=WEEKLY"
}
```

**Field Validation:**
- Same validation rules as create task
- All fields optional (partial update supported)
- `completed` field cannot be updated via this endpoint (use toggle endpoint instead)

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-123",
  "title": "Buy groceries and fruits",
  "description": "Milk, bread, eggs, apples, bananas",
  "completed": false,
  "priority": "Medium",
  "tags": ["Home", "Weekend"],
  "due_date": "2026-01-15T17:00:00Z",
  "reminder_at": "2026-01-15T16:00:00Z",
  "is_recurring": true,
  "recurrence_rule": "FREQ=WEEKLY",
  "created_at": "2026-01-02T12:34:56Z",
  "updated_at": "2026-01-02T14:22:10Z"
}
```

**Error Responses:**

**400 Bad Request** (Validation error):
```json
{
  "error": "Validation Error",
  "detail": [
    {
      "loc": ["body", "reminder_at"],
      "msg": "reminder_at must be before or equal to due_date",
      "type": "value_error"
    }
  ],
  "message": "Invalid request parameters"
}
```

**404 Not Found** (Task doesn't exist or doesn't belong to user):
```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

---

## 6. Delete Task

### `DELETE /tasks/{task_id}`

**Purpose**: Permanently delete a task (US1 - P1).

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `task_id`: UUID of the task

**Example Request:**
```http
DELETE /tasks/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer <jwt_token>
```

**Response (204 No Content):**
```
(empty response body)
```

**Error Responses:**

**404 Not Found** (Task doesn't exist or doesn't belong to user):
```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

---

## 7. Toggle Task Completion

### `POST /tasks/{task_id}/toggle`

**Purpose**: Toggle task completion status between completed and incomplete. If task is recurring, create new instance (US1, US5 - P1, P5).

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
- `task_id`: UUID of the task

**Request Body:**
```json
{}
```
(empty body)

**Example Request:**
```http
POST /tasks/550e8400-e29b-41d4-a716-446655440000/toggle HTTP/1.1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{}
```

**Response (200 OK) - Non-Recurring Task:**
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123",
    "title": "Buy groceries",
    "description": "Milk, bread, eggs",
    "completed": true,
    "priority": "High",
    "tags": ["Home", "Urgent"],
    "due_date": "2026-01-10T17:00:00Z",
    "reminder_at": "2026-01-10T16:00:00Z",
    "is_recurring": false,
    "recurrence_rule": null,
    "created_at": "2026-01-02T12:34:56Z",
    "updated_at": "2026-01-02T14:30:00Z"
  },
  "new_task": null
}
```

**Response (200 OK) - Recurring Task Completed:**
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123",
    "title": "Water plants",
    "description": "All indoor plants",
    "completed": true,
    "priority": "Medium",
    "tags": ["Home"],
    "due_date": "2026-01-10T10:00:00Z",
    "reminder_at": "2026-01-10T09:00:00Z",
    "is_recurring": true,
    "recurrence_rule": "FREQ=WEEKLY",
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-01-10T10:05:00Z"
  },
  "new_task": {
    "id": "660e9511-f30c-52e5-b827-557766551111",
    "user_id": "user-123",
    "title": "Water plants",
    "description": "All indoor plants",
    "completed": false,
    "priority": "Medium",
    "tags": ["Home"],
    "due_date": "2026-01-17T10:00:00Z",
    "reminder_at": "2026-01-17T09:00:00Z",
    "is_recurring": true,
    "recurrence_rule": "FREQ=WEEKLY",
    "created_at": "2026-01-10T10:05:00Z",
    "updated_at": "2026-01-10T10:05:00Z"
  }
}
```

**Functional Requirements Mapping:**
- FR-007: Toggle completion status
- FR-027: Auto-create new task instance for recurring tasks
- FR-028: Preserve task properties in new instance

**Error Responses:**

**404 Not Found** (Task doesn't exist or doesn't belong to user):
```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

---

## Common Error Responses

### 400 Bad Request
**Cause**: Validation errors, malformed request body, invalid query parameters.

```json
{
  "error": "Validation Error",
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    }
  ],
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
**Cause**: Missing, invalid, or expired JWT token.

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 404 Not Found
**Cause**: Resource doesn't exist or doesn't belong to authenticated user.

```json
{
  "error": "Not Found",
  "message": "Task not found"
}
```

**Note**: Always return 404 (not 403) for user isolation violations to prevent information leakage (FR-034).

### 500 Internal Server Error
**Cause**: Unexpected system failures.

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

**Note**: Only returned for unexpected failures, never for validation or business logic errors (FR-041).

---

## HTTP Status Code Summary

| Status Code | Usage |
|-------------|-------|
| 200 OK | Successful GET, PUT, POST (toggle) |
| 201 Created | Successful POST (create task) |
| 204 No Content | Successful DELETE |
| 400 Bad Request | Validation errors, malformed input |
| 401 Unauthorized | Authentication failures |
| 404 Not Found | Resource not found or access denied (user isolation) |
| 500 Internal Server Error | Unexpected system failures only |

---

## CORS Configuration

**Allowed Origins**:
```
Development: http://localhost:3000
Production: https://yourdomain.com
```

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers**: Authorization, Content-Type

**Exposed Headers**: Content-Length, X-Request-ID

---

## Rate Limiting (Future)

**Note**: Rate limiting is currently out of scope (spec.md). Future implementation may include:
- 100 requests per minute per user
- 1000 requests per hour per user
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Summary

**Total Endpoints**: 7 (1 public, 6 authenticated)
**Authentication**: JWT Bearer token (all endpoints except /health)
**User Isolation**: Enforced via `user_id` from JWT token (FR-032, FR-033)
**Error Handling**: Standardized JSON format with HTTP status codes (FR-039, FR-040, FR-041)
**Performance**: Pagination required for large result sets (FR-021)

All API contracts align with functional requirements (FR-001 through FR-041) and user stories (US1-US5) from spec.md.
