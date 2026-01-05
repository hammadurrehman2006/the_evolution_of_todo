# API Contracts: Hybrid Cloud Integration

**Feature**: 004-hybrid-cloud-integration
**Base URL**: `https://teot-phase2.vercel.app/`
**Date**: 2026-01-04
**Status**: Complete

## Overview

This document defines the REST API contract between the Next.js frontend and the FastAPI backend. All endpoints require JWT authentication via the `Authorization: Bearer <token>` header unless explicitly marked as public.

---

## Authentication

### Header Format

All authenticated requests must include:

```http
Authorization: Bearer <JWT_TOKEN>
```

**Example**:
```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMTIzNDU2IiwiZXhwIjoxNzA5NTYwMDAwfQ.signature
```

### JWT Token Claims

Minimum required claims:

```json
{
  "sub": "user-uuid-here" or "user_id": "user-uuid-here",
  "exp": 1709560000,
  "iat": 1709556400,
  "email": "user@example.com"
}
```

---

## Common Response Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid input data (validation error) |
| 401 | Unauthorized | Missing, expired, or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Optimistic locking failure or duplicate resource |
| 500 | Internal Server Error | Backend error (should be rare) |

---

## Endpoints

### 1. Health Check (Public)

**Purpose**: Verify API is operational

```http
GET /api/health
```

**Authentication**: None (public endpoint)

**Response** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2026-01-04T14:30:00Z",
  "version": "1.0.0"
}
```

---

### 2. Get All Todos

**Purpose**: Retrieve all todos for the authenticated user

```http
GET /api/todos
```

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `pageSize` | integer | No | Items per page (default: 50, max: 100) |
| `completed` | boolean | No | Filter by completion status |
| `priority` | string | No | Filter by priority: "low", "medium", "high" |
| `tags` | string | No | Comma-separated tag filter (AND logic) |
| `search` | string | No | Search in title and description |

**Example Request**:
```http
GET /api/todos?completed=false&priority=high&tags=work,urgent
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-uuid-123",
      "title": "Complete project documentation",
      "description": "Write API contracts and data model",
      "completed": false,
      "priority": "high",
      "tags": ["work", "urgent"],
      "dueDate": "2026-01-05T17:00:00Z",
      "recurring": null,
      "createdAt": "2026-01-04T10:00:00Z",
      "updatedAt": "2026-01-04T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pageSize": 50,
    "totalPages": 1
  }
}
```

**Error Responses**:
- **401**: Invalid or missing JWT token
- **500**: Database connection error

---

### 3. Get Single Todo

**Purpose**: Retrieve a specific todo by ID

```http
GET /api/todos/{id}
```

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Todo unique identifier |

**Example Request**:
```http
GET /api/todos/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-uuid-123",
    "title": "Complete project documentation",
    "description": "Write API contracts and data model",
    "completed": false,
    "priority": "high",
    "tags": ["work", "urgent"],
    "dueDate": "2026-01-05T17:00:00Z",
    "recurring": null,
    "createdAt": "2026-01-04T10:00:00Z",
    "updatedAt": "2026-01-04T14:30:00Z"
  }
}
```

**Error Responses**:
- **401**: Invalid or missing JWT token
- **403**: Todo belongs to another user
- **404**: Todo not found

---

### 4. Create Todo

**Purpose**: Create a new todo for the authenticated user

```http
POST /api/todos
```

**Authentication**: Required

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, bread, eggs, fruits",
  "priority": "medium",
  "tags": ["personal", "shopping"],
  "dueDate": "2026-01-05T18:00:00Z",
  "recurring": {
    "enabled": true,
    "frequency": "weekly",
    "interval": 1
  }
}
```

**Field Validation**:
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | **Yes** | 1-200 characters, non-empty after trim |
| `description` | string | No | Max 1000 characters |
| `priority` | string | No | "low" \| "medium" \| "high" (default: "medium") |
| `tags` | string[] | No | Array of non-empty strings (default: []) |
| `dueDate` | string (ISO 8601) | No | Valid future datetime or null |
| `recurring` | object | No | If present, all sub-fields required |
| `recurring.enabled` | boolean | Yes (if recurring present) | |
| `recurring.frequency` | string | Yes (if recurring present) | "daily" \| "weekly" \| "monthly" |
| `recurring.interval` | integer | Yes (if recurring present) | >= 1 |

**Response** (201 Created):
```json
{
  "data": {
    "id": "new-uuid-generated-by-backend",
    "userId": "user-uuid-123",
    "title": "Buy groceries",
    "description": "Milk, bread, eggs, fruits",
    "completed": false,
    "priority": "medium",
    "tags": ["personal", "shopping"],
    "dueDate": "2026-01-05T18:00:00Z",
    "recurring": {
      "enabled": true,
      "frequency": "weekly",
      "interval": 1
    },
    "createdAt": "2026-01-04T14:30:00Z",
    "updatedAt": null
  }
}
```

**Error Responses**:
- **400**: Validation error (invalid input)
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Title is required and must be 1-200 characters",
      "details": {
        "field": "title",
        "value": ""
      }
    }
  }
  ```
- **401**: Invalid or missing JWT token
- **500**: Database error

---

### 5. Update Todo

**Purpose**: Update an existing todo (partial update)

```http
PUT /api/todos/{id}
```

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Todo unique identifier |

**Request Body** (All fields optional):
```json
{
  "title": "Buy groceries and cook dinner",
  "description": "Updated description",
  "completed": true,
  "priority": "low",
  "tags": ["personal"],
  "dueDate": null,
  "recurring": null
}
```

**Notes**:
- Only include fields you want to update
- Setting `dueDate: null` or `recurring: null` clears those fields
- `userId` cannot be changed (enforced by backend)
- `updatedAt` is automatically set by backend

**Response** (200 OK):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-uuid-123",
    "title": "Buy groceries and cook dinner",
    "description": "Updated description",
    "completed": true,
    "priority": "low",
    "tags": ["personal"],
    "dueDate": null,
    "recurring": null,
    "createdAt": "2026-01-04T10:00:00Z",
    "updatedAt": "2026-01-04T15:00:00Z"
  }
}
```

**Error Responses**:
- **400**: Validation error
- **401**: Invalid or missing JWT token
- **403**: Todo belongs to another user
- **404**: Todo not found
- **409**: Optimistic locking conflict (if implemented)

---

### 6. Delete Todo

**Purpose**: Permanently delete a todo

```http
DELETE /api/todos/{id}
```

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Todo unique identifier |

**Example Request**:
```http
DELETE /api/todos/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "deleted": true
  }
}
```

**Error Responses**:
- **401**: Invalid or missing JWT token
- **403**: Todo belongs to another user
- **404**: Todo not found (idempotent: deleting already-deleted todo returns 404)

---

### 7. Toggle Todo Completion

**Purpose**: Quickly toggle completion status (shortcut for PATCH)

```http
PATCH /api/todos/{id}/toggle
```

**Authentication**: Required

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Todo unique identifier |

**Request Body**: None

**Response** (200 OK):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "completed": true,
    "updatedAt": "2026-01-04T15:30:00Z"
  }
}
```

**Error Responses**:
- **401**: Invalid or missing JWT token
- **403**: Todo belongs to another user
- **404**: Todo not found

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      /* Optional: Additional error context */
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `INVALID_TOKEN` | 401 | JWT token is missing, expired, or malformed |
| `FORBIDDEN` | 403 | User lacks permission for this resource |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Optimistic locking failure or duplicate |
| `INTERNAL_ERROR` | 500 | Server-side error |

---

## Rate Limiting

**Note**: Rate limiting details are backend-specific. Assume reasonable limits:
- **Authenticated requests**: 100 requests per minute per user
- **Public endpoints**: 20 requests per minute per IP

**Rate Limit Headers** (if implemented):
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709560000
```

---

## CORS Configuration

**Development**:
- **Allowed Origins**: `http://localhost:3000`, `http://localhost:3001`
- **Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Allowed Headers**: Authorization, Content-Type
- **Credentials**: true (for cookies, if used)

**Production**:
- **Allowed Origins**: Frontend deployment URL (e.g., Vercel deployment)
- Same methods and headers as development

---

## Date/Time Format

**Standard**: ISO 8601 with UTC timezone

**Examples**:
- `"2026-01-04T14:30:00Z"` (with seconds)
- `"2026-01-04T14:30:00.123Z"` (with milliseconds)

**Frontend Conversion**:
```typescript
// Backend → Frontend
const date = new Date("2026-01-04T14:30:00Z")

// Frontend → Backend
const isoString = new Date().toISOString()
```

---

## Testing Endpoints

### Example cURL Commands

**Get all todos**:
```bash
curl -X GET "https://teot-phase2.vercel.app/api/todos" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Create todo**:
```bash
curl -X POST "https://teot-phase2.vercel.app/api/todos" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "description": "Created via API",
    "priority": "medium"
  }'
```

**Update todo**:
```bash
curl -X PUT "https://teot-phase2.vercel.app/api/todos/<todo-id>" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
```

**Delete todo**:
```bash
curl -X DELETE "https://teot-phase2.vercel.app/api/todos/<todo-id>" \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## TypeScript Client Types

### API Client Interface

```typescript
interface ApiClient {
  // Get all todos with optional filters
  getTodos(options?: {
    page?: number
    pageSize?: number
    completed?: boolean
    priority?: Priority
    tags?: string[]
    search?: string
  }): Promise<ApiResponse<PaginatedResponse<Todo>>>

  // Get single todo by ID
  getTodo(id: string): Promise<ApiResponse<Todo>>

  // Create new todo
  createTodo(data: CreateTodoRequest): Promise<ApiResponse<Todo>>

  // Update existing todo (partial)
  updateTodo(id: string, data: UpdateTodoRequest): Promise<ApiResponse<Todo>>

  // Delete todo
  deleteTodo(id: string): Promise<ApiResponse<{ id: string; deleted: boolean }>>

  // Toggle completion status
  toggleTodo(id: string): Promise<ApiResponse<{ id: string; completed: boolean; updatedAt: string }>>
}
```

---

## Summary

**Total Endpoints**: 7
- 1 public (health check)
- 6 authenticated (todos CRUD + toggle)

**Authentication**: JWT Bearer token in Authorization header
**Data Format**: JSON with ISO 8601 dates
**Error Handling**: Standardized error response format
**CORS**: Configured for localhost development + production

**Next Steps**:
1. ✅ API contracts complete
2. → Write quickstart guide referencing these endpoints
3. → Implement `ApiClient` class matching this contract
4. → Update agent context
5. → Complete implementation plan

---

**API Contracts Defined By**: Claude (Sonnet 4.5)
**Validation**: All endpoints align with feature specification and data model
