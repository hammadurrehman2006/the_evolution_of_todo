# Data Model: Todo UI Pages

**Feature**: Todo UI Pages
**Date**: 2026-01-01
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Overview

This document defines the data entities used in the Todo UI Pages feature. Since this phase is UI-only with local state management, all entities are managed client-side in React state.

## Entities

### Todo Entity

Represents a single task in the todo list.

#### TypeScript Interface

```typescript
interface Todo {
  id: string;              // Unique identifier (UUID v4)
  title: string;           // Task title (1-200 characters)
  description?: string;    // Optional description (up to 1000 characters)
  completed: boolean;      // Completion status
  createdAt: Date;         // Creation timestamp
  updatedAt?: Date;        // Last update timestamp
}
```

#### Field Definitions

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID v4 format | Unique identifier generated via `crypto.randomUUID()` |
| `title` | string | Yes | 1-200 characters | The task title displayed to users |
| `description` | string | No | Max 1000 characters | Optional detailed description of the task |
| `completed` | boolean | Yes | N/A | Indicates whether the task is completed |
| `createdAt` | Date | Yes | N/A | Timestamp when the task was created |
| `updatedAt` | Date | No | N/A | Timestamp when the task was last updated |

#### Validation Rules

1. **Title Validation**:
   - Must not be empty (minimum 1 character)
   - Maximum 200 characters
   - Should be trimmed of leading/trailing whitespace

2. **Description Validation**:
   - Optional field
   - If provided, maximum 1000 characters
   - Should be trimmed of leading/trailing whitespace

3. **ID Generation**:
   - Must be a valid UUID v4 string
   - Generated using `crypto.randomUUID()` for uniqueness
   - Once generated, the ID must never change

#### State Transitions

```
          ┌─────────────────┐
          │   Created       │
          │ (completed:     │
          │   false)        │
          └────────┬────────┘
                   │ toggleTask()
                   │
          ┌────────▼────────┐
          │   Completed     │
          │ (completed:     │
          │   true)         │
          └────────┬────────┘
                   │ toggleTask()
                   │
          ┌────────▼────────┐
          │   Incomplete    │
          │ (completed:     │
          │   false)        │
          └─────────────────┘
```

**Available Transitions**:
- `Created` ↔ `Completed` (via `toggleTask()`)
- `Completed` ↔ `Incomplete` (via `toggleTask()`)
- Any state → `Deleted` (via `deleteTask()` - removes from array)
- Any state → `Updated` (via `updateTask()` - updates fields)

#### Usage Example

```typescript
// Creating a new todo
const newTodo: Todo = {
  id: crypto.randomUUID(),
  title: "Buy groceries",
  description: "Milk, bread, eggs",
  completed: false,
  createdAt: new Date()
}

// Updating a todo
const updatedTodo = { ...existingTodo, completed: true, updatedAt: new Date() }

// Validation helper
function validateTodoTitle(title: string): boolean {
  const trimmed = title.trim()
  return trimmed.length >= 1 && trimmed.length <= 200
}
```

---

### Theme Preference Entity

Represents the user's visual theme preference.

#### TypeScript Interface

```typescript
type Theme = 'light' | 'dark' | 'system'

interface ThemePreference {
  theme: Theme
}
```

#### Field Definitions

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `theme` | Theme | Yes | Must be 'light', 'dark', or 'system' | User's selected visual theme |

#### Theme Values

| Value | Description |
|-------|-------------|
| `'light'` | Force light mode theme |
| `'dark'` | Force dark mode theme |
| `'system'` | Respect operating system theme preference (default) |

#### Persistence

- **Storage Mechanism**: Client-side `localStorage` via `next-themes`
- **Storage Key**: `theme` (managed by next-themes automatically)
- **Default Value**: `'system'` (per FR-010 requirement)
- **Scope**: Domain-specific (same domain as application)

#### Behavior

1. **System Preference**:
   - When `theme === 'system'`, the application detects the OS theme
   - Automatically switches if the OS theme changes
   - Preferred for respecting user accessibility settings

2. **Explicit Preference**:
   - When `theme === 'light'` or `theme === 'dark'`, user's choice overrides system
   - Persists across browser sessions via localStorage
   - Allows users to manually control their visual experience

3. **Transition Logic**:
   ```
   System Preference ↔ Light/Dark Preference
         ↓
   localStorage Update
         ↓
   Immediate Visual Update (< 200ms per NFR-001)
   ```

#### Usage Example

```typescript
import { useTheme } from 'next-themes'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('light')
    } else {
      // If system, default to light
      setTheme('light')
    }
  }

  return <button onClick={toggleTheme}>Toggle Theme</button>
}
```

---

## Relationships

### Todo Relationships

This phase does not involve persistent storage or external services. All Todo entities exist independently in local React state.

### Theme Preference Relationships

Theme preference is a global application setting, independent of Todo entities. It applies to all pages and components.

---

## Data Lifecycle

### Todo Lifecycle

1. **Creation**:
   - User fills out TaskForm component
   - Validation runs on input fields
   - `use-mock-todos.ts` hook creates new Todo object
   - Todo added to local React state array

2. **Viewing**:
   - TaskList component renders array of Todo objects
   - Each Todo rendered as TaskCard component
   - Completion status displayed via badge/icon

3. **Modification**:
   - User clicks completion button → `toggleTask(id)` called
   - User clicks delete button → `deleteTask(id)` called
   - Optional: User edits via TaskForm → `updateTask(id, updates)` called

4. **Deletion**:
   - Todo removed from local state array
   - Component tree re-renders without deleted item
   - No persistence (per spec "Out of Scope")

### Theme Preference Lifecycle

1. **Initialization**:
   - Application loads on root layout
   - ThemeProvider reads from localStorage (if exists)
   - Falls back to 'system' if no stored preference

2. **Usage**:
   - Any component can access theme via `useTheme()` hook
   - Theme class (`dark`/`light`) applied to `html` element
   - Tailwind CSS responds to class changes

3. **Modification**:
   - User clicks theme toggle button in Navbar
   - `setTheme()` updates localStorage
   - Visual change applied instantly (< 200ms)

4. **Persistence**:
   - Preference stored in localStorage
   - Persists across page navigation
   - Persists across browser sessions
   - Persists across browser restarts

---

## Type Safety

All entities are fully typed using TypeScript interfaces. This provides:

- Compile-time type checking
- IDE autocomplete and IntelliSense
- Reduced runtime errors
- Self-documenting code

### Exported Types

```typescript
// lib/types.ts
export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: Date
  updatedAt?: Date
}

export type Theme = 'light' | 'dark' | 'system'

export interface ThemePreference {
  theme: Theme
}
```

---

## Validation Helpers

### Todo Validation

```typescript
// lib/validation.ts
export function validateTodoTitle(title: string): {
  valid: boolean
  error?: string
} {
  const trimmed = title.trim()
  if (trimmed.length === 0) {
    return { valid: false, error: 'Title is required' }
  }
  if (trimmed.length > 200) {
    return { valid: false, error: 'Title must be 200 characters or less' }
  }
  return { valid: true }
}

export function validateTodoDescription(description: string): {
  valid: boolean
  error?: string
} {
  if (description.length > 1000) {
    return { valid: false, error: 'Description must be 1000 characters or less' }
  }
  return { valid: true }
}
```

### Theme Validation

```typescript
// lib/validation.ts
export function isValidTheme(theme: string): theme is Theme {
  return ['light', 'dark', 'system'].includes(theme)
}
```

---

## Migration Notes

This is Phase 1 of the Todo Application evolution. Future phases will involve:

- Backend integration with FastAPI/SQLModel/Neon
- Authentication via JWT and Better Auth
- Persistence of Todo entities to PostgreSQL
- Event-driven architecture with Kafka/Dapr

When migrating to backend persistence:
1. Replace local state with API calls
2. Add `userId` field to Todo entity for data isolation
3. Replace `crypto.randomUUID()` with database-generated IDs
4. Add relationship to User entity
5. Implement optimistic updates for better UX

---

## Summary

This data model provides a complete definition of the Todo and Theme Preference entities for the UI-only phase. All entities are:

- Fully typed with TypeScript
- Validated according to spec requirements
- Designed for easy migration to backend persistence in future phases
- Focused on the "what" (entities and rules) rather than the "how" (implementation details)
