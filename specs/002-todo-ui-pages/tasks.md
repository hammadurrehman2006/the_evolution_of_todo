---
description: "Task list for Todo UI Pages implementation"
---

# Tasks: Todo UI Pages

**Input**: Design documents from `/specs/002-todo-ui-pages/`
**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Tests**: Not requested - no test tasks included

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to `phase-2/frontend/` directory.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, Shadcn UI setup, and next-themes configuration

- [X] T001 Install Shadcn UI dependencies by running `npx shadcn-ui@latest init` in phase-2/frontend/ directory (select Default style, Slate color, use CSS variables)
- [X] T002 Install required Shadcn UI components: button, card, input, dialog, badge, separator, textarea using `npx shadcn-ui@latest add` in phase-2/frontend/
- [X] T003 Install next-themes package using `npm install next-themes` in phase-2/frontend/
- [X] T004 Create project directory structure: `mkdir -p components/layout components/todo hooks lib` in phase-2/frontend/
- [X] T005 Configure Tailwind CSS for dark mode by setting `darkMode: ["class"]` in phase-2/frontend/tailwind.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create TypeScript type definitions file at phase-2/frontend/lib/types.ts with Todo interface (id: string, title: string, description?: string, completed: boolean, createdAt: Date, updatedAt?: Date)
- [X] T007 Add global CSS theme variables to phase-2/frontend/app/globals.css with light and dark mode color definitions (--background, --foreground, --primary, --secondary, --muted, --accent, --destructive, --border, --ring for both :root and .dark)
- [X] T008 Wrap root layout with ThemeProvider in phase-2/frontend/app/layout.tsx (import from next-themes, set attribute="class", defaultTheme="system", enableSystem, disableTransitionOnChange, add suppressHydrationWarning to html tag)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 2 - Main Navigation and Theme Toggle (Priority: P1) 🎯

**Goal**: Implement persistent navigation bar with theme toggle functionality that works across all pages

**Independent Test**: Visit any page and verify navigation bar is present with Home/Todos links and theme toggle button. Click theme toggle and verify instant theme switch without page reload. Navigate between pages and verify theme preference is maintained.

### Implementation for User Story 2

- [X] T009 [US2] Create Navbar component at phase-2/frontend/components/layout/Navbar.tsx with "use client" directive, navigation links (Home → "/", Todos → "/todos") using next/link, and theme toggle button using useTheme hook from next-themes with sun/moon icons styled with Tailwind CSS
- [X] T010 [US2] Style Navbar component with Tailwind CSS: responsive flexbox layout, border-bottom, bg-background, fixed height (h-16), max-width container (max-w-7xl), spacing between items, hover effects on buttons, mobile-responsive with accessible navigation

**Checkpoint**: At this point, Navigation and Theme Toggle should be fully functional across all pages

---

## Phase 4: User Story 1 - Landing Page Experience (Priority: P1)

**Goal**: Implement welcoming landing page that introduces the application and provides clear navigation to Todo dashboard

**Independent Test**: Visit root URL (/) and verify welcome message explaining application purpose is displayed. Verify prominent "Get Started" button/link to Todo dashboard is present. Verify page is visually consistent with overall design using Shadcn Card component.

### Implementation for User Story 1

- [X] T011 [US1] Update Home page at phase-2/frontend/app/page.tsx with centered layout, Shadcn Card component containing welcome title "Welcome to Todo App", description paragraph explaining application purpose, and "Get Started" button using Shadcn Button component linking to /todos, styled with Tailwind CSS for responsive design
- [X] T012 [US1] Style Home page with Tailwind CSS: min-h-screen flex layout, centered content (items-center justify-center), bg-background, responsive padding, max-width container (max-w-3xl), proper spacing between elements

**Checkpoint**: At this point, Landing Page should be fully functional and provide clear entry point to application

---

## Phase 5: User Story 3 - Todo Dashboard Page (Priority: P1) 🎯 MVP

**Goal**: Implement main Todo dashboard interface where users can view, manage, and interact with todos using local state

**Independent Test**: Navigate to /todos and verify clean, organized interface displays. Verify "Add Todo" button opens dialog form. Add a todo and verify it appears in the list. Toggle completion status and verify visual update. Delete a todo and verify it's removed. Verify empty state message when no todos exist.

### Data Layer for User Story 3

- [X] T013 [P] [US3] Create use-mock-todos hook at phase-2/frontend/hooks/use-mock-todos.ts with "use client" directive, useState for todos array (type Todo[]), initial sample todos, and functions: addTask(title, description?), deleteTask(id), toggleTask(id) using useCallback for performance, generating UUIDs with crypto.randomUUID()

### UI Components for User Story 3

- [X] T014 [P] [US3] Create TaskCard component at phase-2/frontend/components/todo/TaskCard.tsx with "use client" directive, props (todo: Todo, onToggle: (id: string) => void, onDelete: (id: string) => void), Shadcn Card with title/description display, completion Badge (Done/Pending), "Mark Complete/Incomplete" Button and "Delete" Button, styled with Tailwind CSS with hover effects and line-through for completed tasks
- [X] T015 [P] [US3] Create TaskList component at phase-2/frontend/components/todo/TaskList.tsx with "use client" directive, props (todos: Todo[], onToggle, onDelete), map over todos array rendering TaskCard components, empty state message when todos.length === 0, styled with Tailwind CSS responsive grid/list layout
- [X] T016 [P] [US3] Create TaskForm component at phase-2/frontend/components/todo/TaskForm.tsx with "use client" directive, props (isOpen: boolean, onClose: () => void, onSubmit: (title, description?) => void), Shadcn Dialog with Input for title (maxLength 200 with character counter), Textarea for description (maxLength 1000 with character counter), validation (title required, min 1 char), Cancel and Submit buttons using Shadcn Button, styled with Tailwind CSS form layout

### Page Assembly for User Story 3

- [X] T017 [US3] Create Todo dashboard page at phase-2/frontend/app/todos/page.tsx with "use client" directive, import and use useMockTodos hook, useState for dialog open state, header showing "My Todos" title and active task count, "Add Todo" button, TaskList component with todos and handlers, TaskForm component with dialog state and submit handler, styled with Tailwind CSS responsive layout (max-w-4xl container, proper spacing)

**Checkpoint**: At this point, Todo Dashboard should be fully functional with complete CRUD operations on local todos

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements, accessibility improvements, and responsive design verification

- [X] T018 [P] Add ARIA labels to theme toggle button and all icon-only buttons for screen reader accessibility
- [X] T019 [P] Verify keyboard navigation works for all interactive elements (Tab, Enter, Escape)
- [X] T020 [P] Test responsive design at mobile breakpoint (≤ 768px) and verify navigation remains accessible
- [X] T021 [P] Add loading states and smooth transitions where appropriate with Tailwind CSS transition utilities
- [X] T022 Verify all Tailwind CSS color combinations meet WCAG 2.2 AA contrast ratio requirements (4.5:1 for text)
- [X] T023 Test theme toggle performance (< 200ms) and verify no visual jarring or layout shifts occur
- [X] T024 Add favicon and update metadata in phase-2/frontend/app/layout.tsx

---

## Implementation Strategy

### MVP Scope (Minimal Viable Product)

**User Story 2 (Navigation & Theme)** + **User Story 3 (Todo Dashboard)** = Functional MVP

Rationale:
- User Story 2 provides essential navigation and theme infrastructure
- User Story 3 delivers core todo functionality
- User Story 1 (Landing Page) is nice-to-have for onboarding but not essential for MVP

### Development Phases

1. **Phase 1-2 (Setup & Foundation)**: Complete all tasks sequentially (T001-T008)
2. **Phase 3 (Navigation)**: Implement User Story 2 (T009-T010)
3. **Phase 4 (Landing Page)**: Can be implemented in parallel with Phase 5 if desired
4. **Phase 5 (Todo Dashboard)**: Implement User Story 3 (T013-T017) - data layer tasks (T013) can run in parallel with UI component tasks (T014-T016)
5. **Phase 6 (Polish)**: All tasks can run in parallel (T018-T024)

### Parallel Execution Opportunities

#### During Phase 5 (Todo Dashboard):
- **Parallel Group A**: T013 (use-mock-todos hook)
- **Parallel Group B**: T014 (TaskCard), T015 (TaskList), T016 (TaskForm) - all can be built simultaneously
- **Sequential**: T017 (Dashboard page assembly) depends on completion of T013-T016

#### During Phase 6 (Polish):
- All polish tasks (T018-T024) can run in parallel

### Dependencies

```
T001 → T002 → T003 → T004 → T005 (Setup phase - sequential)
    ↓
T006 → T007 → T008 (Foundation phase - sequential)
    ↓
    ├─→ T009 → T010 (US2: Navigation - sequential)
    │
    ├─→ T011 → T012 (US1: Landing Page - sequential)
    │
    └─→ T013 (US3: Data layer)
        ├─→ T014 (US3: TaskCard) ─┐
        ├─→ T015 (US3: TaskList) ─┼─→ T017 (US3: Dashboard page)
        └─→ T016 (US3: TaskForm) ─┘
            ↓
        T018-T024 (Polish - all parallel)
```

### User Story Completion Order

1. **User Story 2** (Navigation & Theme) - MUST complete first (provides infrastructure)
2. **User Story 1** (Landing Page) OR **User Story 3** (Todo Dashboard) - Can be done in either order
   - Recommended: Complete User Story 3 first for functional MVP
   - User Story 1 can be added later for better onboarding

### Incremental Delivery

Each user story represents a shippable increment:

1. **After User Story 2**: Users can navigate and toggle themes (basic infrastructure)
2. **After User Story 2 + 3**: Users have a fully functional todo application (MVP)
3. **After User Story 2 + 3 + 1**: Users have polished onboarding experience (complete feature)

---

## Task Summary

- **Total Tasks**: 24
- **Setup Phase**: 5 tasks (T001-T005)
- **Foundation Phase**: 3 tasks (T006-T008)
- **User Story 2 (Navigation & Theme)**: 2 tasks (T009-T010)
- **User Story 1 (Landing Page)**: 2 tasks (T011-T012)
- **User Story 3 (Todo Dashboard)**: 5 tasks (T013-T017)
- **Polish Phase**: 7 tasks (T018-T024)

**Parallel Opportunities**: 13 tasks marked with [P] can run in parallel with other tasks

**Independent Test Criteria**:
- US1: Landing page displays welcome message and navigation to dashboard
- US2: Navigation bar with theme toggle works across all pages, preference persists
- US3: Todo dashboard allows full CRUD operations with visual feedback

**Suggested MVP**: Complete User Story 2 (T009-T010) + User Story 3 (T013-T017) for functional todo application
