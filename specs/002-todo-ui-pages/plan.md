# Implementation Plan: Todo UI Pages

**Branch**: `002-todo-ui-pages` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-todo-ui-pages/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a frontend user interface for the Todo Application with two main pages (Home landing page and Todo dashboard) and a dark/light theme toggle mechanism. The architecture uses Next.js 16+ App Router, Tailwind CSS, and Shadcn UI components. Local state management for todos is handled through a custom hook (use-mock-todos.ts), and theme persistence is achieved via next-themes with client-side storage.

## Technical Context

**Language/Version**: TypeScript 5.7+
**Primary Dependencies**: Next.js 16.0+ (App Router), React 19, Tailwind CSS, Shadcn UI, next-themes
**Storage**: Client-side localStorage (theme preferences)
**Testing**: React Testing Library, Playwright (E2E), Jest/Vitest
**Target Platform**: Web browsers (modern browsers with JavaScript enabled)
**Project Type**: Web application (frontend-only for this phase)
**Performance Goals**: Page load < 2s, theme switch < 200ms
**Constraints**: WCAG 2.2 AA compliance, mobile responsive (≤ 768px), no page reload for theme toggle
**Scale/Scope**: 2 main pages, navigation bar, theme toggle, local todo state management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Technology Stack Compliance
✅ **Next.js 16+**: Aligned with constitution requirement for Next.js frontend stack
⚠️ **JWT Authentication**: NOT IMPLEMENTED - This is a UI-only phase focused on structure and theming; authentication will be added in a future phase as per spec assumptions
⚠️ **Backend Integration**: NOT IMPLEMENTED - Per spec "Out of Scope" section, backend persistence will be added in future phase; currently using local state
⚠️ **Kafka/Dapr Event-Driven**: NOT IMPLEMENTED - Not required for UI-only phase; will be implemented in later phases
⚠️ **Containerized Deployment**: NOT APPLICABLE - Frontend-only phase; deployment considerations will be addressed in future phases

### Development Workflow Compliance
✅ **Spec-Driven Approach**: All code will be driven by tasks.md (to be generated in Phase 2)
✅ **No Hardcoding**: No secrets or configuration values will be hardcoded

### Justification for Exemptions
This phase implements the foundational UI layer as specified in the "Out of Scope" section of the spec. Future phases will add authentication (JWT via Better Auth), backend integration (FastAPI/SQLModel/Neon), and event-driven architecture (Kafka/Dapr) as outlined in the project constitution.

## Project Structure

### Documentation (this feature)

```text
specs/002-todo-ui-pages/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification (created in /sp.specify)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── todo-entity.json     # Todo entity structure
│   └── theme-preference.json # Theme preference structure
├── checklists/
│   └── requirements.md  # Spec validation checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
phase-2/frontend/
├── app/
│   ├── layout.tsx           # Root layout with ThemeProvider
│   ├── page.tsx             # Home landing page (FR-001, FR-002)
│   ├── globals.css          # Global styles with Tailwind
│   └── todos/
│       └── page.tsx         # Todo dashboard page (FR-003, FR-007)
├── components/
│   ├── layout/
│   │   └── Navbar.tsx       # Navigation bar with theme toggle (FR-004, FR-005)
│   ├── todo/
│   │   ├── TaskCard.tsx     # Individual todo item component
│   │   ├── TaskList.tsx     # List of todos component
│   │   └── TaskForm.tsx     # Form for adding/editing todos (using Dialog)
│   └── ui/                  # Shadcn UI components (installed via shadcn-ui CLI)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       ├── badge.tsx
│       └── [other Shadcn components as needed]
├── hooks/
│   └── use-mock-todos.ts    # Custom hook for local todo state management
├── lib/
│   ├── utils.ts             # Utility functions (shadcn-cn utility)
│   └── types.ts             # TypeScript type definitions
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── components.json          # Shadcn UI configuration
```

**Structure Decision**: Frontend web application structure using Next.js 16 App Router. Components organized by feature (layout, todo) and UI primitives. Custom hooks in dedicated hooks directory for state management logic.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Local state instead of backend | Per spec, this is UI-only phase; backend to be added later | No simpler alternative - local state is appropriate for this phase |
| No authentication | Authentication not in scope for this UI foundation phase | Adding auth now would violate spec "Out of Scope" and block UI development |
| No event-driven architecture | Not required for client-side UI interactions | Would introduce unnecessary complexity for this phase |

---

## Phase 0: Research & Decision Documentation

### Research Summary

This phase documents technology decisions, best practices, and patterns for implementing the Todo UI Pages feature.

### Technology Decisions

#### 1. Next.js App Router Structure
**Decision**: Use Next.js 16+ App Router with `app/` directory structure
**Rationale**:
- App Router provides improved performance with Server Components by default
- Simplified routing with file-based conventions
- Built-in support for layouts and loading states
- Aligns with constitution requirement for Next.js stack
**Alternatives Considered**:
- Pages Router (legacy): Rejected as App Router is the default in Next.js 13+ and provides better performance

#### 2. Shadcn UI Components
**Decision**: Install and use Shadcn UI components via shadcn-ui CLI
**Rationale**:
- Built on Radix UI primitives (accessible, unstyled)
- Fully customizable with Tailwind CSS
- No dependency bundle bloat - components are copied to project
- Strong TypeScript support
**Components to Install**:
- Button (CTA buttons, navigation links, theme toggle)
- Card (Todo items, dashboard containers)
- Input (Task input fields)
- Dialog (Task form modal)
- Badge (Task status indicators, priority tags)
- Separator (Visual dividers)

#### 3. Theme Management with next-themes
**Decision**: Use next-themes for dark/light theme switching
**Rationale**:
- Handles system preference detection (FR-010)
- Prevents hydration mismatches with SSR
- Client-side persistence via localStorage (FR-006)
- No page reload required (FR-009)
- Provides smooth transitions (< 200ms as per NFR-001)
**Alternatives Considered**:
- Custom React Context: Rejected due to hydration issues and complexity
- CSS media queries only: Rejected as they don't support user preference persistence

#### 4. Local State Management for Todos
**Decision**: Custom React hook `use-mock-todos.ts` with React useState/useReducer
**Rationale**:
- No backend in this phase (per spec "Out of Scope")
- Provides addTask, deleteTask, toggleTask functions
- Simple and testable for local-only functionality
**State Structure**:
```typescript
interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
}
```
**Alternatives Considered**:
- Context API: Overkill for single-page local state
- Redux/Zustand: Unnecessary complexity for this phase

#### 5. Component Organization
**Decision**: Feature-based structure under `components/todo/`
**Rationale**:
- TaskCard: Single todo display with status badge
- TaskList: Renders list of TaskCard components
- TaskForm: Dialog-based form for adding/editing todos
- Clear separation of concerns and reusability

### Best Practices Identified

#### Next.js 16 App Router Patterns
- Use Server Components by default for better performance
- Wrap client components with `"use client"` directive when needed (hooks, event handlers)
- Use `app/layout.tsx` for shared UI (navigation bar)
- Leverage `next/link` for navigation without page reloads

#### Tailwind CSS Configuration
- Use CSS variables for theme colors (light/dark mode)
- Configure `darkMode: "class"` for class-based theming
- Extend theme with custom color palette via `tailwind.config.ts`

#### Shadcn UI Setup
- Run `npx shadcn-ui@latest init` to initialize
- Install components individually: `npx shadcn-ui@latest add button card input dialog`
- Components copied to `components/ui/` for customization

#### Accessibility (WCAG 2.2 AA)
- Ensure keyboard navigation for all interactive elements
- Provide ARIA labels for icon-only buttons
- Maintain sufficient color contrast ratios (4.5:1 for text)
- Use semantic HTML elements

### Performance Considerations

- Page load: Use Next.js static generation where possible
- Theme toggle: Ensure < 200ms (client-side update, no re-renders outside theme context)
- Component rendering: Use React.memo for TaskCard to prevent unnecessary re-renders
- Image optimization: Use Next.js Image component if adding images later

### Next Steps

Proceed to Phase 1: Design & Contracts to define data models and component interfaces.

---

## Phase 1: Design & Contracts

### Data Model

#### Todo Entity

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

**Validation Rules**:
- `title`: Required, min 1 char, max 200 chars
- `description`: Optional, max 1000 chars if provided
- `id`: Auto-generated using `crypto.randomUUID()`

**State Transitions**:
- Created → Completed (via toggleTask)
- Completed → Incomplete (via toggleTask)
- Any state → Deleted (via deleteTask)
- Any state → Updated (via updateTask - optional enhancement)

#### Theme Preference Entity

```typescript
interface ThemePreference {
  theme: 'light' | 'dark' | 'system';
}
```

**Persistence**: Client-side localStorage via next-themes
**Default**: 'system' (respects OS preference per FR-010)

### Component Contracts

#### Navigation Bar Component

**Component**: `components/layout/Navbar.tsx`

**Props**: None (uses hooks internally)

**Features**:
- Navigation links: Home (/), Todos (/todos)
- Theme toggle button with icon (sun/moon)
- Responsive design (mobile-friendly)
- Sticky positioning

**Interactions**:
- Click Home link → Navigate to `/`
- Click Todos link → Navigate to `/todos`
- Click theme toggle → Toggle theme (light/dark/system)

#### TaskCard Component

**Component**: `components/todo/TaskCard.tsx`

**Props**:
```typescript
interface TaskCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Features**:
- Display todo title and description
- Completion status indicator (badge/icon)
- Toggle completion button
- Delete button
- Hover effects

**Interactions**:
- Click completion button → Toggle `completed` status via `onToggle(id)`
- Click delete button → Delete todo via `onDelete(id)`

#### TaskList Component

**Component**: `components/todo/TaskList.tsx`

**Props**:
```typescript
interface TaskListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Features**:
- Render list of TaskCard components
- Empty state message when no todos
- Optional: Sort/filter controls (future enhancement)

#### TaskForm Component

**Component**: `components/todo/TaskForm.tsx` (Dialog-based)

**Props**:
```typescript
interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
  editingTodo?: Todo;  // If provided, form is in edit mode
}
```

**Features**:
- Input field for title (1-200 chars)
- Textarea for description (optional, max 1000 chars)
- Validation error messages
- Cancel and Submit buttons
- Modal overlay

**Interactions**:
- Submit with valid data → Call `onSubmit()` with todo object
- Click Cancel → Call `onClose()`
- Click overlay → Call `onClose()`

#### use-mock-todos Hook

**Hook**: `hooks/use-mock-todos.ts`

**Returns**:
```typescript
interface UseMockTodosReturn {
  todos: Todo[];
  addTask: (title: string, description?: string) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Todo>) => void;  // Optional
}
```

**Behavior**:
- `addTask`: Creates new Todo with `id`, `createdAt`, `completed: false`
- `deleteTask`: Removes Todo by ID from array
- `toggleTask`: Flips `completed` status
- `updateTask`: Updates Todo fields (optional enhancement)

**Storage**: In-memory (React state), no persistence (per spec)

### API Contracts

Since this phase is UI-only with local state, there are no API contracts. Future phases will define REST/GraphQL contracts for backend integration.

### Quickstart Guide

```markdown
# Quickstart: Todo UI Pages

## Prerequisites

- Node.js 18+ installed
- Next.js 16+ project initialized in `phase-2/frontend/`

## Installation

1. Install Shadcn UI:
   ```bash
   cd phase-2/frontend
   npx shadcn-ui@latest init
   ```

2. Install required Shadcn components:
   ```bash
   npx shadcn-ui@latest add button card input dialog badge separator
   ```

3. Install next-themes:
   ```bash
   npm install next-themes
   ```

## Project Structure Setup

```bash
mkdir -p components/layout components/todo hooks lib
```

## Implementation Steps

### 1. Theme Setup (Root Layout)

Wrap root layout in ThemeProvider:
```typescript
// app/layout.tsx
import { ThemeProvider } from "next-themes"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 2. Create Navigation Bar

```bash
touch components/layout/Navbar.tsx
```

Implement navigation with links and theme toggle button.

### 3. Create Home Page

```bash
# Already exists at app/page.tsx - update with welcome content
```

Add welcome message and "Get Started" button linking to `/todos`.

### 4. Create Todo Dashboard

```bash
mkdir -p app/todos
touch app/todos/page.tsx
```

Implement dashboard with TaskList and TaskForm components.

### 5. Create Todo Components

```bash
touch components/todo/TaskCard.tsx
touch components/todo/TaskList.tsx
touch components/todo/TaskForm.tsx
```

Implement each component using Shadcn UI components.

### 6. Create use-mock-todos Hook

```bash
touch hooks/use-mock-todos.ts
```

Implement local state management with addTask, deleteTask, toggleTask functions.

### 7. Tailwind Configuration

Update `tailwind.config.ts` to include theme colors:

```typescript
colors: {
  border: "hsl(var(--border))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  // ... add more theme colors
}
```

### 8. Global Styles

Update `app/globals.css` with CSS variables for theme colors:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... light mode colors */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode colors */
  }
}
```

## Running the Application

```bash
cd phase-2/frontend
npm run dev
```

Visit:
- Home page: http://localhost:3000
- Todo dashboard: http://localhost:3000/todos

## Testing Theme Toggle

1. Click sun/moon icon in navigation bar
2. Verify theme switches instantly (< 200ms)
3. Refresh page and verify theme preference persists
4. Check browser DevTools to see theme class applied to `html` element

## Next Steps

After completing this UI foundation:
- Integrate with backend API (future phase)
- Add authentication (JWT via Better Auth)
- Implement advanced features (search, filter, sort)
```

### File Generation Summary

**Created**:
- `specs/002-todo-ui-pages/research.md` (this section)
- `specs/002-todo-ui-pages/data-model.md` (Todo and Theme entities)
- `specs/002-todo-ui-pages/quickstart.md` (implementation guide)
- `specs/002-todo-ui-pages/contracts/` (entity schemas)

---

## Post-Phase 1 Constitution Re-check

✅ All gates still justified:
- UI-only phase aligned with spec "Out of Scope"
- Technology decisions comply with Next.js requirement
- No unauthorized architecture changes
- Ready for Phase 2 task generation

---

## Next Phase

Proceed to `/sp.tasks` to generate actionable, dependency-ordered tasks based on this plan.
