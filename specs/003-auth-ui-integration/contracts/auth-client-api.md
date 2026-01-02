# Auth Client API Contract

**Feature**: 003-auth-ui-integration
**Date**: 2026-01-02
**Phase**: 1 (Design & Contracts)
**Contract Type**: Client-Side TypeScript API

## Overview

This document defines the API contract for the Better Auth client integration. Since this is a **client-side only** implementation with no backend routes, this contract specifies the TypeScript interfaces and function signatures that components will use to interact with the authentication system.

**Important**: This phase does NOT implement actual backend API endpoints. The `/api/auth/*` routes referenced here will be implemented in a future phase. For now, these endpoints will return 404 errors, and the client will gracefully handle this by treating the user as logged out.

---

## 1. Auth Client Configuration API

### createAuthClient()

**Purpose**: Initialize the Better Auth client with configuration options.

**Location**: `phase-2/frontend/lib/auth-client.ts`

**Signature**:

```typescript
function createAuthClient(config?: AuthClientConfig): AuthClient
```

**Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `config` | `AuthClientConfig` | No | `{}` | Client configuration options |
| `config.baseURL` | `string` | No | `window.location.origin` | Auth server base URL |
| `config.fetchOptions` | `FetchOptions` | No | `{}` | Custom fetch options |

**Returns**: `AuthClient` object with authentication methods and hooks

**Example Usage**:

```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  fetchOptions: {
    onError: (ctx) => {
      // Suppress expected errors when backend not ready
      if (ctx.response?.status === 404) {
        console.log('Auth backend not yet implemented - defaulting to logged out state')
        return
      }
      console.error('Auth error:', ctx.error)
    }
  }
})
```

**Error Handling**:
- Never throws errors on initialization
- Returns valid client instance even if baseURL is invalid
- Errors surface when methods are called (e.g., `useSession()`)

---

## 2. Session Management API

### useSession()

**Purpose**: React hook to access current session state with automatic reactivity.

**Location**: Exported from `authClient` in `lib/auth-client.ts`

**Signature**:

```typescript
function useSession(): SessionState
```

**Returns**: `SessionState` object

```typescript
interface SessionState {
  data: Session | null
  isPending: boolean
  error: Error | null
  refetch: () => Promise<void>
}
```

**Return Fields**:

| Field | Type | Description | When Set |
|-------|------|-------------|----------|
| `data` | `Session \| null` | Session object when authenticated, null when not | After successful session check |
| `isPending` | `boolean` | Loading state during session check | `true` on initial mount, `false` after |
| `error` | `Error \| null` | Error object if session check failed | When fetch fails (e.g., network error, 404) |
| `refetch` | `() => Promise<void>` | Function to manually refetch session | Always available |

**Behavior Without Backend** (Current Phase):
```typescript
// Expected return value when backend not implemented:
{
  data: null,                               // No session (logged out)
  isPending: false,                         // Check complete (failed)
  error: Error("Failed to fetch"),          // Expected error
  refetch: async () => { /* ... */ }        // Available but will fail again
}
```

**Example Usage**:

```typescript
"use client"

import { useSession } from "@/lib/auth-client"

export function Navbar() {
  const { data: session, isPending, error } = useSession()

  // Loading state
  if (isPending) {
    return <NavbarSkeleton />
  }

  // Logged in state
  if (session) {
    return (
      <nav>
        <UserNav user={session.user} />
      </nav>
    )
  }

  // Logged out state (including errors)
  return (
    <nav>
      <LoginButton />
    </nav>
  )
}
```

**State Lifecycle**:

```
Component Mount
    ↓
useSession() called
    ↓
{ data: null, isPending: true, error: null }
    ↓
Fetch /api/auth/get-session
    ↓
┌─────────┴─────────┐
↓                   ↓
Success (200)       Failure (404/5xx)
↓                   ↓
{ data: Session,    { data: null,
  isPending: false,   isPending: false,
  error: null }       error: Error }
    ↓                   ↓
UI: UserNav         UI: LoginButton
```

**Performance Characteristics**:
- Initial fetch happens on component mount (client-side only)
- Subsequent mounts reuse cached session data (no refetch)
- Session state updates trigger component re-render automatically
- Refetch can be manually triggered if needed

---

## 3. Authentication Action APIs (Placeholders)

These functions are exported from the auth client but are **non-functional** in this phase (console.log only).

### signIn()

**Purpose**: Initiate sign-in flow (placeholder for this phase).

**Signature**:

```typescript
function signIn(credentials?: SignInCredentials): Promise<void>
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `credentials` | `SignInCredentials` | No | Email and password (unused in this phase) |

**Current Behavior**:
```typescript
// In LoginButton component:
const handleSignIn = () => {
  console.log("Sign In clicked - backend not implemented yet")
}
```

**Future Implementation**: Will call `/api/auth/sign-in` endpoint with credentials

---

### signUp()

**Purpose**: Initiate sign-up flow (placeholder for this phase).

**Signature**:

```typescript
function signUp(credentials?: SignUpCredentials): Promise<void>
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `credentials` | `SignUpCredentials` | No | Email, password, name (unused in this phase) |

**Current Behavior**:
```typescript
// In LoginButton component:
const handleSignUp = () => {
  console.log("Sign Up clicked - backend not implemented yet")
}
```

**Future Implementation**: Will call `/api/auth/sign-up` endpoint with credentials

---

### signOut()

**Purpose**: Sign out current user (placeholder for this phase).

**Signature**:

```typescript
function signOut(): Promise<void>
```

**Current Behavior**:
```typescript
// In UserNav component:
const handleSignOut = () => {
  console.log("Sign Out clicked - backend not implemented yet")
}
```

**Future Implementation**: Will call `/api/auth/sign-out` endpoint and clear session

---

## 4. Component Props Contracts

### LoginButton Component

**Purpose**: Display Sign In and Sign Up buttons when user is logged out.

**Props**: None required

**Location**: `phase-2/frontend/components/auth/LoginButton.tsx`

**Interface**:

```typescript
// No props interface needed - component is stateless
export function LoginButton(): JSX.Element
```

**Example Usage**:

```typescript
<Navbar>
  {!session && <LoginButton />}
</Navbar>
```

**Accessibility Requirements**:
- Both buttons must have proper `aria-label` attributes
- Keyboard navigation must work (Tab, Enter, Space)
- Focus styles must be visible

---

### UserNav Component

**Purpose**: Display user avatar and dropdown menu when user is logged in.

**Props**:

```typescript
interface UserNavProps {
  user: User
}

interface User {
  id: string
  name: string | null
  email: string
  image?: string | null
}
```

**Location**: `phase-2/frontend/components/auth/UserNav.tsx`

**Example Usage**:

```typescript
<Navbar>
  {session && <UserNav user={session.user} />}
</Navbar>
```

**Rendering Logic Contract**:

| Condition | Display |
|-----------|---------|
| `user.image` exists and loads | Profile picture in circular avatar |
| `user.image` fails to load | Initials from `user.name` |
| `user.name` is "John Doe" | Initials "JD" |
| `user.name` is "Madonna" | Initial "M" |
| `user.name` is null | Default user icon (Lucide User icon) |

**Accessibility Requirements**:
- Avatar must have `alt` text with user's name
- Dropdown menu must be keyboard accessible
- Focus trap inside dropdown when open
- Escape key closes dropdown

---

## 5. Backend API Endpoints (Future Implementation)

These endpoints are **NOT implemented** in this phase. Documented here for future reference.

### GET /api/auth/get-session

**Purpose**: Retrieve current user session.

**Current Status**: ❌ Not implemented (returns 404)

**Future Response**:

```typescript
// Success (200)
{
  user: {
    id: "usr_abc123",
    name: "John Doe",
    email: "john@example.com",
    image: "https://example.com/avatar.jpg"
  },
  expires: "2026-01-03T12:00:00.000Z"
}

// Unauthenticated (401)
{
  error: "Unauthorized",
  message: "No active session"
}
```

---

### POST /api/auth/sign-in

**Purpose**: Authenticate user with email and password.

**Current Status**: ❌ Not implemented (returns 404)

**Future Request**:

```typescript
{
  email: "john@example.com",
  password: "securePassword123"
}
```

**Future Response**:

```typescript
// Success (200)
{
  user: {
    id: "usr_abc123",
    name: "John Doe",
    email: "john@example.com",
    image: "https://example.com/avatar.jpg"
  },
  session: {
    token: "jwt_token_here",
    expires: "2026-01-03T12:00:00.000Z"
  }
}

// Invalid credentials (401)
{
  error: "Unauthorized",
  message: "Invalid email or password"
}
```

---

### POST /api/auth/sign-up

**Purpose**: Register new user account.

**Current Status**: ❌ Not implemented (returns 404)

**Future Request**:

```typescript
{
  email: "newuser@example.com",
  password: "securePassword123",
  name: "New User"
}
```

**Future Response**:

```typescript
// Success (201)
{
  user: {
    id: "usr_xyz789",
    name: "New User",
    email: "newuser@example.com",
    image: null
  },
  session: {
    token: "jwt_token_here",
    expires: "2026-01-03T12:00:00.000Z"
  }
}

// Email already exists (409)
{
  error: "Conflict",
  message: "Email already registered"
}
```

---

### POST /api/auth/sign-out

**Purpose**: Invalidate current session.

**Current Status**: ❌ Not implemented (returns 404)

**Future Response**:

```typescript
// Success (200)
{
  success: true,
  message: "Successfully signed out"
}
```

---

## 6. TypeScript Type Definitions

**Location**: `phase-2/frontend/lib/types/auth.ts` (to be created)

```typescript
/**
 * Auth Client Configuration
 */
export interface AuthClientConfig {
  baseURL?: string
  fetchOptions?: {
    onSuccess?: (ctx: any) => void
    onError?: (ctx: any) => void
  }
  plugins?: any[]
}

/**
 * User Profile
 */
export interface User {
  id: string
  name: string | null
  email: string
  image?: string | null
}

/**
 * Active Session
 */
export interface Session {
  user: User
  expires?: string
}

/**
 * Session State (useSession return type)
 */
export interface SessionState {
  data: Session | null
  isPending: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Sign In Credentials (Future)
 */
export interface SignInCredentials {
  email: string
  password: string
}

/**
 * Sign Up Credentials (Future)
 */
export interface SignUpCredentials {
  email: string
  password: string
  name: string
}

/**
 * Auth Client Instance
 */
export interface AuthClient {
  useSession: () => SessionState
  signIn: (credentials?: SignInCredentials) => Promise<void>
  signUp: (credentials?: SignUpCredentials) => Promise<void>
  signOut: () => Promise<void>
}
```

---

## 7. Error Handling Contract

### Client-Side Error Categories

| Error Type | HTTP Status | Client Behavior | User Experience |
|------------|-------------|-----------------|-----------------|
| **Network Error** | N/A | `error` set, `data` null | Show logged-out UI (LoginButton) |
| **Backend Not Found** | 404 | `error` set, `data` null | Show logged-out UI (LoginButton) |
| **Server Error** | 500-599 | `error` set, `data` null | Show logged-out UI (LoginButton) |
| **Unauthorized** | 401 | `error` null, `data` null | Show logged-out UI (LoginButton) |
| **Success (No Session)** | 200 (empty) | `error` null, `data` null | Show logged-out UI (LoginButton) |
| **Success (With Session)** | 200 | `error` null, `data` Session | Show logged-in UI (UserNav) |

**Contract**: All error states default to logged-out UI. Never show error messages to users for expected failures (404 when backend not ready).

### Error Suppression Strategy

```typescript
// In lib/auth-client.ts
export const authClient = createAuthClient({
  fetchOptions: {
    onError: (ctx) => {
      // Suppress expected 404 errors when backend not ready
      if (ctx.response?.status === 404) {
        return // Silently fail, treat as logged out
      }

      // Log unexpected errors for debugging
      console.error('Unexpected auth error:', ctx.error)
    }
  }
})
```

---

## 8. Testing Contract

### Mock Data Contract

All tests must use standardized mock data from `__tests__/fixtures/auth-mocks.ts`:

```typescript
export const mockUsers = {
  withImage: User
  withoutImage: User
  firstNameOnly: User
  noName: User
  specialCharacters: User
}

export const mockSessions = {
  authenticated: Session
  unauthenticated: null
}

export const mockSessionStates = {
  loggedIn: SessionState
  loggedOut: SessionState
  loading: SessionState
  error: SessionState
}
```

### Test Coverage Requirements

| Component/Function | Required Tests | Coverage Target |
|--------------------|----------------|-----------------|
| `lib/auth-client.ts` | Initialization, error handling | 100% |
| `LoginButton` | Render, click events, accessibility | 100% |
| `UserNav` | Avatar rendering, initials fallback, image errors | 100% |
| `Navbar` | Conditional rendering based on session state | 100% |

### Test Scenarios Contract

Each component must test:
1. ✅ Logged out state (session === null)
2. ✅ Logged in state (session with data)
3. ✅ Loading state (isPending === true)
4. ✅ Error state (error !== null)
5. ✅ Edge cases (special characters, missing data)

---

## 9. Performance Contract

### Timing Guarantees

| Metric | Requirement | Measurement |
|--------|-------------|-------------|
| **Session Check** | <500ms | From component mount to UI render |
| **State Transition** | <200ms | From session change to UI update |
| **Layout Shift** | CLS <0.1 | No visible flickering or jumping |

### Optimization Contract

1. **Memoization**: Initials generation must be memoized per user
2. **Lazy Loading**: Session check only on client mount (not SSR)
3. **Debouncing**: Rapid state changes must be debounced (200ms)
4. **Caching**: Session data cached between page navigations

---

## 10. Security Contract

**Important**: This is CLIENT-SIDE ONLY. No security guarantees in this phase.

### Current Phase (No Backend)

- ❌ No authentication validation
- ❌ No authorization checks
- ❌ No secure token storage
- ✅ No sensitive data exposed (because no real auth)

### Future Phase (With Backend)

- ✅ JWT tokens in HTTP-only cookies
- ✅ CSRF protection on state-changing requests
- ✅ Session validation on every request
- ✅ Secure password hashing (never sent to client)

---

## 11. Component Integration Contract

### Navbar → LoginButton

**When**: `session === null && !isPending`

```typescript
<Navbar>
  {!isPending && !session && <LoginButton />}
</Navbar>
```

### Navbar → UserNav

**When**: `session !== null`

```typescript
<Navbar>
  {session && <UserNav user={session.user} />}
</Navbar>
```

### Navbar → Loading State

**When**: `isPending === true`

```typescript
<Navbar>
  {isPending && <LoadingIndicator />}
</Navbar>
```

---

## Summary

This contract defines:

1. **Auth Client API**: `createAuthClient()` and `useSession()` interfaces
2. **Component Props**: `LoginButton` and `UserNav` prop contracts
3. **Backend Endpoints**: Future API routes (not implemented yet)
4. **Type Definitions**: TypeScript interfaces for all entities
5. **Error Handling**: Graceful degradation when backend unavailable
6. **Testing Requirements**: Mock data and coverage targets
7. **Performance Guarantees**: Timing and optimization contracts
8. **Security Model**: Current limitations and future requirements

**Key Principle**: The UI must function gracefully with no backend, defaulting to logged-out state when session fetch fails.

**Next Steps**:
- Create `lib/types/auth.ts` with type definitions
- Implement `lib/auth-client.ts` following this contract
- Create components that consume these APIs
- Write tests that validate contract compliance
