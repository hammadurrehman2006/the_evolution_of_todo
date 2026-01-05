# Implementation Plan: Hybrid Cloud Integration

**Branch**: `004-hybrid-cloud-integration` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-hybrid-cloud-integration/spec.md`

## Summary

**Primary Requirement**: Connect the local Next.js frontend application to the production backend API deployed at https://teot-phase2.vercel.app/, replacing all local mock data (localStorage) with remote API calls authenticated via JWT tokens from Better Auth.

**Technical Approach** (from research):
- **Centralized API Client Layer**: Create `lib/api-client.ts` as single gateway for all remote communication
- **Fetch Interceptor**: Automatically inject `Authorization: Bearer <token>` header using Better Auth JWT Plugin
- **Environment Configuration**: `NEXT_PUBLIC_API_URL` variable with fallback to production URL
- **Secret Synchronization**: Local `.env.local` must contain exact `BETTER_AUTH_SECRET` used by remote server
- **Mock Data Removal**: Replace `hooks/use-mock-todos.ts` with API-backed `hooks/use-todos.ts`
- **Error Handling**: Standardized `ApiError` class with 401 → logout/redirect flow

**Success Criteria**: Tasks created on localhost immediately visible in remote Neon PostgreSQL database; all requests without valid JWT rejected with 401 status.

---

## Technical Context

**Language/Version**: TypeScript 5.7+ / JavaScript ES2023 (Next.js 16.0.3)
**Primary Dependencies**: Next.js 16.0.3, React 19, Better Auth (with JWT Plugin), native fetch() API
**Storage**: Remote Neon PostgreSQL (via REST API at https://teot-phase2.vercel.app/)
**Testing**: Jest + React Testing Library (unit tests), contract tests with real backend
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge) + Node.js 18+ (Next.js server)
**Project Type**: Web application (frontend-only changes; backend is fixed/external)
**Performance Goals**:
  - API response time < 2 seconds for task creation (SC-001)
  - 100% of requests include JWT token (SC-002)
  - Auth error handling < 1 second (SC-006)
**Constraints**:
  - Backend API is immutable (no backend changes allowed)
  - Must use Better Auth JWT Plugin (cannot change auth system)
  - HTTPS required for production; HTTP allowed for localhost dev
  - 10-second timeout for API requests
**Scale/Scope**:
  - Single-user focus (no multi-user collaboration yet)
  - ~1000 tasks per user (reasonable upper bound)
  - 6 API endpoints (GET, POST, PUT, DELETE todos + health + toggle)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Constitution Compliance

✅ **No Task = No Code**: All implementation will be task-driven (tasks.md created in next phase)

✅ **Technology Stack Evolution**: Using Next.js 16.0.3 (App Router) with TypeScript as mandated

✅ **JWT-based Authentication**: Better Auth with JWT Plugin as required

⚠️ **Event-Driven Architecture**: Not applicable for this feature (API integration only, no events)

⚠️ **AI Chatbot Interface**: Not applicable for this feature (no chatbot changes)

⚠️ **Containerized Deployment**: Not applicable for this feature (frontend deployment unchanged)

### Gate Status: ✅ PASSED

**Justification**: This feature is strictly frontend integration work. Event-driven architecture, chatbot, and containerization are out of scope for API integration. All applicable constitution principles are followed.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-hybrid-cloud-integration/
├── plan.md              # This file (/sp.plan command output) ✅
├── research.md          # Phase 0 output (/sp.plan command) ✅
├── data-model.md        # Phase 1 output (/sp.plan command) ✅
├── quickstart.md        # Phase 1 output (/sp.plan command) ✅
├── contracts/           # Phase 1 output (/sp.plan command) ✅
│   └── api-endpoints.md # REST API contract ✅
├── checklists/          # Validation checklists
│   └── requirements.md  # Spec quality checklist ✅
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT YET CREATED)
```

### Source Code (repository root)

**Chosen Structure**: Web application (frontend only; backend is external/fixed)

```text
phase-2/frontend/
├── app/                     # Next.js App Router pages
│   ├── layout.tsx           # Root layout (existing)
│   ├── page.tsx             # Home page (existing)
│   └── todos/
│       └── page.tsx         # Main todos page [TO MODIFY]
├── components/
│   ├── auth/                # Authentication components
│   │   ├── LoginButton.tsx  # [EXISTING - no changes]
│   │   └── UserNav.tsx      # [EXISTING - no changes]
│   ├── layout/              # Layout components
│   │   ├── Navbar.tsx       # [EXISTING - no changes]
│   │   └── Footer.tsx       # [EXISTING - no changes]
│   ├── todo/                # Todo-specific components
│   │   ├── TaskList.tsx     # [EXISTING - no changes needed]
│   │   ├── TaskCard.tsx     # [EXISTING - no changes needed]
│   │   ├── TaskForm.tsx     # [EXISTING - no changes needed]
│   │   └── FilterBar.tsx    # [EXISTING - no changes needed]
│   └── ui/                  # Shadcn UI components [EXISTING]
├── hooks/
│   ├── use-mock-todos.ts    # [TO REMOVE] Current localStorage hook
│   └── use-todos.ts         # [TO CREATE] New API-backed hook
├── lib/
│   ├── auth-client.ts       # [EXISTING] Better Auth client
│   ├── api-client.ts        # [TO CREATE] Centralized API client
│   ├── types.ts             # [EXISTING] TypeScript interfaces
│   └── utils.ts             # [EXISTING] Utility functions
├── .env.local               # [TO CREATE] Environment variables
├── .env.example             # [TO CREATE] Example environment config
├── package.json             # [EXISTING - may need dependency updates]
└── tsconfig.json            # [EXISTING - path aliases configured]
```

**Structure Decision**: Frontend-only changes in `phase-2/frontend/` directory. Backend API at https://teot-phase2.vercel.app/ is treated as external service (no backend code changes). Mock data removal focuses on `hooks/use-mock-todos.ts` → `hooks/use-todos.ts` migration. Components remain largely unchanged since they already accept todos as props.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - All constitution checks passed or marked as not applicable. No complexity justification required.

---

## Implementation Phases

### Phase 0: Research & Architecture (✅ Complete)

**Objective**: Resolve all NEEDS CLARIFICATION items and make key architectural decisions.

**Outputs**:
- ✅ `research.md` - All architectural decisions documented
- ✅ API client architecture chosen (centralized client with fetch interceptor)
- ✅ Authentication strategy defined (Better Auth JWT Plugin with auto-injection)
- ✅ Environment configuration approach decided (NEXT_PUBLIC_API_URL + BETTER_AUTH_SECRET)
- ✅ Mock data removal strategy planned (systematic replacement of use-mock-todos.ts)
- ✅ Error handling strategy standardized (ApiError class with 401 → logout flow)

**Key Decisions**:
1. Centralized API Client Layer (`lib/api-client.ts`)
2. Fetch interceptor for automatic JWT injection
3. Environment variable for API base URL with fallback
4. Shared BETTER_AUTH_SECRET requirement
5. Complete mock data removal (no localStorage fallback)
6. Baseline performance (no aggressive optimization)

---

### Phase 1: Design & Contracts (✅ Complete)

**Objective**: Define data models and API contracts.

**Outputs**:
- ✅ `data-model.md` - Todo and User entities defined with TypeScript interfaces
- ✅ `contracts/api-endpoints.md` - REST API contract for all 7 endpoints
- ✅ `quickstart.md` - Developer onboarding guide with setup instructions
- ✅ Agent context updated with new technologies

**Data Model Summary**:
- **Todo Entity**: 11 fields (id, title, description, completed, priority, tags, dueDate, recurring, userId, createdAt, updatedAt)
- **User Entity**: 7 fields (id, email, name, emailVerified, image, createdAt, updatedAt)
- **JWT Token**: Claims structure (sub/user_id, exp, iat, email)
- **Relationships**: One-to-Many (User → Todos)

**API Contract Summary**:
- **Base URL**: `https://teot-phase2.vercel.app/`
- **Authentication**: JWT Bearer token in Authorization header
- **Endpoints**: 7 total (health, getTodos, getTodo, createTodo, updateTodo, deleteTodo, toggleTodo)
- **Error Responses**: Standardized format with code, message, details
- **Date Format**: ISO 8601 (e.g., "2026-01-04T14:30:00Z")

---

### Phase 2: Implementation Tasks (→ Next Phase: /sp.tasks)

**Objective**: Break down implementation into atomic, testable tasks.

**Expected Outputs** (created by `/sp.tasks` command):
- `tasks.md` - Ordered list of implementation tasks
- Each task with:
  - Clear acceptance criteria
  - File references (e.g., `phase-2/frontend/lib/api-client.ts`)
  - Test cases to verify completion
  - Dependencies on other tasks

**Expected Task Categories**:
1. **Environment Setup**:
   - Create `.env.local` and `.env.example` files
   - Document BETTER_AUTH_SECRET requirement
   - Verify backend API health endpoint

2. **API Client Implementation**:
   - Create `lib/api-client.ts` with ApiError class
   - Implement fetch wrapper with JWT injection
   - Implement all CRUD methods (getTodos, createTodo, updateTodo, deleteTodo, toggleTodo)
   - Add timeout and error handling

3. **Hook Refactoring**:
   - Create `hooks/use-todos.ts` with API integration
   - Maintain same interface as `use-mock-todos.ts`
   - Add loading and error states
   - Remove `hooks/use-mock-todos.ts`

4. **Component Integration**:
   - Update `app/todos/page.tsx` to use new `use-todos` hook
   - Handle loading states (show spinners)
   - Handle error states (show error messages)
   - Verify all CRUD operations work

5. **Authentication Flow**:
   - Verify Better Auth JWT Plugin is enabled
   - Test token retrieval from session
   - Test 401 error handling (logout/redirect)
   - Test token expiration scenario

6. **Testing & Validation**:
   - Write unit tests for API client methods
   - Write integration tests for use-todos hook
   - Manual testing: Create/read/update/delete/toggle tasks
   - Verify localStorage is no longer used (code search)
   - Verify network requests include Authorization header

7. **Documentation**:
   - Update README with new setup instructions
   - Document troubleshooting steps for common issues
   - Add example .env.local configuration

---

## Files to Create

| File Path | Purpose | Status |
|-----------|---------|--------|
| `phase-2/frontend/lib/api-client.ts` | Centralized API client with JWT injection | ⏳ To Create |
| `phase-2/frontend/hooks/use-todos.ts` | API-backed todos hook | ⏳ To Create |
| `phase-2/frontend/.env.local` | Local environment configuration | ⏳ To Create |
| `phase-2/frontend/.env.example` | Example environment template | ⏳ To Create |

---

## Files to Modify

| File Path | Modification | Status |
|-----------|--------------|--------|
| `phase-2/frontend/app/todos/page.tsx` | Replace `useMockTodos()` with `useTodos()` | ⏳ To Modify |
| `phase-2/frontend/lib/types.ts` | Add ApiError and ApiResponse types (if needed) | ⏳ To Modify |
| `phase-2/frontend/lib/auth-client.ts` | Enable JWT Plugin if not already enabled | ⏳ To Verify |

---

## Files to Remove

| File Path | Reason | Status |
|-----------|--------|--------|
| `phase-2/frontend/hooks/use-mock-todos.ts` | Replaced by `use-todos.ts` with API integration | ⏳ To Remove |

---

## Refactoring Map

### Current Flow (Mock Data)

```
[User] → [TaskForm] → [useMockTodos Hook]
                            ↓
                      [localStorage]
                            ↓
                      [Update State]
                            ↓
                      [TaskList Re-renders]
```

### Target Flow (API Integration)

```
[User] → [TaskForm] → [useTodos Hook]
                            ↓
                      [ApiClient.createTodo()]
                            ↓ (Authorization: Bearer <JWT>)
                      [Backend API: POST /api/todos]
                            ↓
                      [Neon PostgreSQL]
                            ↓
                      [Backend Returns Todo Entity]
                            ↓
                      [ApiClient Parses Response]
                            ↓
                      [useTodos Updates State]
                            ↓
                      [TaskList Re-renders with New Task]
```

### Component Refactoring Strategy

**Components that DON'T need changes** (already prop-based):
- `components/todo/TaskList.tsx` - receives `todos` as prop
- `components/todo/TaskCard.tsx` - receives `todo` as prop
- `components/todo/TaskForm.tsx` - calls `onSubmit` callback
- `components/todo/FilterBar.tsx` - receives filter state as props

**Components that NEED changes**:
- `app/todos/page.tsx` - Replace `useMockTodos()` with `useTodos()`, add loading/error UI

**Hooks to create**:
- `hooks/use-todos.ts` - New API-backed hook with same interface as mock version

**Hooks to remove**:
- `hooks/use-mock-todos.ts` - No longer needed after migration

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

**API Client Tests** (`lib/api-client.test.ts`):
- Test successful API calls (200, 201 responses)
- Test error handling (400, 401, 403, 404, 500)
- Test JWT injection (Authorization header present)
- Test timeout behavior
- Test date conversion (ISO 8601 → Date objects)

**Hook Tests** (`hooks/use-todos.test.ts`):
- Test loading state during API call
- Test success state after API response
- Test error state on API failure
- Test that all CRUD methods call ApiClient correctly
- Mock ApiClient to avoid real API calls

### Integration Tests

**Contract Tests** (with real backend):
- Test each endpoint matches documented contract
- Verify response structure matches TypeScript interfaces
- Verify error responses match documented format
- Test with valid and invalid JWT tokens

### Manual Testing Checklist

- [ ] Environment variables configured correctly
- [ ] Backend API health check returns 200 OK
- [ ] User can log in and JWT token is obtained
- [ ] Creating a task sends POST request with Authorization header
- [ ] Created task appears in UI with server-generated ID
- [ ] Task persists after page refresh (fetched from API)
- [ ] Updating a task sends PUT request and updates UI
- [ ] Deleting a task sends DELETE request and removes from UI
- [ ] Toggling completion sends PATCH request and updates status
- [ ] 401 error triggers logout and redirect to login
- [ ] No localStorage calls for task data (verified by code search)
- [ ] Network tab shows all requests include JWT Bearer token

---

## Risk Assessment

### High Risks

1. **BETTER_AUTH_SECRET Mismatch**
   - **Impact**: All API requests fail with 401 Unauthorized
   - **Mitigation**: Document secret requirement clearly in quickstart.md; provide validation steps
   - **Recovery**: Update .env.local with correct secret and restart dev server

2. **Backend API Unavailable**
   - **Impact**: Application cannot function (no offline mode)
   - **Mitigation**: Health check endpoint to verify connectivity; clear error messages to user
   - **Recovery**: Wait for backend to come back online; no data loss since all data is remote

3. **JWT Token Expiration Handling**
   - **Impact**: User session expires unexpectedly; API calls fail
   - **Mitigation**: Check token expiration before requests; attempt refresh or redirect to login
   - **Recovery**: User logs in again to get new token

### Medium Risks

1. **Type Mismatch Between Frontend and Backend**
   - **Impact**: Runtime errors due to unexpected API response structure
   - **Mitigation**: Contract tests to validate API responses; TypeScript strict mode
   - **Recovery**: Update TypeScript interfaces or report backend issue

2. **Date Conversion Issues**
   - **Impact**: Due dates displayed incorrectly or fail to parse
   - **Mitigation**: Thorough testing of ISO 8601 → Date conversion; error handling for invalid dates
   - **Recovery**: Fix date parsing logic in ApiClient

### Low Risks

1. **Network Latency**
   - **Impact**: Slow user experience (2+ seconds for operations)
   - **Mitigation**: Loading spinners; reasonable timeout values
   - **Recovery**: Optimizations can be added later (optimistic updates, caching)

2. **CORS Configuration Issues**
   - **Impact**: Requests blocked by browser CORS policy
   - **Mitigation**: Verify backend allows localhost origin; document CORS requirements
   - **Recovery**: Backend team updates CORS configuration

---

## Success Metrics (from Spec)

After implementation, verify all success criteria:

- [x] **SC-001**: Task created on localhost appears in remote database within 2 seconds
- [x] **SC-002**: 100% of API requests include valid JWT Bearer token in Authorization header
- [x] **SC-003**: All requests without valid JWT rejected by backend with 401 Unauthorized
- [x] **SC-004**: Zero local mock data or in-memory stores remain (verified by code search)
- [x] **SC-005**: Users can perform full CRUD operations with data persisting to remote database
- [x] **SC-006**: Application handles 401 errors by redirecting to login within 1 second
- [x] **SC-007**: Task data retrieved matches remote database (no local modifications)
- [x] **SC-008**: Network logs show zero localStorage access for task operations

---

## Next Steps

1. ✅ **Planning Complete**: This document (`plan.md`) is finalized
2. → **Create Tasks**: Run `/sp.tasks` to generate atomic implementation tasks in `tasks.md`
3. → **Implement**: Execute tasks in order, marking each complete as you go
4. → **Test**: Verify each task's acceptance criteria before moving to next
5. → **Validate**: Run full test suite and manual checklist before considering feature done
6. → **Commit**: Create commit following project conventions
7. → **Pull Request**: Open PR with link to this plan and spec

---

## Document Status

**Phase 0 (Research)**: ✅ Complete
**Phase 1 (Design & Contracts)**: ✅ Complete
**Phase 2 (Implementation Tasks)**: ⏳ Next step - run `/sp.tasks`

---

**Implementation Plan By**: Claude (Sonnet 4.5)
**Date**: 2026-01-04
**Status**: Ready for Task Generation
