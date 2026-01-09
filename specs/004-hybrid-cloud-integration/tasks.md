# Tasks: Hybrid Cloud Integration

**Input**: Design documents from `/specs/004-hybrid-cloud-integration/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in specification - focus on implementation and manual verification

**Organization**: Tasks are grouped by user story priority (P1, P2, P3) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to `phase-2/frontend/` directory:
- `lib/` - Utility libraries and API clients
- `hooks/` - React hooks
- `app/` - Next.js App Router pages
- `components/` - React components

---

## Phase 1: Setup (Environment & Infrastructure)

**Purpose**: Configure environment and verify backend connectivity

- [X] T001 Create `.env.example` template in `phase-2/frontend/.env.example`
- [X] T002 Create `.env.local` with NEXT_PUBLIC_API_URL and BETTER_AUTH_SECRET in `phase-2/frontend/.env.local`
- [X] T003 Verify backend API health endpoint at https://teot-phase2.vercel.app/api/health
- [X] T004 Document BETTER_AUTH_SECRET requirement in `phase-2/frontend/README.md`

---

## Phase 2: Foundational (API Client & Authentication)

**Purpose**: Core infrastructure for API communication and JWT authentication that BLOCKS all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### US2: Authenticated API Request Flow (Priority: P1) - Foundation

**Goal**: Establish automatic JWT token injection for all API requests

**Independent Test**: Inspect network requests in browser DevTools to verify Authorization header contains valid Bearer token; attempt API calls without token to confirm 401 responses

- [X] T005 [P] [US2] Add ApiError class and ApiResponse types to `phase-2/frontend/lib/types.ts`
- [X] T006 [P] [US2] Create centralized ApiClient class in `phase-2/frontend/lib/api-client.ts` with base URL configuration
- [X] T007 [US2] Implement JWT token retrieval from Better Auth session in ApiClient
- [X] T008 [US2] Implement fetch wrapper with automatic Authorization header injection in ApiClient
- [X] T009 [US2] Add error handling for 401/403/404/500 responses in ApiClient
- [X] T010 [US2] Add 10-second timeout configuration for API requests in ApiClient
- [X] T011 [US2] Implement 401 error handler that triggers logout/redirect in ApiClient
- [X] T012 [US2] Verify Better Auth JWT Plugin is enabled in `phase-2/frontend/lib/auth-client.ts`

**Checkpoint**: Foundation ready - API client can make authenticated requests with automatic JWT injection

---

## Phase 3: User Story 1 - Create Task with Cloud Persistence (Priority: P1) 🎯 MVP

**Goal**: Enable users to create tasks that persist immediately to the remote Neon PostgreSQL database

**Independent Test**: Create a task via UI, verify it appears in remote database by querying production API or checking database directly; refresh page and confirm task remains

### Implementation for User Story 1

- [X] T013 [P] [US1] Implement `createTodo(data)` method in `phase-2/frontend/lib/api-client.ts`
- [X] T014 [P] [US1] Implement `getTodos(filters?)` method in `phase-2/frontend/lib/api-client.ts`
- [X] T015 [P] [US1] Implement `getTodo(id)` method in `phase-2/frontend/lib/api-client.ts`
- [X] T016 [US1] Create `useTodos()` hook in `phase-2/frontend/hooks/use-todos.ts` with loading/error states
- [X] T017 [US1] Implement `addTask()` function in useTodos hook calling ApiClient.createTodo()
- [X] T018 [US1] Implement `getTasks()` function in useTodos hook calling ApiClient.getTodos()
- [X] T019 [US1] Add ISO 8601 date conversion (string → Date) in useTodos hook
- [X] T020 [US1] Update `phase-2/frontend/app/todos/page.tsx` to use useTodos() instead of useMockTodos()
- [X] T021 [US1] Add loading spinner UI in `phase-2/frontend/app/todos/page.tsx`
- [X] T022 [US1] Add error message display UI in `phase-2/frontend/app/todos/page.tsx`

**Checkpoint**: User Story 1 complete - users can create and view tasks that persist to remote database

---

## Phase 4: User Story 1 Extended - Update & Delete Operations (Priority: P1)

**Goal**: Complete CRUD operations for tasks (extending US1 for full task management)

**Independent Test**: Update a task's title/description/status and verify changes persist; delete a task and verify it's removed from remote database

### Implementation for User Story 1 Extended

- [X] T023 [P] [US1] Implement `updateTodo(id, data)` method in `phase-2/frontend/lib/api-client.ts`
- [X] T024 [P] [US1] Implement `deleteTodo(id)` method in `phase-2/frontend/lib/api-client.ts`
- [X] T025 [P] [US1] Implement `toggleTodo(id)` method in `phase-2/frontend/lib/api-client.ts`
- [X] T026 [US1] Implement `updateTask(id, updates)` function in useTodos hook
- [X] T027 [US1] Implement `deleteTask(id)` function in useTodos hook
- [X] T028 [US1] Implement `toggleTask(id)` function in useTodos hook
- [X] T029 [US1] Verify TaskForm component correctly calls useTodos.updateTask() for edits
- [X] T030 [US1] Verify TaskCard component correctly calls useTodos.deleteTask() and useTodos.toggleTask()

**Checkpoint**: User Story 1 fully complete - all CRUD operations work with remote API

---

## Phase 5: User Story 3 - Replace Local Mock Data with Remote API (Priority: P2)

**Goal**: Completely remove local mock data implementations, ensuring all operations use remote API exclusively

**Independent Test**: Search codebase for "mock" or "localStorage"; verify no active mock implementations; perform all CRUD operations and verify every operation results in API call

### Implementation for User Story 3

- [X] T031 [US3] Remove `phase-2/frontend/hooks/use-mock-todos.ts` file
- [X] T032 [US3] Search for and remove any remaining localStorage calls for todos in codebase
- [X] T033 [US3] Verify no localStorage STORAGE_KEY references remain in `phase-2/frontend/` directory
- [X] T034 [US3] Update imports in `phase-2/frontend/app/todos/page.tsx` to remove useMockTodos references
- [X] T035 [US3] Add comment in useTodos hook documenting API-only data flow

**Checkpoint**: User Story 3 complete - zero local mock data remains; all operations use remote API

---

## Phase 6: User Story 4 - Session Management and Token Refresh (Priority: P3)

**Goal**: Handle JWT token expiration gracefully with automatic refresh or clear re-authentication prompts

**Independent Test**: Set short JWT expiration time; observe behavior as token expires; verify either automatic refresh or graceful redirect to login with clear message

### Implementation for User Story 4

- [X] T036 [US4] Add JWT token expiration check before API requests in ApiClient
- [X] T037 [US4] Implement token refresh attempt logic in ApiClient
- [X] T038 [US4] Add graceful error message for session expiration in ApiClient
- [X] T039 [US4] Test token expiration scenario with short-lived JWT
- [X] T040 [US4] Verify redirect to login page with clear expiration message

**Checkpoint**: User Story 4 complete - token expiration handled gracefully

---

## Phase 7: Verification & Polish

**Purpose**: Final verification that all requirements are met and documentation is complete

### Manual Verification (T-205 equivalent)

- [X] T041 Verify environment variables are correctly configured in `.env.local`
- [X] T042 Verify backend API health check returns 200 OK
- [X] T043 Verify user can log in and JWT token is obtained
- [X] T044 Verify creating a task sends POST request with Authorization header
- [X] T045 Verify created task appears in UI with server-generated ID
- [X] T046 Verify task persists after page refresh (fetched from API)
- [X] T047 Verify updating a task sends PUT request and updates UI
- [X] T048 Verify deleting a task sends DELETE request and removes from UI
- [X] T049 Verify toggling completion sends PATCH request and updates status
- [X] T050 Verify 401 error triggers logout and redirect to login
- [X] T051 Verify no localStorage calls for task data (code search)
- [X] T052 Verify network tab shows all requests include JWT Bearer token
- [X] T053 Verify task created on localhost is visible in remote Neon database

### Documentation & Polish

- [X] T054 [P] Update `phase-2/frontend/README.md` with setup instructions from quickstart.md
- [X] T055 [P] Document troubleshooting steps for common issues in README
- [X] T056 [P] Add API client usage examples to documentation
- [X] T057 Code cleanup: Remove console.logs and debug code
- [X] T058 Run TypeScript type checking: `npm run type-check`
- [X] T059 Run linter: `npm run lint`
- [X] T060 Final smoke test: Complete end-to-end user journey

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 1 Extended (Phase 4)**: Depends on Phase 3 completion
- **User Story 3 (Phase 5)**: Depends on Phase 4 completion (needs full CRUD working)
- **User Story 4 (Phase 6)**: Depends on Foundational completion (can be done in parallel with US1/US3 if staffed)
- **Verification (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 2 (P1)**: Foundation layer - implemented in Phase 2 - BLOCKS all other stories
- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Depends on User Story 1 completion (needs CRUD operations working)
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US3

### Within Each Phase

**Phase 2 (Foundational)**:
1. T005-T006 can run in parallel (different concerns)
2. T007-T011 must run sequentially (build on ApiClient base)
3. T012 can run independently

**Phase 3 (User Story 1)**:
1. T013-T015 can run in parallel (different API methods)
2. T016-T019 must run sequentially (build useTodos hook)
3. T020-T022 must run sequentially (update UI)

**Phase 4 (User Story 1 Extended)**:
1. T023-T025 can run in parallel (different API methods)
2. T026-T028 must run sequentially (extend useTodos hook)
3. T029-T030 can run in parallel (verify components)

**Phase 5 (User Story 3)**:
1. T031-T035 must run sequentially (cleanup process)

**Phase 6 (User Story 4)**:
1. T036-T040 must run sequentially (token refresh logic)

**Phase 7 (Verification)**:
1. T041-T053 should run sequentially (verification checklist)
2. T054-T056 can run in parallel (documentation)
3. T057-T060 must run sequentially (final cleanup)

### Parallel Opportunities

- **Phase 1**: T001-T004 can all run in parallel (independent setup tasks)
- **Phase 2**: T005 and T006 can run in parallel; T012 independent
- **Phase 3**: T013, T014, T015 can run in parallel
- **Phase 4**: T023, T024, T025 can run in parallel; T029 and T030 can run in parallel
- **Phase 7**: T054, T055, T056 can run in parallel

---

## Parallel Example: API Client Methods

```bash
# Launch all API method implementations in parallel:
Task T013: "Implement createTodo(data) method in lib/api-client.ts"
Task T014: "Implement getTodos(filters?) method in lib/api-client.ts"
Task T015: "Implement getTodo(id) method in lib/api-client.ts"

# These can be done simultaneously as they're independent methods in the same file
# by different developers or in separate sessions
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Foundation)

1. **Complete Phase 1**: Setup (T001-T004) → ~30 minutes
2. **Complete Phase 2**: Foundational (T005-T012) → ~2-3 hours
3. **Complete Phase 3**: User Story 1 - Read/Create (T013-T022) → ~2-3 hours
4. **Complete Phase 4**: User Story 1 Extended - Update/Delete (T023-T030) → ~2 hours
5. **STOP and VALIDATE**: Test User Story 1 fully - all CRUD operations work
6. **SUCCESS**: MVP is deployable - users can manage tasks with remote persistence

### Incremental Delivery

1. **Foundation Ready** (Phases 1-2): API client with authentication → ~3-4 hours
2. **MVP** (+ Phases 3-4): Full task CRUD with remote persistence → ~7-9 hours total
3. **Cleanup** (+ Phase 5): Mock data removed, codebase clean → ~8-10 hours total
4. **Polish** (+ Phase 6): Token refresh handled gracefully → ~9-11 hours total
5. **Production Ready** (+ Phase 7): All verification passed → ~10-12 hours total

### Parallel Team Strategy

With 2 developers after Foundational phase (Phase 2) completes:

- **Developer A**: User Story 1 (Phases 3-4) + User Story 3 (Phase 5)
- **Developer B**: User Story 4 (Phase 6) + Documentation (Phase 7 docs tasks)
- **Both**: Verification (Phase 7 verification tasks together)

**Estimated Total Time**: ~8-10 hours with 2 developers working in parallel

---

## Task Mapping to Specification

### User Story 1 (P1) - Create Task with Cloud Persistence
**Spec Requirements**: FR-001, FR-002, FR-012, FR-013
**Tasks**: T013-T030 (Phases 3-4)
**Success Criteria**: SC-001 (task visible in remote DB within 2 seconds), SC-005 (full CRUD operations)

### User Story 2 (P1) - Authenticated API Request Flow
**Spec Requirements**: FR-004, FR-005, FR-006, FR-009, FR-010, FR-011, FR-014
**Tasks**: T005-T012 (Phase 2 - Foundational)
**Success Criteria**: SC-002 (100% requests include JWT), SC-003 (401 for invalid tokens), SC-006 (auth errors handled), SC-008 (no localStorage access)

### User Story 3 (P2) - Replace Local Mock Data
**Spec Requirements**: FR-007, FR-008
**Tasks**: T031-T035 (Phase 5)
**Success Criteria**: SC-004 (zero local mock data), SC-007 (data matches remote DB)

### User Story 4 (P3) - Session Management and Token Refresh
**Spec Requirements**: FR-005 (JWT retrieval), FR-014 (error handling)
**Tasks**: T036-T040 (Phase 6)
**Success Criteria**: SC-006 (graceful auth error handling)

---

## Notes

- **[P] tasks**: Different files or independent concerns, no blocking dependencies
- **[Story] label**: Maps task to specific user story for traceability and independent testing
- **Exact file paths**: Every task includes the precise file location
- **Sequential execution**: Follow task order within each phase for logical dependency flow
- **Parallel execution**: Tasks marked [P] can be done simultaneously by different developers
- **Checkpoints**: Stop at each checkpoint to validate story independently before proceeding
- **MVP focus**: Phases 1-4 deliver a fully functional MVP (task CRUD with remote persistence)
- **Tests optional**: No test tasks included as not explicitly requested in specification
- **Manual verification**: Phase 7 includes comprehensive manual testing checklist (T041-T053)
- **Time estimates**: Total implementation time ~10-12 hours for experienced developer; ~8-10 hours with 2 developers in parallel

---

## Success Validation

After completing all tasks, verify all 8 success criteria from specification:

- ✅ **SC-001**: Task created on localhost appears in remote database within 2 seconds (T045, T046)
- ✅ **SC-002**: 100% of API requests include valid JWT Bearer token (T044, T052)
- ✅ **SC-003**: All requests without valid JWT rejected with 401 (T050)
- ✅ **SC-004**: Zero local mock data remains (T031-T033, T051)
- ✅ **SC-005**: Full CRUD operations with remote persistence (T045-T049)
- ✅ **SC-006**: Auth errors handled gracefully with redirect (T050)
- ✅ **SC-007**: Task data matches remote database (T046, T053)
- ✅ **SC-008**: No localStorage access for task operations (T051)

---

**Tasks Generated By**: Claude (Sonnet 4.5)
**Date**: 2026-01-04
**Total Tasks**: 60 atomic, executable tasks
**MVP Tasks**: 24 tasks (Phases 1-4)
**Status**: Ready for Implementation
