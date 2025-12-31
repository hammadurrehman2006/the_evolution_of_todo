# Data Model: Professional Productivity Suite Frontend

**Date**: 2025-12-31
**Feature**: 002-productivity-suite
**Phase**: 1 - Design & Contracts

## Overview

This document defines the frontend data model for the Professional Productivity Suite, including all entities, their fields, relationships, validation rules, and state transitions. The frontend model mirrors the backend data structures but focuses on UI representation and client-side state management.

## Core Entities

### Task

Represents a single actionable item in the productivity system.

**Primary Key**: `id` (string)

| Field | Type | Required | Validation | Description |
|--------|------|-----------|-------------|
| id | string | Yes | UUID v4 format, server-generated |
| title | string | Yes | 1-200 characters, non-empty, trimmed |
| description | string | No | Up to 1000 characters, trimmed, optional |
| completed | boolean | Yes | Default: false, user toggles via checkmark |
| priority | PriorityLevel | No | One of: Low, Medium, High, Critical |
| tags | Tag[] | No | Array of tag references, default: [] |
| dueDate | ISO8601 | No | UTC timestamp or null, user timezone aware |
| recurrence | RecurrenceSchedule | No | Optional recurrence configuration |
| createdAt | ISO8601 | Yes | UTC timestamp, server-generated, immutable |
| updatedAt | ISO8601 | Yes | UTC timestamp, server-updated |
| deleted | boolean | Yes | Soft delete flag, default: false |

**State Transitions**:
```
[Draft/Not Started] ──complete()──> [Completed]
      │                 │
      └─────────────────┘
```

**Validation Rules**:
- Title must be 1-200 characters after trimming
- Description, if provided, must be ≤ 1000 characters
- dueDate, if provided, must be future-dated or equal to today
- recurrence.endCondition requires recurrence.intervalType

**Derived Fields** (computed on client):
- `isOverdue`: boolean = dueDate < now && !completed
- `daysUntilDue`: number = Math.ceil((dueDate - now) / 86400000) or null
- `completedCount`: number = 1 if completed else 0 (for metrics)

### Tag

Represents a category label for task organization.

**Primary Key**: `id` (string)

| Field | Type | Required | Validation | Description |
|--------|------|-----------|-------------|
| id | string | Yes | UUID v4 format, server-generated |
| label | string | Yes | 1-50 characters, non-empty, trimmed |
| color | string | Yes | Hex color code (#RRGGBB) or predefined palette |
| createdAt | ISO8601 | Yes | UTC timestamp, server-generated, immutable |
| usageCount | number | Yes | Server-calculated, default: 0 |

**Validation Rules**:
- Label must be 1-50 characters
- Color must be valid hex code (#RRGGBB format) or match palette

### PriorityLevel

Represents urgency levels with visual indicators.

**Primary Key**: None (enum)

| Value | Display Order | Visual Color | Description |
|-------|---------------|---------------|-------------|
| Low | 4 | Green (#10b981) | Non-urgent, can wait |
| Medium | 3 | Yellow (#f59e0b) | Normal priority |
| High | 2 | Orange (#f97316) | Urgent, attention needed |
| Critical | 1 | Red (#ef4444) | Immediate attention required |

**Usage**: Task.priority field references this enum, controls sorting and visual display.

### RecurrenceSchedule

Defines repeat behavior for tasks.

**Primary Key**: `taskId` (string) - belongs to Task

| Field | Type | Required | Validation | Description |
|--------|------|-----------|-------------|
| taskId | string | Yes | Foreign key to Task.id |
| intervalType | IntervalType | Yes | One of: daily, weekly, monthly, custom |
| intervalValue | number | No | For 'custom' intervals (e.g., every N days), default: null |
| endCondition | EndCondition | No | When recurrence stops |
| endValue | ISO8601 | number | Depends on endCondition |
| timezone | string | Yes | IANA timezone identifier (e.g., 'America/New_York') |
| lastGenerated | ISO8601 | Yes | Server timestamp of last recurrence generation |

**Nested Types**:

**IntervalType** (enum):
- `daily`: Repeats every day
- `weekly`: Repeats every week
- `monthly`: Repeats every month
- `custom`: Repeats every `intervalValue` days

**EndCondition** (enum):
- `none`: No end, repeats indefinitely
- `date`: Stop after specific date (endValue = ISO8601)
- `occurrences`: Stop after N completions (endValue = number)

**Validation Rules**:
- `intervalValue` required only when `intervalType === 'custom'`
- `endValue` required only when `endCondition !== 'none'`
- `endValue` must be ≥ 1 when `endCondition === 'occurrences'`
- `timezone` must be valid IANA identifier

### UserPreferences

Represents user-specific UI and functionality settings.

**Primary Key**: `userId` (string) - derived from authentication

| Field | Type | Required | Validation | Description |
|--------|------|-----------|-------------|
| userId | string | Yes | User identifier from authentication system |
| theme | Theme | Yes | One of: light, dark, default: 'system' |
| notificationPermission | NotificationPermission | Yes | One of: default, granted, denied |
| timezone | string | Yes | IANA timezone identifier, default: system timezone |

**Nested Types**:

**Theme** (enum):
- `light`: Always light mode
- `dark`: Always dark mode
- `system`: Follows OS preference (browser-level)

**NotificationPermission** (enum):
- `default`: Not requested yet, system default
- `granted`: User approved notifications
- `denied`: User blocked notifications

### FilterCriteria

Represents active filter state for task list.

**Primary Key**: None (client-side state object)

| Field | Type | Required | Description |
|--------|------|-----------|-------------|
| status | string[] | No | One or more of: 'active', 'completed', default: ['active'] |
| priority | PriorityLevel[] | No | Array of priorities to show, default: [] (all) |
| tags | string[] | No | Array of tag IDs to filter by, default: [] |
| dueDateRange | DateRange | No | Start/end ISO8601 timestamps, default: null |

**Nested Types**:

**DateRange**:
```typescript
interface DateRange {
  start?: ISO8601 | null
  end?: ISO8601 | null
}
```

**Usage**: Client-side state object, persists to URL query params for shareability.

### SortCriteria

Represents active sort configuration for task list.

**Primary Key**: None (client-side state object)

| Field | Type | Required | Description |
|--------|------|-----------|-------------|
| field | SortField | Yes | Which field to sort by |
| direction | SortDirection | Yes | Order: asc or desc |

**Nested Types**:

**SortField** (enum):
- `dueDate`: Sort by task due date
- `priority`: Sort by priority level (Critical first)
- `createdAt`: Sort by creation date
- `updatedAt`: Sort by last modification
- `completedAt`: Sort by completion date

**SortDirection** (enum):
- `asc`: Ascending order (oldest/lowest first)
- `desc`: Descending order (newest/highest first)

**Usage**: Client-side state object, persists to URL query params for shareability.

## Entity Relationships

```
User (1) ─────(has many)──> Task (many)
│                       │
│                       ├(0..n)──> Tag
│                       │
│                       └(0..1)──> RecurrenceSchedule
│
User (1) ─────(has)──> UserPreferences (1)
```

**Relationship Details**:
- **User → Task**: One-to-many, cascading delete soft (mark task.deleted=true)
- **Task → Tag**: Many-to-many (via join table or tagIds array), task can have 0+ tags
- **Task → RecurrenceSchedule**: One-to-zero-or-one (only recurring tasks have schedule)
- **User → UserPreferences**: One-to-one, user has single preferences object

## Client-Side State Architecture

### Global State (React Context)

**ThemeContext**:
```typescript
interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}
```
- Scope: Application-wide
- Persistence: Cookies (session-aware, security-auditor designed)
- Consumers: ThemeProvider (Client), ThemeToggle component

**UserContext**:
```typescript
interface UserContextValue {
  userId: string | null
  notificationPermission: NotificationPermission
  requestNotificationPermission: () => Promise<boolean>
}
```
- Scope: Application-wide
- Persistence: Not needed (from auth session)
- Consumers: Layout components, Dashboard, TaskForm

### Local State (Component-Level)

**TaskList Filters**:
```typescript
interface TaskListState {
  criteria: FilterCriteria
  sort: SortCriteria
  searchTerm: string
}
```
- Scope: TaskList component and children
- Persistence: URL query params (route-based state)
- Optimization: useMemo for filtered/sorted results

**TaskForm State**:
```typescript
interface TaskFormState {
  title: string
  description: string
  priority: PriorityLevel
  tagIds: string[]
  dueDate: ISO8601 | null
  recurrence: RecurrenceSchedule | null
}
```
- Scope: TaskFormModal component
- Persistence: Not persisted (transient)
- Validation: Client-side validation before server submission

### Derived State (Computed Values)

**TaskList Metrics**:
```typescript
interface TaskMetrics {
  total: number
  completed: number
  pending: number
  overdue: number
  completionRate: number
}
```
- Computed from: Filtered task list
- Optimization: useMemo to recalculate only when list changes
- Usage: Dashboard header, progress indicators

**FilteredTaskList**:
```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(task =>
    matchesStatus(task) &&
    matchesPriority(task) &&
    matchesTags(task) &&
    matchesDueDate(task) &&
    matchesSearchTerm(task)
  ).sort((a, b) =>
    applySortCriteria(a, b, sortCriteria)
  )
}, [tasks, filterCriteria, sortCriteria, searchTerm])
```

## State Transition Diagrams

### Task Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                                                         │
│                    [Draft/Not Started]                     │
│                         │                               │
│                         │ edit()                        │ delete()
│                         │                               │
│                         ▼                               ▼
│                    [In Progress] ──complete()──> [Completed]        │
│                         │           │                 │
│                         └───────────┘                 │
│                                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Transitions**:
1. `edit()` → Updates task fields, regenerates updatedAt
2. `complete()` → Toggles completed boolean, regenerates updatedAt and completedAt
3. `delete()` → Sets deleted=true, removes from active lists (soft delete)
4. Recurring tasks → On `complete()`, generates new Task instance with identical recurrence settings

### Theme Transition

```
┌─────────────────────────────────────────┐
│                                     │
│          [light]                     │
│              │                        │
│              │ setTheme('dark')      │ setTheme('system')
│              ▼                        ▼
│          [dark] ───────────> [system]    │
│              │                        │       │
│              │ setTheme('light')       │ setTheme('light')
│              └───────────────────────┘       │
│                                     │
└─────────────────────────────────────────┘
```

**Transitions**:
1. `setTheme('light'/'dark')` → Explicit theme, persists to cookie
2. `setTheme('system')` → Follows OS preference, detects via `window.matchMedia('(prefers-color-scheme: dark)')`
3. Zero-flicker requirement → Apply theme before hydration, avoid flash of unstyled content

## Data Validation Summary

### Client-Side Validation

Performs immediate validation before server submission:

**Task Validation**:
```typescript
function validateTask(task: Partial<Task>): ValidationError[] {
  const errors: ValidationError[] = []

  if (task.title !== undefined) {
    if (task.title.length < 1 || task.title.length > 200) {
      errors.push({ field: 'title', message: 'Title must be 1-200 characters' })
    }
    if (task.title.trim() !== task.title) {
      errors.push({ field: 'title', message: 'Title must not have leading/trailing whitespace' })
    }
  }

  if (task.description !== undefined) {
    if (task.description.length > 1000) {
      errors.push({ field: 'description', message: 'Description must be ≤ 1000 characters' })
    }
  }

  if (task.dueDate !== undefined && task.dueDate !== null) {
    const due = new Date(task.dueDate)
    const now = new Date()
    if (due < now.setHours(0,0,0,0)) {
      errors.push({ field: 'dueDate', message: 'Due date cannot be in the past' })
    }
  }

  return errors
}
```

**Tag Validation**:
```typescript
function validateTag(tag: Partial<Tag>): ValidationError[] {
  const errors: ValidationError[] = []

  if (tag.label !== undefined) {
    if (tag.label.length < 1 || tag.label.length > 50) {
      errors.push({ field: 'label', message: 'Label must be 1-50 characters' })
    }
  }

  if (tag.color !== undefined) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(tag.color)) {
      errors.push({ field: 'color', message: 'Color must be valid hex code (#RRGGBB)' })
    }
  }

  return errors
}
```

### Server-Side Validation (Contracts)

Validation rules must be enforced by backend API. Frontend provides optimistic validation for UX, server enforces business rules.

**See**: `/contracts/task-api-contract.md` for server validation specification.

## TypeScript Interfaces

### Core Interfaces

```typescript
interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority?: PriorityLevel
  tags?: Tag[]
  dueDate?: string | null
  recurrence?: RecurrenceSchedule | null
  createdAt: string
  updatedAt: string
  deleted: boolean
}

interface Tag {
  id: string
  label: string
  color: string
  createdAt: string
  usageCount: number
}

interface RecurrenceSchedule {
  taskId: string
  intervalType: IntervalType
  intervalValue?: number | null
  endCondition: EndCondition
  endValue?: string | number | null
  timezone: string
  lastGenerated: string
}

interface UserPreferences {
  userId: string
  theme: Theme
  notificationPermission: NotificationPermission
  timezone: string
}

interface FilterCriteria {
  status?: string[]
  priority?: PriorityLevel[]
  tags?: string[]
  dueDateRange?: DateRange | null
}

interface SortCriteria {
  field: SortField
  direction: SortDirection
}
```

### Type Aliases

```typescript
type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical'
type IntervalType = 'daily' | 'weekly' | 'monthly' | 'custom'
type EndCondition = 'none' | 'date' | 'occurrences'
type Theme = 'light' | 'dark' | 'system'
type NotificationPermission = 'default' | 'granted' | 'denied'
type SortField = 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'completedAt'
type SortDirection = 'asc' | 'desc'

type ISO8601 = string // Format: YYYY-MM-DDTHH:mm:ss.sssZ

interface DateRange {
  start?: string | null
  end?: string | null
}

interface ValidationError {
  field: string
  message: string
}
```

## Performance Considerations

### Memoization Strategy

1. **Task List Items**: `React.memo()` to prevent re-renders when other list items change
2. **Filtered Results**: `useMemo()` for filter/sort computations (expensive for 1000+ tasks)
3. **Event Handlers**: `useCallback()` for function references passed as props
4. **Metrics Calculation**: `useMemo()` for derived metrics (total, completed, overdue)

### Bundle Optimization

1. **Code Splitting**: Lazy load heavy components (TaskFormModal) with `React.lazy()`
2. **Server Components**: Default to Server Components to reduce client bundle size
3. **Tree Shaking**: Import only used animation hooks from Framer Motion/GSAP
4. **Dynamic Imports**: Load GSAP ScrollTrigger only on client components needing it

## Next Steps

Proceed to contracts generation:
1. Generate UI component contracts in `/contracts/` directory
2. Create API client contracts for task CRUD operations
3. Create quickstart.md with setup instructions
