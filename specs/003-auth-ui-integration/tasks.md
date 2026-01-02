# Tasks: Better Auth UI Integration for Navbar

**Input**: Design documents from `/specs/003-auth-ui-integration/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Tests are **NOT requested** in the specification. Focus is on establishing UI structure only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `phase-2/frontend/` for Next.js 16+ frontend
- All paths are absolute from repository root
- No backend tasks in this phase (client-side only)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and configure testing infrastructure

- [x] T001 Install better-auth package in phase-2/frontend/ using npm
- [ ] T002 [P] Install Vitest and testing dependencies (@testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom, @vitest/ui) in phase-2/frontend/
- [x] T003 [P] Add Shadcn Avatar component using `npx shadcn@latest add avatar` in phase-2/frontend/
- [ ] T004 [P] Create vitest.config.ts in phase-2/frontend/ with jsdom environment and path aliases
- [ ] T005 [P] Add test scripts to phase-2/frontend/package.json (test, test:ui, test:coverage, test:watch)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth client infrastructure that MUST be complete before ANY user story UI can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create phase-2/frontend/lib/auth-client.ts with createAuthClient() configuration
- [x] T007 Add error suppression handler in auth-client.ts for expected 404 responses
- [x] T008 Export useSession hook from auth-client.ts for component consumption
- [ ] T009 [P] Create phase-2/frontend/__tests__/setup.ts with global test configuration
- [ ] T010 [P] Create phase-2/frontend/__tests__/fixtures/auth-mocks.ts with mock session data (logged in with/without image, logged out, loading, error states)

**Checkpoint**: Auth client and testing foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Authentication Status in Navbar (Priority: P1) 🎯 MVP

**Goal**: Display authentication status in navbar immediately on page load. Logged out users see "Sign In" and "Sign Up" buttons. Logged in users see circular user avatar.

**Independent Test**: Load application homepage → Navbar displays "Sign In" and "Sign Up" buttons (because no backend session) → Click buttons → Console logs appear

**Acceptance Criteria (from spec.md)**:
- ✅ New visitor sees "Sign In" and "Sign Up" buttons
- ✅ Active session (mocked) shows circular user avatar instead of buttons
- ✅ Profile picture displays in avatar if available
- ✅ Initials display if no profile picture

### Implementation for User Story 1

- [x] T011 [P] [US1] Create phase-2/frontend/components/auth/LoginButton.tsx with Sign In and Sign Up buttons
- [x] T012 [P] [US1] Add console.log placeholder handlers for Sign In button click in LoginButton.tsx
- [x] T013 [P] [US1] Add console.log placeholder handlers for Sign Up button click in LoginButton.tsx
- [x] T014 [P] [US1] Create phase-2/frontend/components/auth/UserNav.tsx with Avatar component from Shadcn
- [x] T015 [US1] Implement getInitials() function in UserNav.tsx (handles special characters, emojis, null names)
- [x] T016 [US1] Add profile picture rendering in UserNav.tsx using AvatarImage component
- [x] T017 [US1] Add initials fallback in UserNav.tsx using AvatarFallback component
- [x] T018 [US1] Add default icon fallback in UserNav.tsx using Lucide User icon
- [x] T019 [US1] Modify phase-2/frontend/components/layout/Navbar.tsx to import useSession hook
- [x] T020 [US1] Add conditional rendering logic to Navbar.tsx (session ? UserNav : LoginButton)
- [x] T021 [US1] Add loading state handling in Navbar.tsx (show neutral state during isPending)
- [x] T022 [US1] Ensure theme toggle button remains functional in updated Navbar.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - navbar displays auth state and buttons log to console

---

## Phase 4: User Story 2 - Graceful Session State Handling (Priority: P2)

**Goal**: Handle loading states and errors gracefully so users never see broken UI elements or confusing states during session checks.

**Independent Test**: Load application → Observe navbar during session check → No flickering or layout shifts → Error states default to logged-out UI

**Acceptance Criteria (from spec.md)**:
- ✅ Navbar shows neutral loading state during session check (not logged-in or logged-out UI)
- ✅ Failed session checks default to logged-out state (Sign In/Sign Up buttons)
- ✅ Session state transitions update UI smoothly without flickering
- ✅ Avatar remains visible when navigating between pages

### Implementation for User Story 2

- [ ] T023 [P] [US2] Add loading skeleton component in Navbar.tsx for isPending state
- [ ] T024 [P] [US2] Implement error state handling in Navbar.tsx (error → show LoginButton)
- [ ] T025 [US2] Add CSS transitions to Navbar.tsx for smooth auth state changes (<200ms)
- [ ] T026 [US2] Prevent layout shifts by reserving space for auth components in Navbar.tsx
- [ ] T027 [US2] Add debouncing logic if session state changes rapidly (prevent flickering)
- [ ] T028 [US2] Verify session state persists across page navigation in Next.js App Router

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - navbar handles all loading/error states gracefully

---

## Phase 5: User Story 3 - Avatar Personalization (Priority: P3)

**Goal**: Avatar reflects user identity through profile picture or initials, providing personalized experience.

**Independent Test**: Mock different user profiles (with/without images, with/without names) → Verify avatar rendering logic for all cases

**Acceptance Criteria (from spec.md)**:
- ✅ Profile picture URL displays in circular frame
- ✅ Initials display when no profile picture (first letter of first + last name)
- ✅ Single name displays first letter only
- ✅ No name displays default placeholder icon
- ✅ Image load failure triggers automatic fallback to initials

### Implementation for User Story 3

- [ ] T029 [P] [US3] Handle image loading errors in UserNav.tsx with onError handler
- [ ] T030 [P] [US3] Implement initials generation for special characters (José García → JG)
- [ ] T031 [P] [US3] Implement initials generation for Chinese characters (李明 → 李明)
- [ ] T032 [P] [US3] Implement initials generation for emojis (🎨 Artist → 🎨A)
- [ ] T033 [P] [US3] Implement initials generation for hyphenated names (Jean-Paul Sartre → JS)
- [ ] T034 [P] [US3] Implement initials generation for three or more names (Mary Jane Watson → MW)
- [ ] T035 [P] [US3] Handle single character names (A → A)
- [ ] T036 [P] [US3] Handle extra whitespace in names (trim before processing)
- [ ] T037 [US3] Add memoization to getInitials() function to avoid recalculation
- [ ] T038 [US3] Test avatar fallback chain: profile picture → initials → default icon

**Checkpoint**: All user stories should now be independently functional - avatar handles all edge cases

---

## Phase 6: Testing & Validation

**Purpose**: Component tests to validate UI behavior (tests were identified in research but not mandated by spec)

- [ ] T039 [P] Create phase-2/frontend/__tests__/components/auth/LoginButton.test.tsx
- [ ] T040 [P] Test LoginButton renders Sign In and Sign Up buttons
- [ ] T041 [P] Test LoginButton logs to console when Sign In clicked
- [ ] T042 [P] Test LoginButton logs to console when Sign Up clicked
- [ ] T043 [P] Create phase-2/frontend/__tests__/components/auth/UserNav.test.tsx
- [ ] T044 [P] Test UserNav displays initials when no image
- [ ] T045 [P] Test UserNav displays profile picture when available
- [ ] T046 [P] Test UserNav displays default icon when no name
- [ ] T047 [P] Test UserNav handles image load errors with fallback
- [ ] T048 [P] Create phase-2/frontend/__tests__/components/layout/Navbar.test.tsx
- [ ] T049 [P] Test Navbar conditional rendering (session → UserNav, no session → LoginButton)
- [ ] T050 [P] Test Navbar loading state (isPending → skeleton)
- [ ] T051 [P] Test Navbar error state (error → LoginButton)
- [ ] T052 Run npm test to validate all component tests pass

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation

- [ ] T053 [P] Verify no console errors except expected 404 from /api/auth/get-session
- [ ] T054 [P] Validate navbar displays correctly on mobile viewport
- [ ] T055 [P] Check keyboard accessibility for LoginButton (Tab, Enter, Space)
- [ ] T056 [P] Check keyboard accessibility for UserNav dropdown
- [ ] T057 [P] Add aria-label attributes to auth components
- [ ] T058 [P] Verify theme toggle still works after navbar modifications
- [ ] T059 Verify Success Criteria SC-001: Navbar displays auth state within 500ms
- [ ] T060 Verify Success Criteria SC-004: State transitions within 200ms with no flickering
- [ ] T061 Run npm run build to ensure TypeScript compiles without errors
- [ ] T062 Follow quickstart.md validation checklist
- [ ] T063 Document expected behavior in code comments (placeholder buttons, null session default)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T005) completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational (T006-T010) completion
  - User stories can proceed in parallel (if staffed) or sequentially by priority
  - US1 (P1) → US2 (P2) → US3 (P3) recommended sequential order
- **Testing (Phase 6)**: Can run in parallel with implementation or after each story
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1 but independently testable

**Note**: All user stories are designed to be independently testable. US2 and US3 enhance US1 but don't break it if not implemented.

### Within Each User Story

**User Story 1**:
- T011-T013 (LoginButton) can run in parallel
- T014-T018 (UserNav) can run in parallel
- T019-T022 (Navbar integration) must run sequentially after components complete

**User Story 2**:
- T023-T028 can run independently (all modify Navbar.tsx sequentially or with careful merge)

**User Story 3**:
- T029-T036 (edge case handling) can run in parallel (different initials generation branches)
- T037-T038 (optimization + testing) run after edge cases complete

### Parallel Opportunities

- **Setup Phase**: T002, T003, T004, T005 can all run in parallel
- **Foundational Phase**: T009, T010 can run in parallel after T006-T008 complete
- **User Story 1**: T011-T013 in parallel, T014-T018 in parallel
- **User Story 3**: T029-T036 can all run in parallel (independent edge case branches)
- **Testing Phase**: All test creation tasks (T039-T051) can run in parallel
- **Polish Phase**: Most polish tasks (T053-T058) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch LoginButton component tasks together:
Task T011: "Create phase-2/frontend/components/auth/LoginButton.tsx"
Task T012: "Add console.log for Sign In button"
Task T013: "Add console.log for Sign Up button"

# Launch UserNav component tasks together:
Task T014: "Create phase-2/frontend/components/auth/UserNav.tsx"
Task T015: "Implement getInitials() function"
Task T016: "Add profile picture rendering"
Task T017: "Add initials fallback"
Task T018: "Add default icon fallback"
```

---

## Parallel Example: User Story 3

```bash
# Launch all edge case handling tasks together:
Task T030: "Special characters (José García → JG)"
Task T031: "Chinese characters (李明 → 李明)"
Task T032: "Emojis (🎨 Artist → 🎨A)"
Task T033: "Hyphenated names (Jean-Paul Sartre → JS)"
Task T034: "Three names (Mary Jane Watson → MW)"
Task T035: "Single character (A → A)"
Task T036: "Whitespace trimming"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005) → ~15 minutes
2. Complete Phase 2: Foundational (T006-T010) → ~30 minutes
3. Complete Phase 3: User Story 1 (T011-T022) → ~60 minutes
4. **STOP and VALIDATE**: Test navbar displays Sign In/Sign Up buttons, buttons log to console
5. **Total MVP Time**: ~2 hours

This delivers the core feature: navbar displays authentication status.

### Incremental Delivery

1. **MVP** (Phases 1-3): Navbar with auth buttons → Deploy/Demo
2. **Enhanced UX** (Phase 4): Add loading states and error handling → Deploy/Demo
3. **Personalization** (Phase 5): Add avatar edge case handling → Deploy/Demo
4. **Quality** (Phases 6-7): Tests and polish → Deploy/Demo
5. Each phase adds value without breaking previous functionality

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (~45 minutes)
2. Once Foundational is done:
   - Developer A: User Story 1 (T011-T022)
   - Developer B: User Story 2 (T023-T028) - can start in parallel
   - Developer C: User Story 3 (T029-T038) - can start in parallel
   - Developer D: Testing (T039-T052) - can start after US1 components ready
3. Stories complete and integrate independently

With this approach, the entire feature can be completed in **2-3 hours** with parallel work, or **3-4 hours** sequentially.

---

## Task Summary

**Total Tasks**: 63 tasks
- **Setup (Phase 1)**: 5 tasks
- **Foundational (Phase 2)**: 5 tasks (CRITICAL - blocks all stories)
- **User Story 1 (Phase 3)**: 12 tasks (MVP)
- **User Story 2 (Phase 4)**: 6 tasks
- **User Story 3 (Phase 5)**: 10 tasks
- **Testing (Phase 6)**: 14 tasks
- **Polish (Phase 7)**: 11 tasks

**Parallel Opportunities**: 45 tasks marked [P] can run in parallel (71% parallelizable)

**MVP Scope**: Phases 1-3 (T001-T022) = 22 tasks = ~2 hours implementation time

**Independent Test Criteria**:
- US1: Click Sign In/Sign Up buttons → console logs appear
- US2: Load page multiple times → no flickering or layout shifts
- US3: Mock different user profiles → avatar displays correctly for all cases

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability (US1, US2, US3)
- Each user story is independently completable and testable
- Tests are optional (not mandated by spec) but provided for quality assurance
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story independently
- Backend is NOT implemented in this phase - null session is expected default behavior
- Console logs for button clicks are placeholders (actual auth in future phase)
