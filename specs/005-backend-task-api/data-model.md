# Data Model: Backend Task Management API

**Feature**: Backend Task Management API
**Date**: 2026-01-02
**Purpose**: Define database schema, entity relationships, and validation rules

---

## Entity Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                           Task                              │
├─────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                              │
│ user_id: String (FK to external User system)              │
│ title: String(200) NOT NULL                                │
│ description: String(2000) NULLABLE                         │
│ completed: Boolean DEFAULT false                           │
│ priority: Enum('High', 'Medium', 'Low') DEFAULT 'Medium'  │
│ tags: JSONB (Array<String>) DEFAULT []                    │
│ due_date: DateTime NULLABLE                                │
│ reminder_at: DateTime NULLABLE                             │
│ is_recurring: Boolean DEFAULT false                        │
│ recurrence_rule: String NULLABLE                           │
│ created_at: DateTime DEFAULT NOW()                         │
│ updated_at: DateTime DEFAULT NOW()                         │
└─────────────────────────────────────────────────────────────┘
         │
         │ (user_id references external User)
         ▼
┌─────────────────────────────────────────┐
│             User (External)             │
├─────────────────────────────────────────┤
│ Managed by authentication system       │
│ (Better Auth, Auth0, etc.)             │
│                                         │
│ Referenced by user_id in JWT token     │
└─────────────────────────────────────────┘
```

---

## 1. Task Entity

### Purpose
Represents a single task or to-do item with all organizational, scheduling, and user isolation metadata.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL, AUTO | Unique identifier for the task |
| `user_id` | String | NOT NULL, INDEX | User identifier from JWT token (multi-tenancy) |
| `title` | String(200) | NOT NULL | Task title (1-200 characters) |
| `description` | String(2000) | NULLABLE | Optional task description (max 2000 characters) |
| `completed` | Boolean | NOT NULL, DEFAULT false | Completion status (true = complete, false = incomplete) |
| `priority` | Enum | NOT NULL, DEFAULT 'Medium' | Priority level: 'High', 'Medium', 'Low' |
| `tags` | JSONB | NULLABLE, DEFAULT [] | Array of tag strings (e.g., ["Work", "Urgent"]) |
| `due_date` | DateTime | NULLABLE | Task due date and time (ISO 8601, UTC) |
| `reminder_at` | DateTime | NULLABLE | Reminder trigger time (ISO 8601, UTC) |
| `is_recurring` | Boolean | NOT NULL, DEFAULT false | Whether task auto-reschedules on completion |
| `recurrence_rule` | String | NULLABLE | iCalendar RRULE format (e.g., "FREQ=WEEKLY") |
| `created_at` | DateTime | NOT NULL, DEFAULT NOW() | Timestamp of task creation |
| `updated_at` | DateTime | NOT NULL, DEFAULT NOW(), AUTO-UPDATE | Timestamp of last modification |

### Indexes

```sql
-- Primary index on id (auto-created)
CREATE INDEX idx_task_user_id ON task(user_id);

-- Composite index for user + completion status (common query pattern)
CREATE INDEX idx_task_user_completed ON task(user_id, completed);

-- Index for due date filtering
CREATE INDEX idx_task_due_date ON task(due_date) WHERE due_date IS NOT NULL;

-- GIN index for JSONB tags (PostgreSQL-specific)
CREATE INDEX idx_task_tags ON task USING GIN(tags);
```

### Validation Rules

**From spec.md functional requirements:**

1. **FR-035**: Title must be non-empty and ≤ 200 characters
   - Validated by: `Field(min_length=1, max_length=200)`

2. **FR-036**: Description must be ≤ 2000 characters if provided
   - Validated by: `Field(max_length=2000, nullable=True)`

3. **FR-037**: Priority must be one of: "High", "Medium", "Low" (case-insensitive)
   - Validated by: Python Enum + database CHECK constraint

4. **FR-038**: due_date and reminder_at must be valid ISO 8601 datetime
   - Validated by: SQLModel `datetime` type with Pydantic parsing

5. **FR-024**: reminder_at must be ≤ due_date
   - Validated by: Custom Pydantic validator in schema

6. **FR-026**: recurrence_rule must follow iCalendar RRULE format
   - Validated by: `dateutil.rrule.rrulestr()` parsing attempt

7. **FR-011**: Tags must be de-duplicated
   - Validated by: Python `list(set(tags))` before storage

### State Transitions

```
┌──────────────┐
│  Task Created │
│ (completed=false) │
└───────┬──────┘
        │
        ▼
┌───────────────┐      ┌─────────────────┐
│   Incomplete  │ ───→ │    Completed    │
│ (completed=false) │      │ (completed=true) │
└───────┬───────┘      └────────┬────────┘
        │                       │
        │                       │ (if is_recurring=true)
        │                       ▼
        │              ┌──────────────────┐
        └──────────────│  New Task Created │
                       │  (due_date advanced) │
                       └──────────────────┘
```

**Transitions:**
1. **Create Task**: `completed=false` by default
2. **Toggle Completion**: `completed` flips between `true` and `false`
3. **Mark Complete (Recurring)**: If `is_recurring=true` and `recurrence_rule` exists, create new task instance with advanced `due_date`

### SQLModel Implementation

```python
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

    tags: Optional[List[str]] = Field(
        default=None,
        sa_column=Column(JSONB)
    )

    due_date: Optional[datetime] = Field(default=None)

    reminder_at: Optional[datetime] = Field(default=None)

    is_recurring: bool = Field(default=False, nullable=False)

    recurrence_rule: Optional[str] = Field(default=None, max_length=500)

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )

    class Config:
        arbitrary_types_allowed = True
```

---

## 2. User Entity (External Reference)

### Purpose
Represents a user of the system. **Note**: User management is out of scope for this API (handled by external authentication system).

### Fields

User entity is **not stored** in this database. The `user_id` field in Task references users managed by the external authentication system (Better Auth, Auth0, etc.).

### User ID Source
- Extracted from JWT token payload
- Claim name: `"sub"` or `"user_id"`
- Format: String (UUID, email, or custom identifier)

### Usage in API
Every database query must filter by `user_id`:
```python
# Example: Get all tasks for authenticated user
query = select(Task).where(Task.user_id == current_user_id)
```

---

## 3. Tag (No Separate Entity)

### Purpose
Tags are categorical labels (e.g., "Work", "Home", "Urgent") stored as JSONB array in the Task entity.

### Storage Format
```json
{
  "tags": ["Work", "Urgent", "Personal"]
}
```

### JSONB Advantages
- **Flexible**: Can add tag metadata later (colors, icons) without schema changes
- **Performant**: GIN indexes enable fast queries
- **Simple**: No joins required for basic operations

### Query Examples

**Check if task has specific tag:**
```sql
SELECT * FROM tasks WHERE tags @> '["Work"]';
```

**Check if task has any of multiple tags:**
```sql
SELECT * FROM tasks WHERE tags ?| array['Work', 'Home'];
```

**Get unique tags across all user tasks:**
```sql
SELECT DISTINCT jsonb_array_elements_text(tags) AS tag
FROM tasks
WHERE user_id = 'user-123'
ORDER BY tag;
```

---

## 4. Relationships

### Task → User (Many-to-One)
- **Cardinality**: Many tasks belong to one user
- **Foreign Key**: `Task.user_id` references external User system
- **Enforcement**: Application-level (not database FK constraint)
- **Isolation**: Every query filtered by `user_id` from JWT token

**Why no database FK?**
- User table exists in external authentication system (different database)
- Application-level enforcement via dependency injection ensures isolation

---

## 5. Database Schema SQL

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create priority enum type
CREATE TYPE priority_enum AS ENUM ('High', 'Medium', 'Low');

-- Create tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    completed BOOLEAN NOT NULL DEFAULT false,
    priority priority_enum NOT NULL DEFAULT 'Medium',
    tags JSONB DEFAULT '[]'::jsonb,
    due_date TIMESTAMPTZ,
    reminder_at TIMESTAMPTZ,
    is_recurring BOOLEAN NOT NULL DEFAULT false,
    recurrence_rule VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT chk_reminder_before_due CHECK (
        reminder_at IS NULL OR due_date IS NULL OR reminder_at <= due_date
    ),
    CONSTRAINT chk_recurring_has_rule CHECK (
        NOT is_recurring OR recurrence_rule IS NOT NULL
    )
);

-- Indexes
CREATE INDEX idx_task_user_id ON tasks(user_id);
CREATE INDEX idx_task_user_completed ON tasks(user_id, completed);
CREATE INDEX idx_task_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_task_tags ON tasks USING GIN(tags);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 6. Data Migration Strategy

### Initial Migration
1. Create `tasks` table with all fields
2. Create indexes for performance
3. Add constraints for data integrity

### Future Migrations
- Use Alembic for version-controlled schema changes
- Example: Adding new field `archived: Boolean`

```bash
# Generate migration
alembic revision --autogenerate -m "Add archived field to tasks"

# Apply migration
alembic upgrade head
```

---

## 7. Performance Considerations

### Query Patterns
Most common queries (optimized with indexes):
1. **List user tasks**: `WHERE user_id = ?` → `idx_task_user_id`
2. **Filter by completion**: `WHERE user_id = ? AND completed = ?` → `idx_task_user_completed`
3. **Filter by due date**: `WHERE due_date BETWEEN ? AND ?` → `idx_task_due_date`
4. **Filter by tags**: `WHERE tags @> ?` → `idx_task_tags` (GIN)
5. **Search by keyword**: `WHERE title ILIKE ? OR description ILIKE ?` → Full-text search if needed

### Optimization Strategies
- **Pagination**: Always use `LIMIT` and `OFFSET` to prevent large result sets
- **Composite index**: `(user_id, completed)` for common filter combination
- **Partial index**: `due_date` index only where `due_date IS NOT NULL` (smaller index)
- **GIN index**: `tags` JSONB column for fast containment queries

---

## Summary

**Entity Count**: 1 primary entity (Task)
**Storage Strategy**: JSONB for tags, iCalendar RRULE for recurrence
**Multi-Tenancy**: User isolation via `user_id` field (from JWT token)
**Validation**: Enforced at multiple layers (Pydantic, SQLModel, Database constraints)
**Performance**: Optimized indexes for common query patterns

All entity definitions align with functional requirements (FR-001 through FR-041) from spec.md.
