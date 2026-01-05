# Research: Hybrid Cloud Integration

**Feature**: 004-hybrid-cloud-integration
**Date**: 2026-01-04
**Status**: Complete

## Phase 0: Architecture Research & Decision Making

### Overview

This document captures the research and architectural decisions made for integrating the local Next.js frontend with the production backend API at https://teot-phase2.vercel.app/. The integration replaces local mock data (localStorage) with remote API calls authenticated via JWT tokens from Better Auth.

---

## 1. API Client Architecture

### Decision: Centralized API Client Layer

**Chosen Approach**: Create a centralized `ApiClient` class in `lib/api-client.ts` that acts as the single gateway for all remote communication.

**Rationale**:
- **Single Source of Truth**: All API communication flows through one client, making it easier to add cross-cutting concerns (auth, logging, error handling)
- **Testability**: Centralized client can be easily mocked for testing
- **Maintainability**: Changes to API structure (e.g., base URL, headers, timeout) only require updates in one place
- **Type Safety**: TypeScript interfaces can be enforced at the client level

**Alternatives Considered**:

1. **Direct fetch() calls in components**
   - **Rejected**: Would lead to duplicated auth logic, error handling, and base URL configuration across multiple files
   - **Why insufficient**: Violates DRY principle and makes refactoring difficult

2. **React Query with inline fetchers**
   - **Rejected**: While React Query is excellent for caching, the inline fetcher approach still requires duplicating auth logic
   - **Why insufficient**: Doesn't solve the auth injection problem, just the data fetching/caching aspect

3. **tRPC-style end-to-end type safety**
   - **Rejected**: Requires significant backend changes and assumes TypeScript on backend
   - **Why insufficient**: Out of scope - backend API already exists and is not modifiable

**Implementation Details**:
- Location: `phase-2/frontend/lib/api-client.ts`
- Configuration: Reads `NEXT_PUBLIC_API_URL` from environment (default: `https://teot-phase2.vercel.app/`)
- Methods: RESTful CRUD operations (GET, POST, PUT, DELETE)
- Error Handling: Standardized `ApiError` class with status codes and messages
- Timeout: 10 seconds for task operations (configurable per request)

---

## 2. Authentication Integration

### Decision: Fetch Interceptor with Better Auth Session

**Chosen Approach**: Create a fetch wrapper that automatically injects the `Authorization: Bearer <token>` header using session data from Better Auth.

**Rationale**:
- **Seamless Integration**: Better Auth already manages session state; we just need to read the JWT token
- **Automatic Auth**: Developers don't need to manually add auth headers to every request
- **Session Validation**: Client can validate JWT claims (user_id, exp) before making requests
- **Error Recovery**: Centralized handling of 401 errors triggers logout/redirect flow

**Alternatives Considered**:

1. **Axios Interceptors**
   - **Rejected**: Adds an extra dependency when native fetch() is sufficient
   - **Why insufficient**: Next.js ecosystem prefers native fetch(); adding Axios is unnecessary overhead

2. **Manual header injection per request**
   - **Rejected**: Error-prone and easy to forget in new API calls
   - **Why insufficient**: Violates the "secure by default" principle

3. **Middleware approach (Next.js middleware)**
   - **Rejected**: Middleware runs on edge/server, but we need client-side JWT injection for API calls
   - **Why insufficient**: Middleware can't intercept client-side fetch() calls to external APIs

**Implementation Details**:
- Better Auth JWT Plugin: Enabled via configuration in auth client
- Token Retrieval: `authClient.useSession()` hook provides JWT token
- Interceptor Logic: Wrapper function checks session, adds Authorization header, handles 401 responses
- Token Validation: Client-side check for required claims (user_id, exp) before sending
- Expiration Handling: If token expired, attempt refresh or redirect to login

---

## 3. Environment Configuration

### Decision: Environment Variable for API Base URL

**Chosen Approach**: Use `NEXT_PUBLIC_API_URL` environment variable with fallback to production URL.

**Rationale**:
- **Flexibility**: Developers can point to different backends (localhost, staging, production)
- **Security**: `NEXT_PUBLIC_` prefix makes it safe for client-side usage
- **Convention**: Follows Next.js naming conventions for public environment variables

**Configuration Values**:
- **Production**: `NEXT_PUBLIC_API_URL=https://teot-phase2.vercel.app/`
- **Local Dev** (optional): `NEXT_PUBLIC_API_URL=http://localhost:8000/`
- **Default**: If not set, defaults to `https://teot-phase2.vercel.app/`

**Implementation Details**:
- Location: `.env.local` file (not committed to git)
- Validation: Client logs warning if URL is missing or invalid
- Template: `.env.example` file documents required variables

---

## 4. Better Auth Secret Synchronization

### Decision: Verify BETTER_AUTH_SECRET Matches Remote Server

**Chosen Approach**: Document requirement for developers to obtain and set the exact `BETTER_AUTH_SECRET` used by the remote backend.

**Rationale**:
- **JWT Signature Validation**: JWT tokens are signed with a secret; local and remote must use the same secret for signature validation to succeed
- **Security**: Prevents token forgery and ensures tokens are issued by trusted authority
- **Explicit Configuration**: Makes the requirement clear in documentation

**Alternatives Considered**:

1. **Separate secrets for local and remote**
   - **Rejected**: Would require backend to accept multiple secrets or use public key cryptography
   - **Why insufficient**: Backend API is assumed to be fixed and not modifiable

2. **Public key cryptography (RS256)**
   - **Rejected**: Requires backend changes to use RSA keys instead of HMAC secrets
   - **Why insufficient**: Out of scope - backend uses HS256 (assumed)

**Implementation Details**:
- Environment Variable: `BETTER_AUTH_SECRET` (server-only, not `NEXT_PUBLIC_`)
- Documentation: Quickstart guide explains how to obtain secret from production backend
- Validation: Application logs error if secret is missing or JWT validation fails
- Security: `.env.local` is gitignored to prevent secret exposure

---

## 5. Mock Data Removal Strategy

### Decision: Complete Replacement with API Calls

**Chosen Approach**: Systematically replace all mock data implementations with API client calls.

**Files to Refactor**:
1. **`hooks/use-mock-todos.ts`** → **`hooks/use-todos.ts`**
   - Replace localStorage operations with API calls
   - Maintain same hook interface for backward compatibility
   - Add loading and error states

2. **`components/todo/TaskList.tsx`**
   - No changes needed (already receives todos as props)
   - Add loading/error UI if not present

3. **`components/todo/TaskForm.tsx`**
   - No changes needed (calls onSubmit/onUpdate callbacks)
   - Parent component handles API calls

4. **`app/todos/page.tsx`** (assumed main page)
   - Replace `useMockTodos()` with new `useTodos()` hook
   - Handle loading and error states

**Refactoring Approach**:
- **Step 1**: Create new `use-todos.ts` hook with API integration
- **Step 2**: Test API hook in isolation with real backend
- **Step 3**: Update page components to use new hook
- **Step 4**: Remove old `use-mock-todos.ts` file
- **Step 5**: Verify no localStorage calls remain (code search)

**Backward Compatibility**:
- Hook interface remains identical: `{ todos, addTask, updateTask, deleteTask, toggleTask }`
- Components don't need changes if they only consume the hook

---

## 6. Error Handling Strategy

### Decision: Standardized Error Response Format

**Chosen Approach**: Define `ApiError` class with consistent structure for all API errors.

**Error Structure**:
```typescript
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public details?: unknown
  )
}
```

**Error Categories**:
1. **401 Unauthorized**: Invalid/missing JWT → Logout and redirect to login
2. **403 Forbidden**: User lacks permission → Show error, redirect to home
3. **404 Not Found**: Resource doesn't exist → Show "not found" message
4. **409 Conflict**: Optimistic locking failure → Prompt user to retry
5. **500 Server Error**: Backend failure → Show error, optional retry with backoff
6. **Network Errors**: Timeout/offline → Show "connection failed" message

**User-Facing Messages**:
- Display friendly messages to users (avoid technical jargon)
- Log detailed errors to console for debugging
- Provide actionable next steps where possible

**Implementation Details**:
- Error boundary component catches unhandled errors
- Toast notifications for transient errors
- Error pages for permanent failures (404, 403)

---

## 7. Performance & Optimization

### Decision: Baseline Implementation Without Aggressive Optimization

**Chosen Approach**: Implement straightforward API integration with reasonable defaults. Optimization comes later if needed.

**Baseline Decisions**:
- **No Request Batching**: Each operation makes individual API calls
- **No Local Caching**: React state is the only cache (no localStorage fallback)
- **No Optimistic Updates**: Wait for server confirmation before updating UI
- **Standard Timeouts**: 10 seconds for most operations

**Rationale**:
- **Simplicity**: Easier to implement and debug
- **Correctness**: Ensures UI always reflects server state
- **Premature Optimization**: Avoid complexity until performance issues are measured

**Future Optimizations** (Out of Scope):
- React Query for automatic caching and background refetching
- Optimistic updates for better perceived performance
- Request debouncing for search/filter operations
- Connection pooling if multiple simultaneous requests are common

---

## 8. Type Safety

### Decision: Shared TypeScript Interfaces for API Contracts

**Chosen Approach**: Define TypeScript interfaces matching backend API responses.

**Existing Types** (from `lib/types.ts`):
```typescript
interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: Priority
  tags: string[]
  dueDate?: Date
  recurring?: RecurringConfig
  createdAt: Date
  updatedAt?: Date
}

type Priority = 'low' | 'medium' | 'high'
```

**API Response Types** (to be added):
```typescript
interface ApiResponse<T> {
  data: T
  error?: ApiError
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
```

**Date Handling**:
- Backend returns ISO 8601 strings
- Client converts to JavaScript Date objects
- All internal logic uses Date objects, not strings

---

## 9. Testing Strategy

### Decision: Contract Testing with Real Backend

**Chosen Approach**: Write tests that verify the frontend correctly calls the backend API according to the contract.

**Test Levels**:
1. **Unit Tests**: API client methods in isolation (mocked fetch)
2. **Integration Tests**: Hooks with API client (mocked backend responses)
3. **Contract Tests**: Verify actual API responses match expected structure
4. **Manual Testing**: Full end-to-end flows with real backend

**Out of Scope**:
- Backend testing (assumed to be tested independently)
- Playwright end-to-end tests (can be added later)

---

## 10. Security Considerations

### Decision: Secure by Default with Explicit Configuration

**Security Measures**:
1. **JWT Storage**: Tokens managed by Better Auth (HTTP-only cookies preferred)
2. **Secret Management**: `BETTER_AUTH_SECRET` stored in `.env.local`, never committed
3. **HTTPS Only**: Production API uses HTTPS; local dev can use HTTP
4. **CORS**: Backend must whitelist localhost origin for development
5. **Token Expiration**: Respect backend JWT expiration; refresh or re-authenticate
6. **Error Messages**: Don't leak sensitive information in client-side errors

**Threat Model**:
- **XSS**: Better Auth mitigates with HTTP-only cookies (if configured)
- **CSRF**: JWT in Authorization header doesn't suffer from CSRF
- **Token Theft**: Short-lived tokens + secure storage minimize risk
- **Man-in-the-Middle**: HTTPS encrypts all communication

---

## 11. Documentation & Developer Experience

### Decision: Comprehensive Quickstart Guide

**Chosen Approach**: Create `quickstart.md` with step-by-step setup instructions.

**Quickstart Sections**:
1. Prerequisites (Node.js, npm, access to backend)
2. Environment setup (`.env.local` configuration)
3. Installing dependencies
4. Running development server
5. Testing the integration
6. Troubleshooting common issues

**Developer Experience Goals**:
- **Fast Setup**: Developer should be productive within 10 minutes
- **Clear Errors**: Meaningful error messages when configuration is wrong
- **Examples**: Sample API calls and responses documented
- **Debugging**: Instructions for inspecting network requests

---

## Summary of Key Decisions

| Decision Area | Choice | Rationale |
|--------------|--------|-----------|
| API Client | Centralized `ApiClient` class | Single source of truth, easier maintenance |
| Authentication | Fetch interceptor with Better Auth JWT | Automatic, seamless, secure by default |
| Environment Config | `NEXT_PUBLIC_API_URL` variable | Flexibility for different environments |
| Secret Sync | Shared `BETTER_AUTH_SECRET` | Required for JWT signature validation |
| Mock Data Removal | Complete replacement with API calls | Data consistency, eliminates dual sources |
| Error Handling | Standardized `ApiError` class | Consistent UX, proper status code handling |
| Performance | Baseline (no aggressive optimization) | Simplicity, correctness over premature optimization |
| Type Safety | Shared TypeScript interfaces | Compile-time safety, self-documenting |
| Testing | Contract tests with real backend | Verify actual API behavior |
| Security | Secure by default, explicit config | Minimize attack surface, clear requirements |
| Documentation | Comprehensive quickstart guide | Fast onboarding, reduced friction |

---

## Next Steps

1. ✅ Research complete - all architectural decisions documented
2. → Create `data-model.md` to define API entities and relationships
3. → Generate API contracts in `contracts/` directory
4. → Write `quickstart.md` for developer onboarding
5. → Update agent context with new technologies
6. → Complete implementation plan in `plan.md`

---

**Research Completed By**: Claude (Sonnet 4.5)
**Validation**: All decisions align with feature specification requirements
