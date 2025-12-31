# Tasks: Professional Productivity Suite Frontend

**Input**: Design documents from `/specs/002-productivity-suite/`
**Created**: 2025-12-31
**Phase**: Tasks

## Dependencies

**Task Execution Order** (must be completed bottom-to-top):
```
Phase 4 (Advanced Task Features)
  └─> T034 [US4] - T038 - T040 - T041
Phase 3 (Advanced Search & Filter)
  └─> T030 [US5] - T031 - T032 - T033
Phase 2 (Dashboard & Task CRUD)
  └─> T015 [US2] - T016 - T017 - T018 - T019 - T020 - T021 - T022 - T023 - T024 - T025 - T026
Phase 1 (Landing Page)
  └─> T001 - T014
Phase 0 (Foundation & Setup)
  └─> T001 - T013
```

**Independent MVP**: Complete Phase 0 + Phase 1 for minimum viable product (US1 landing + US2 dashboard core)

## Phase 0: Foundation & Setup (Blocking - Must Complete Before Any User Stories)

- [ ] T001 Create phase-2/frontend directory structure with src/, tests/, public/
- [ ] T002 Initialize Next.js 16 project with App Router, TypeScript, and Tailwind CSS
- [ ] T003 Install and configure Flowbite component library (flowbite, not flowbite-react)
- [ ] T004 Install animation libraries: Framer Motion, GSAP, @gsap/react, Lenis
- [ ] T005 Configure TypeScript paths in tsconfig.json (@/* aliases)
- [ ] T006 Create Lyons Blue custom theme with Flowbite MCP (brand color #005871, Urban Steel #7B7B7A)
- [ ] T007 Configure Tailwind v4 and update postcss.config.mjs for theme integration
- [ ] T008 Create core hooks: useGSAPAnimations.ts, useFramerVariants.ts, useTheme.ts
- [ ] T009 Create lib/utils.ts with TypeScript type definitions
- [ ] T010 Initialize Next.js DevTools MCP for component tree health verification
- [ ] T011 [P] Set up uv monorepo and configure workspace for phase-2
- [ ] T012 Configure git pre-commit hooks for code quality enforcement
- [ ] T013 Create base layout.tsx with theme provider integration point

**Checkpoint**: Foundation ready - user story implementation can begin in parallel

## Phase 1: Landing Page (US1 - Priority P1) 🎯 MVP

**Story Goal**: A new user arrives at application landing page seeking a modern productivity solution. The page must showcase value proposition through an industrial design aesthetic, provide clear calls-to-action, and demonstrate key features through interactive previews.

**Independent Test**: Can be fully tested by visiting landing page URL and verifying visual fidelity, responsiveness, interactive elements, and theme switching capability. Delivers immediate value as a standalone marketing presence.

### Landing Page Components

- [ ] T001 Create landing page layout at src/app/page.tsx (root route)
- [ ] T002 Implement Hero component with GSAP timeline entry animations (title, subtitle, CTA)
- [ ] T003 Implement Lyons Blue (#005871) gradient background with Urban Steel (#7B7B7A) accents
- [ ] T004 Create HeroSection.tsx with value proposition text and animated elements
- [ ] T005 Implement feature previews section with interactive hover effects
- [ ] T006 Create GetStarted CTA button with Framer Motion spring animations
- [ ] T007 Integrate Flowbite Navbar component with theme toggle in landing page

### Animations & Interactivity

- [ ] T008 Configure Lenis for smooth inertial scrolling on landing page
- [ ] T009 Implement GSAP ScrollTrigger for parallax reveal effects on scroll
- [ ] T010 Add hover animations to feature preview cards (Framer Motion scale/opacity)
- [ ] T011 Create smooth page transitions for navigation (if multi-section landing)

### Theme & Branding

- [ ] T012 Implement theme toggle with zero-flicker (apply theme class before hydration)
- [ ] T013 Configure theme persistence via cookies (SameSite=Strict for security)
- [ ] T014 Verify WCAG 2.2 Level AA color contrast (4.5:1 minimum ratio) for Lyons Blue

### Responsive Design

- [ ] T015 Implement mobile-first responsive layout (Tailwind breakpoints: sm, md, lg, xl)
- [ ] T016 Verify touch-friendly interactive elements (44px min touch targets)
- [ ] T017 Test horizontal scrolling on mobile devices

### Testing

- [ ] T018 [QA-Ver] Create Playwright E2E test for landing page accessibility (WCAG 2.2)
- [ ] T019 [QA-Ver] Create Playwright smoke test for theme switching (light → dark → system)
- [ ] T020 Verify responsive layout across viewport sizes (mobile, tablet, desktop)

---

**Checkpoint**: Landing page MVP complete - independently testable with visual polish and theme support

## Phase 2: Dashboard Task Management (US2 - Priority P1) 🎯 MVP

**Story Goal**: A user signs into dashboard to manage their tasks. They need to see their tasks organized by relevance (due date, priority, completion status) and perform core operations: create, read, update, and delete tasks. The interface must provide real-time feedback on all actions and maintain task state without data loss.

**Independent Test**: Can be fully tested by creating an account, signing in, and performing complete CRUD workflows (create 5 tasks, edit 3, complete 2, delete 1). Delivers immediate value as a functional task manager.

### Dashboard Layout

- [ ] T015 [US2] Create dashboard page at src/app/dashboard/page.tsx
- [ ] T016 [US2] Implement dashboard layout with sidebar navigation
- [ ] T017 [US2] Create DashboardLayout.tsx with ThemeProvider and UserContext integration
- [ ] T018 [US2] Integrate Flowbite Sidebar component with navigation links

### Core Components

- [ ] T019 [US2] Create TaskCard.tsx component with Framer Motion checkmark animation
- [ ] T020 [US2] Implement TaskCard with task metadata display (title, description, due date, priority badge)
- [ ] T021 [US2] Add Framer Motion AnimatePresence for task add/remove animations
- [ ] T022 [US2] Implement delete button with undo confirmation toast
- [ ] T023 [US2] Create TaskList.tsx component with list rendering and state management

### Task CRUD Operations

- [ ] T024 [US2] Create TaskFormModal.tsx using Flowbite Modal component wrapper
- [ ] T025 [US2] Implement task creation form (title 1-200 chars, description up to 1000 chars, required)
- [ ] T026 [US2] Add task edit form pre-populated with existing task data
- [ ] T027 [US2] Implement form validation (client-side before server submission)
- [ ] T028 [US2] Create useActionState hooks for optimistic UI updates
- [ ] T029 [US2] Implement task deletion with confirmation or undo mechanism

### State Management

- [ ] T030 [US2] Implement granular useState for form inputs (title, description, etc.)
- [ ] T031 [US2] [Code-Builder] Use useMemo for filtered task lists (prevent re-renders)
- [ ] T032 [US2] [Code-Builder] Use React.memo() for TaskCard component (memo optimization)
- [ ] T033 [US2] Implement Server Actions for create/update/delete mutations

### Animations

- [ ] T034 [US2] [Code-Builder] Implement Framer Motion variants for micro-interactions (hover, click, focus)
- [ ] T035 [US2] Add GSAP timeline entry animation for dashboard section (sidebar, task list)
- [ ] T036 [US2] Configure Lenis for smooth scrolling in task list

### Dashboard Metrics

- [ ] T037 [US2] Create DashboardMetrics.tsx component showing completion statistics
- [ ] T038 [US2] Implement progress bar with animated percentage
- [ ] T039 [US2] Display task counts (total, completed, pending, overdue)

### Accessibility

- [ ] T040 [QA-Ver] Create Playwright E2E test for keyboard navigation through dashboard
- [ ] T041 [QA-Ver] Verify ARIA labels on all interactive elements
- [ ] T042 [QA-Ver] Test tab order and focus management in task list

---

**Checkpoint**: Dashboard CRUD MVP complete - user can manage tasks independently

## Phase 3: Task Organization & Prioritization (US3 - Priority P2)

**Story Goal**: A user has accumulated multiple tasks and needs to organize them effectively. They require ability to assign priority levels (Low, Medium, High, Critical), categorize tasks with tags, and filter their view to focus on specific subsets. The interface must make it easy to update organization attributes without opening task details.

**Independent Test**: Can be fully tested by creating 20 diverse tasks, assigning various priorities and tags, then filtering by each attribute independently and in combination. Delivers value by enabling task focus.

### Priority System

- [ ] T043 [US3] [Code-Builder] Create PriorityBadge.tsx component with color coding
- [ ] T044 [US3] Map priority colors (Critical=red, High=orange, Medium=yellow, Low=green)
- [ ] T045 [US3] Implement priority dropdown in TaskFormModal
- [ ] T046 [US3] Add priority sorting functionality (Critical → High → Medium → Low)
- [ ] T047 [US3] Add Framer Motion animation on priority badge changes

### Tag System

- [ ] T048 [US3] Create TagList.tsx component with horizontal scrollable list
- [ ] T049 [US3] Implement tag selection in TaskFormModal (multi-select)
- [ ] T050 [US3] Create tag creation dialog for new tags
- [ ] T051 [US3] Add tag filtering to TaskList (filter by tag ID)
- [ ] T052 [US3] Implement tag visual indicators (color badges) on task cards

### Filter Controls

- [ ] T053 [US3] [Code-Builder] Create FilterBar.tsx component
- [ ] T054 [US3] Implement status filter dropdown (active, completed, all)
- [ ] T055 [US3] Add priority filter multi-select (checkboxes)
- [ ] T056 [US3] Create tag filter pill buttons (selected state indicator)
- [ ] T057 [US3] Add "Clear All Filters" button with visual confirmation

### Enhanced Task List

- [ ] T058 [US3] Update TaskList.tsx to support combined filtering (status + priority + tags)
- [ ] T059 [US3] Implement filter state persistence (URL query params)
- [ ] T060 [US3] Add empty state message when no tasks match filters
- [ ] T061 [US3] Show active filter count indicator

### Due Date Display

- [ ] T062 [US3] Add due date display to TaskCard
- [ ] T063 [US3] Implement overdue indicator (red badge) for tasks past due date
- [ ] T064 [US3] Add relative date display (e.g., "Due in 2 days")

---

**Checkpoint**: Task organization complete - users can prioritize and categorize tasks

## Phase 4: Advanced Task Features (US4 - Priority P2)

**Story Goal**: A user needs to manage tasks with temporal awareness and recurring requirements. They must be able to set due dates using an interactive calendar picker, configure tasks to repeat on schedules (daily, weekly, monthly), and receive browser notifications when tasks become due. The system must handle recurrence automatically and ensure users never miss important deadlines.

**Independent Test**: Can be fully tested by creating tasks with due dates and recurrence settings, advancing system time, and verifying browser notifications trigger. Delivers value by automating recurring workflows.

### Due Date Picker

- [ ] T065 [US4] [Code-Builder] Install and configure date picker component (react-datepicker or flatpickr)
- [ ] T066 [US4] [Code-Builder] Integrate date picker into TaskFormModal
- [ ] T067 [US4] Implement date + time selection with timezone support
- [ ] T068 [US4] Add validation for past dates (cannot select yesterday as due date)

### Recurrence Configuration

- [ ] T069 [US4] Create RecurrenceSettings component in TaskFormModal
- [ ] T070 [US4] [Code-Builder] Implement interval dropdown (daily, weekly, monthly, custom)
- [ ] T071 [US4] Add end condition selection (none, date, occurrences count)
- [ ] T072 [US4] Create recurrence preview text ("Repeats weekly, ends on Jan 31")
- [ ] T073 [US4] Save recurrence settings to task entity

### Browser Notifications

- [ ] T074 [US4] [Code-Builder] Implement Notification API integration (Notification.requestPermission)
- [ ] T075 [US4] [Code-Builder] Create notification permission request button in UserContext
- [ ] T076 [US4] Set up browser notification scheduler for due date alerts
- [ ] T077 [US4] Implement notification sound and vibration options
- [ ] T078 [US4] Add dismiss notification action (mark complete, view task)
- [ ] T079 [QA-Ver] Create Playwright E2E test for notification triggering at due time

### Recurring Task Logic

- [ ] T080 [US4] [Code-Builder] Implement server action to create next recurring task instance
- [ ] T081 [US4] Add logic to update lastGenerated timestamp in RecurrenceSchedule
- [ ] T082 [US4] Validate recurrence constraints (e.g., no Feb 29 for monthly on non-leap years)
- [ ] T083 [US4] Update TaskCard to show recurring indicator (circular arrow icon)

### Timezone Support

- [ ] T084 [US4] [Code-Builder] Add timezone selector in UserPreferences settings
- [ ] T085 [US4] Implement timezone-aware due date display (convert UTC to local)
- [ ] T086 [US4] Update recurrence to respect user's selected timezone

---

**Checkpoint**: Advanced task features complete - full productivity suite with temporal awareness

## Phase 5: Search, Filter, and Sort (US5 - Priority P3)

**Story Goal**: A user manages a large collection of tasks and needs to locate or organize specific subsets quickly. They require to ability to search by text, filter by multiple criteria (status, priority, tags, due date), and sort by various attributes (due date, priority, creation date). The interface must support combining multiple filters and provide clear indicators of active filters.

**Independent Test**: Can be fully tested by creating 100 diverse tasks, then testing every search query, filter combination, and sort option to ensure accurate and performant results. Delivers value by enabling efficient task retrieval.

### Search Functionality

- [ ] T087 [US5] [Code-Builder] Create search input in FilterBar.tsx
- [ ] T088 [US5] [Code-Builder] Implement debounced search (500ms delay to prevent excessive filtering)
- [ ] T089 [US5] [Code-Builder] Add search across title, description, and tags
- [ ] T090 [US5] Highlight search terms in task cards (Framer Motion scale on match)
- [ ] T091 [US5] Show "X results found" message for empty search

### Enhanced Filtering

- [ ] T092 [US5] [Code-Builder] Add due date range picker to FilterBar
- [ ] T093 [US5] Implement due date range filtering (start date to end date)
- [ ] T094 [US5] [Code-Builder] Combine all filters (status + priority + tags + due date range)
- [ ] T095 [US5] Add filter persistence to URL query params (shareable filters)
- [ ] T096 [US5] Show active filter badges on FilterBar

### Sorting Options

- [ ] T097 [US5] [Code-Builder] Add sort dropdown to FilterBar (due date, priority, creation date, updated date, completion date)
- [ ] T098 [US5] Implement ascending/descending toggle
- [ ] T099 [US5] Add sort direction icon indicator
- [ ] T100 [US5] Persist sort preference to URL query params

### Large List Performance

- [ ] T101 [US5] [Code-Builder] Implement virtualization for 1,000+ tasks (react-window) if benchmarks fail
- [ ] T102 [US5] Add pagination or infinite scroll for large task sets
- [ ] T103 [US5] [Code-Builder] Optimize useMemo for filtered/sorted results (caching)
- [ ] T104 [QA-Ver] Create Playwright performance test for 10,000 task rendering

---

**Checkpoint**: Search/Filter/Sort complete - efficient task retrieval for large datasets

## Phase 6: Polish & Accessibility (Cross-Cutting)

- [ ] T105 [QA-Ver] Run full Playwright E2E suite for WCAG 2.2 Level AA compliance
- [ ] T106 [QA-Ver] Create keyboard navigation test (Tab, Enter, Escape keys)
- [ ] T107 [QA-Ver] Test screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] T108 [QA-Ver] Verify color contrast ratios with axe DevTools
- [ ] T109 [Code-Builder] Add ARIA landmarks (main, nav, search) for screen readers
- [ ] T110 [Code-Builder] Fix all layout issues from accessibility audit
- [ ] T111 [Code-Builder] Optimize animation performance (60fps target maintained)
- [ ] T112 [Code-Builder] Add loading skeleton states for better perceived performance
- [ ] T113 [QA-Ver] Create smoke test for all critical user journeys
- [ ] T114 Run production build verification (npm run build) - ensure zero errors
- [ ] T115 Verify bundle size within acceptable limits (monitor with next build --stats)

---

**All Phases Complete**: Professional Productivity Suite frontend ready for deployment

## Task Summary

**Total Tasks**: 115
**Tasks Per User Story**:
- Phase 0: 13 tasks (foundation)
- Phase 1 (US1): 20 tasks (landing page)
- Phase 2 (US2): 21 tasks (dashboard CRUD)
- Phase 3 (US3): 20 tasks (organization)
- Phase 4 (US4): 20 tasks (advanced features)
- Phase 5 (US5): 20 tasks (search/filter/sort)
- Phase 6: 11 tasks (polish)

**Specialist Assignments**:
- @code-builder: T024, T025, T026, T027, T028, T034, T043, T044, T050, T053, T058, T059, T087, T088, T090, T092, T093, T098, T099, T101, T102, T103, T111, T112
- @devops-specialist: T002, T011, T007
- @qa-verifier: T018, T020, T040, T041, T079, T084, T105, T106, T107, T108, T109, T110, T113

**Parallel Opportunities**:
- T001-T014: Phase 0 setup can run parallel with US1 landing page (different directories)
- T019-T023: Dashboard components (TaskCard, TaskList, TaskFormModal) - parallelizable with different files
- T043-T052: Filter bar and enhanced list features - parallelizable (different components)

**Independent MVP Scope**:
- Phase 0 + Phase 1 = 33 tasks (US1 landing page + US2 dashboard core)
- Creates minimum viable product: Users can visit landing, navigate to dashboard, create/edit/delete tasks

**MVP Alternative** (if tighter timeline needed):
- US1 only (Phase 1): 20 tasks - landing page without dashboard
- US2 only (Phase 2): 21 tasks - dashboard with mock data (no landing page)

---

**Ready for @code-builder**: All implementation tasks defined with clear file paths
**Ready for @qa-verifier**: Testing strategy with Playwright and accessibility validation
**Ready for @devops-specialist**: uv monorepo and Tailwind v4 configuration tasks specified
