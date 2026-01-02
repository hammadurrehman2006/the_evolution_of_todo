# Data Model: Better Auth UI Integration

**Feature**: 003-auth-ui-integration
**Date**: 2026-01-02
**Phase**: 1 (Design & Contracts)

## Overview

This document defines the data entities and their relationships for the Better Auth UI integration feature. Since this is a **client-side only** implementation with no backend, these entities represent the **shape of data** that will be consumed by UI components, not database schemas.

**Important**: This phase does NOT implement actual authentication or database storage. These entities document the expected data structure that will be returned by `useSession()` hook in future phases when the backend is implemented.

---

## Core Entities

### 1. User

Represents an authenticated user's identity information.

**Purpose**: Provide user profile data for avatar rendering and personalization.

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | string | Yes | Unique, non-empty | Unique user identifier |
| `name` | string \| null | No | 1-200 characters | User's full name (for initials generation) |
| `email` | string | Yes | Valid email format | User's email address |
| `image` | string \| null | No | Valid URL format | Profile picture URL |

**Validation Rules** (from spec FR-008, FR-009, FR-010):
- If `name` contains space, split and take first letter of first and last word for initials (e.g., "John Doe" → "JD")
- If `name` is single word, take first letter only (e.g., "Madonna" → "M")
- If `name` is null, display default placeholder icon
- If `image` URL fails to load, fall back to initials display

**Example**:

```typescript
{
  id: "usr_abc123xyz",
  name: "John Doe",
  email: "john.doe@example.com",
  image: "https://example.com/avatars/john-doe.jpg"
}
```

**Edge Cases Handled**:
- Special characters: "José García" → "JG"
- Chinese characters: "李明" → "李明"
- Emojis: "🎨 Artist" → "🎨A"
- Hyphenated names: "Jean-Paul Sartre" → "JS" (first + last)
- Three or more names: "Mary Jane Watson" → "MW" (first + last)
- Single character: "A" → "A"
- Extra whitespace: "   Spaces   " → "S" (trimmed)

---

### 2. Session

Represents the current authentication state and session metadata.

**Purpose**: Track user session validity and provide authentication context to UI components.

**Fields**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `user` | User | Yes | Valid User object | The authenticated user's data |
| `expires` | string | No | ISO 8601 datetime | Session expiration timestamp |

**States**:
- **Authenticated**: `data` contains valid Session object
- **Unauthenticated**: `data` is `null`
- **Loading**: `isPending` is `true`
- **Error**: `error` contains Error object

**Example**:

```typescript
{
  user: {
    id: "usr_abc123xyz",
    name: "John Doe",
    email: "john.doe@example.com",
    image: "https://example.com/avatars/john-doe.jpg"
  },
  expires: "2026-01-03T12:00:00.000Z"
}
```

---

### 3. SessionState (Hook Return Type)

Represents the reactive session state returned by the `useSession()` hook.

**Purpose**: Provide session data along with loading and error states for UI conditional rendering.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `data` | Session \| null | Yes | Session object when authenticated, null when not |
| `isPending` | boolean | Yes | `true` during initial session check, `false` after |
| `error` | Error \| null | Yes | Error object if session check failed, null otherwise |
| `refetch` | function | Yes | Function to manually refetch session data |

**State Machine**:

```
Initial State:
{ data: null, isPending: true, error: null }
          ↓
Session Check Request
          ↓
     ┌────┴────┐
     ↓         ↓
 Success     Failure
     ↓         ↓
{ data: Session,    { data: null,
  isPending: false,   isPending: false,
  error: null }       error: Error }
```

**Example - Logged Out**:

```typescript
{
  data: null,
  isPending: false,
  error: null,
  refetch: () => Promise<void>
}
```

**Example - Logged In**:

```typescript
{
  data: {
    user: {
      id: "usr_abc123xyz",
      name: "John Doe",
      email: "john.doe@example.com",
      image: "https://example.com/avatars/john-doe.jpg"
    },
    expires: "2026-01-03T12:00:00.000Z"
  },
  isPending: false,
  error: null,
  refetch: () => Promise<void>
}
```

**Example - Loading**:

```typescript
{
  data: null,
  isPending: true,
  error: null,
  refetch: () => Promise<void>
}
```

**Example - Error**:

```typescript
{
  data: null,
  isPending: false,
  error: Error("Failed to fetch session"),
  refetch: () => Promise<void>
}
```

---

## Entity Relationships

```
SessionState (useSession() return value)
    │
    ├─→ data: Session | null
    │       │
    │       └─→ user: User
    │               │
    │               ├─→ id: string
    │               ├─→ name: string | null
    │               ├─→ email: string
    │               └─→ image: string | null
    │
    ├─→ isPending: boolean
    ├─→ error: Error | null
    └─→ refetch: () => Promise<void>
```

**Cardinality**:
- One `SessionState` per application instance
- One `Session` per authenticated user
- One `User` per session

**Lifecycle**:
1. Application loads → `SessionState` initialized with `isPending: true`
2. Session check completes → `SessionState` updated with `data` (if authenticated) or `error` (if failed)
3. User logs in → `SessionState.data` becomes non-null
4. User logs out → `SessionState.data` becomes null
5. Session expires → `SessionState.data` becomes null (handled by backend in future phases)

---

## TypeScript Type Definitions

**Location**: `phase-2/frontend/lib/types/auth.ts` (to be created)

```typescript
/**
 * Represents an authenticated user's profile information.
 */
export interface User {
  /** Unique user identifier */
  id: string

  /** User's full name (used for initials generation) */
  name: string | null

  /** User's email address */
  email: string

  /** Profile picture URL (optional) */
  image?: string | null
}

/**
 * Represents an active user session.
 */
export interface Session {
  /** The authenticated user's data */
  user: User

  /** Session expiration timestamp (ISO 8601 format) */
  expires?: string
}

/**
 * Represents the session state returned by useSession() hook.
 */
export interface SessionState {
  /** Session data when authenticated, null when not */
  data: Session | null

  /** Loading state during session check */
  isPending: boolean

  /** Error object if session check failed */
  error: Error | null

  /** Function to manually refetch session data */
  refetch: () => Promise<void>
}

/**
 * Better Auth client configuration options.
 */
export interface AuthClientConfig {
  /** Base URL of the auth server (optional if same domain) */
  baseURL?: string

  /** Custom fetch options for error handling */
  fetchOptions?: {
    onSuccess?: (ctx: any) => void
    onError?: (ctx: any) => void
  }

  /** Extension plugins */
  plugins?: any[]
}
```

---

## Component Data Flow

### 1. Navbar Component

**Consumes**: `SessionState` from `useSession()` hook

**Rendering Logic**:
```typescript
const { data: session, isPending, error } = useSession()

if (isPending) {
  return <LoadingIndicator />
}

if (session) {
  return <UserNav user={session.user} />
}

return <LoginButton />
```

### 2. LoginButton Component

**Consumes**: No session data (renders when `session === null`)

**Props**: None required

**Behavior**:
- Displays "Sign In" and "Sign Up" buttons
- Click handlers log to console (non-functional placeholder)
- Renders only when user is NOT authenticated

### 3. UserNav Component

**Consumes**: `User` object from session

**Props**:
```typescript
interface UserNavProps {
  user: User
}
```

**Rendering Logic**:
```typescript
// Avatar display priority:
1. If user.image exists and loads successfully → Show profile picture
2. If user.image fails to load or doesn't exist → Show initials
3. If user.name is null → Show default placeholder icon

// Initials generation:
function getInitials(name: string | null): string {
  if (!name) return ''

  const trimmed = name.trim()
  const words = trimmed.split(/\s+/)

  if (words.length === 1) {
    return words[0][0].toUpperCase()
  }

  // Take first letter of first word and last word
  const first = words[0][0]
  const last = words[words.length - 1][0]
  return (first + last).toUpperCase()
}
```

---

## Validation Rules

### User Name Validation

| Input | Expected Initials | Rationale |
|-------|-------------------|-----------|
| "John Doe" | "JD" | Standard first + last name |
| "Madonna" | "M" | Single name → first letter only |
| "Jean-Paul Sartre" | "JS" | Hyphen treated as word separator |
| "Mary Jane Watson" | "MW" | Three names → first + last |
| "José García" | "JG" | Accented characters preserved |
| "李明" | "李明" | Non-Latin characters preserved |
| "🎨 Artist" | "🎨A" | Emoji treated as character |
| "   Spaces   " | "S" | Whitespace trimmed |
| null | "" (default icon) | No name → show icon |

### Image URL Validation

**Constraints**:
- Must be valid HTTP/HTTPS URL
- Must point to image resource (MIME type: image/*)
- Failure to load triggers fallback to initials

**Example Valid URLs**:
- `https://example.com/avatar.jpg`
- `https://cdn.example.com/users/123/profile.png`
- `https://gravatar.com/avatar/hash`

**Invalid/Fallback Cases**:
- `null` → Show initials immediately
- `undefined` → Show initials immediately
- `""` (empty string) → Show initials immediately
- 404 error → Show initials after load failure
- Network error → Show initials after timeout

---

## Mock Data Fixtures

**Location**: `phase-2/frontend/__tests__/fixtures/auth-mocks.ts`

```typescript
export const mockUsers = {
  withImage: {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    image: "https://example.com/john.jpg"
  },

  withoutImage: {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    image: null
  },

  firstNameOnly: {
    id: "user-3",
    name: "Madonna",
    email: "madonna@example.com",
    image: null
  },

  noName: {
    id: "user-4",
    name: null,
    email: "user4@example.com",
    image: null
  },

  specialCharacters: {
    id: "user-5",
    name: "José García",
    email: "jose@example.com",
    image: null
  }
}

export const mockSessions = {
  authenticated: {
    user: mockUsers.withImage,
    expires: "2026-01-03T12:00:00.000Z"
  },

  authenticatedNoImage: {
    user: mockUsers.withoutImage,
    expires: "2026-01-03T12:00:00.000Z"
  },

  unauthenticated: null
}

export const mockSessionStates = {
  loggedIn: {
    data: mockSessions.authenticated,
    isPending: false,
    error: null,
    refetch: vi.fn()
  },

  loggedOut: {
    data: null,
    isPending: false,
    error: null,
    refetch: vi.fn()
  },

  loading: {
    data: null,
    isPending: true,
    error: null,
    refetch: vi.fn()
  },

  error: {
    data: null,
    isPending: false,
    error: new Error("Failed to fetch session"),
    refetch: vi.fn()
  }
}
```

---

## State Transitions

### Session State Machine

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  INITIAL STATE                                  │
│  { data: null, isPending: true, error: null }   │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ Session Check
                 │
         ┌───────┴───────┐
         │               │
         ↓               ↓
    SUCCESS           FAILURE
         │               │
         ↓               ↓
┌─────────────────┐  ┌──────────────────┐
│ AUTHENTICATED   │  │  ERROR STATE      │
│ data: Session   │  │  data: null       │
│ isPending: false│  │  isPending: false │
│ error: null     │  │  error: Error     │
└─────────────────┘  └──────────────────┘
         │
         │ User logs out
         │
         ↓
┌─────────────────┐
│ UNAUTHENTICATED │
│ data: null      │
│ isPending: false│
│ error: null     │
└─────────────────┘
```

**Triggers**:
- Page load → INITIAL STATE
- Session check success → AUTHENTICATED
- Session check failure → ERROR STATE (defaults to UNAUTHENTICATED UI)
- User logout → UNAUTHENTICATED
- Session expiry → UNAUTHENTICATED (future backend feature)
- Manual `refetch()` call → INITIAL STATE

---

## Performance Considerations

### Success Criteria from Spec

- **SC-001**: Navbar correctly displays authentication state within **500ms** of page load
- **SC-004**: Session state changes update navbar UI within **200ms** with no visible flickering

### Data Optimization

1. **Lazy Loading**: Session check only happens on client-side mount (not during SSR)
2. **Memoization**: User name → initials conversion should be memoized to avoid recalculation
3. **Image Preloading**: Consider preloading profile pictures to reduce perceived latency
4. **Debouncing**: If session state changes rapidly, debounce UI updates to prevent flickering

### Memory Footprint

**Per-user data size**: ~200-500 bytes
- User ID: ~20 bytes
- Name: ~50-100 bytes (average)
- Email: ~30-50 bytes (average)
- Image URL: ~100-200 bytes (average)

**Total session state**: <1 KB per user

---

## Security Considerations

**Important**: This is a CLIENT-SIDE ONLY implementation. No sensitive data is stored or validated.

### Data Exposure

- All session data is visible in browser memory
- No encryption or obfuscation applied
- Profile pictures loaded from public URLs (no authentication required)

### Future Backend Integration

When backend is implemented:
- Session validation will happen server-side
- JWT tokens will be stored in HTTP-only cookies (not accessible to JavaScript)
- User data will come from authenticated API endpoints
- This data model structure remains compatible

---

## Summary

This data model defines three core entities:

1. **User**: Profile information for avatar rendering
2. **Session**: Authentication state wrapper
3. **SessionState**: Reactive hook state for UI components

**Key Characteristics**:
- Client-side only (no database schema)
- Optimized for UI rendering performance
- Handles all edge cases (special characters, missing data, errors)
- Compatible with Better Auth's session structure
- Ready for future backend integration without breaking changes

**Next Steps**:
- Generate API contracts in `/contracts/` directory
- Create TypeScript interfaces in `lib/types/auth.ts`
- Implement mock fixtures for testing
