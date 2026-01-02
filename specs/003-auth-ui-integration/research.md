# Research: Better Auth UI Integration for Navbar

**Feature**: 003-auth-ui-integration
**Date**: 2026-01-02
**Phase**: 0 (Research & Design)

## Research Questions

This research phase resolves all "NEEDS CLARIFICATION" items from the Technical Context section of plan.md:

1. **Testing Framework Selection**: What testing approach should we use for React 19 components?
2. **Better Auth Client Configuration**: How does Better Auth work without a backend?
3. **Mock Session Data Strategy**: How to test auth UI without actual authentication?
4. **Component Testing Patterns**: How to test hooks like useSession()?

---

## 1. Better Auth React Client Integration

### Installation & Configuration

**Decision**: Install `better-auth` package (includes both server and client utilities)

```bash
npm install better-auth
```

**Package Split**:
- `better-auth/react` - For React client components (useSession hook)
- `better-auth/client` - For server-side usage (middleware, server actions)

### Client Setup Pattern

**Rationale**: Centralized auth client in `lib/auth-client.ts` for consistent usage across components

```typescript
// phase-2/frontend/lib/auth-client.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
})

export const { signIn, signUp, signOut, useSession } = authClient
```

**Configuration Options**:
- `baseURL`: Auth server URL (optional if same domain)
- `fetchOptions`: Custom fetch options for error handling
- `plugins`: Extension points for custom auth features

### useSession() Hook Behavior

**Returns**:
```typescript
{
    data: Session | null,        // Session object or null when logged out
    isPending: boolean,          // Loading state during initial fetch
    error: Error | null,         // Error object if fetch failed
    refetch: () => Promise<void> // Manual refetch function
}
```

**Session Data Structure**:
```typescript
{
    user: {
        id: string,
        email: string,
        name: string,
        image?: string
    },
    session: {
        userId: string,
        // ... session metadata
    }
}
```

**Key Features**:
- Built on nanostores for reactive state management
- Automatically re-renders components on session changes
- Framework-agnostic (works with React, Vue, Svelte, etc.)

---

## 2. Client-Only Setup Without Backend

### Critical Finding

**Better Auth REQUIRES a backend server** - it cannot function in client-only mode because:

1. All authentication operations hit server endpoints (`/api/auth/*`)
2. Session validation requires server-side verification
3. Client methods make HTTP requests to the auth server
4. No built-in mock/local session data support

### Behavior Without Backend

When no backend is configured:

```typescript
const { data, error, isPending } = authClient.useSession()
// Result:
// - data: null (no session)
// - error: { message: "Failed to fetch", status: undefined }
// - isPending: false (after initial fetch attempt)
```

**Expected Behavior for This Phase**:
- `useSession()` will attempt to fetch from `/api/auth/get-session`
- Will fail gracefully with error (backend not implemented yet)
- `data` will be `null` → Navbar shows "Sign In" / "Sign Up" buttons
- This is the **correct default state** for the non-functional prototype

### Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Mock session data in createAuthClient() | Better Auth doesn't support mock session data configuration |
| Create fake API endpoint that returns mock JSON | Adds unnecessary backend complexity for UI-only phase |
| Use React Context to override session state | Would bypass Better Auth patterns, harder to test |
| Implement minimal backend now | Out of scope - spec explicitly says "no backend routes" |

**Decision**: Accept that `useSession()` will return `null` (logged-out state) as the natural default behavior. This aligns with the spec requirement that "Sign In/Sign Up buttons are non-functional placeholders" and demonstrates the UI structure without requiring backend work.

---

## 3. Testing Strategy

### Decision: Vitest + React Testing Library + Playwright

**Rationale**:
- **Vitest**: Modern, fast test runner with native TypeScript support
- **React Testing Library**: User-centric component testing (tests behavior, not implementation)
- **Playwright**: E2E testing for browser behavior validation

### Why Vitest over Jest?

| Criterion | Vitest | Jest |
|-----------|--------|------|
| Speed | ✅ Instant HMR | ❌ Slower cold starts |
| ES Modules | ✅ Native support | ⚠️ Requires config |
| TypeScript | ✅ Built-in | ⚠️ Needs ts-jest |
| Bundle Size | ✅ Smaller | ❌ Larger |
| Next.js 16+ | ✅ Works seamlessly | ✅ Works with config |
| Team Size | ✅ Great for medium projects | ✅ Better for large teams |

**Decision**: Vitest for this project due to development velocity benefits and smaller scope.

### Testing Framework Installation

```bash
npm install -D vitest @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom jsdom @vitest/ui
```

**Dependencies Explained**:
- `vitest` - Test runner
- `@testing-library/react` - Component testing utilities for React 19
- `@testing-library/user-event` - User interaction simulation (clicks, typing)
- `@testing-library/jest-dom` - Custom matchers (toBeInTheDocument, toHaveTextContent)
- `jsdom` - DOM implementation for Node.js
- `@vitest/ui` - Visual test runner UI

### Test Directory Structure

```text
phase-2/frontend/
├── __tests__/
│   ├── setup.ts                        # Vitest global setup
│   ├── fixtures/
│   │   └── auth-mocks.ts              # Mock session data
│   ├── components/
│   │   └── auth/
│   │       ├── LoginButton.test.tsx   # Sign In/Sign Up buttons
│   │       ├── UserNav.test.tsx       # Avatar rendering
│   │       └── Navbar.test.tsx        # Conditional rendering integration
│   └── lib/
│       └── auth-client.test.ts        # Client initialization
├── vitest.config.ts                    # Test configuration
└── package.json                        # Add test scripts
```

### Test Scripts to Add

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

---

## 4. Mock Session Data Strategy

### Mock Data Fixtures

**Purpose**: Test all avatar rendering scenarios without backend

```typescript
// __tests__/fixtures/auth-mocks.ts
export const mockSessions = {
  loggedOut: null,

  loggedInWithImage: {
    user: {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      image: "https://example.com/john.jpg"
    }
  },

  loggedInWithoutImage: {
    user: {
      id: "user-2",
      name: "Jane Smith",
      email: "jane@example.com",
      image: null
    }
  },

  loggedInFirstNameOnly: {
    user: {
      id: "user-3",
      name: "Madonna",
      email: "madonna@example.com",
      image: null
    }
  },

  loggedInNoName: {
    user: {
      id: "user-4",
      name: null,
      email: "user4@example.com",
      image: null
    }
  }
}
```

### Testing useSession() Hook

**Pattern**: Mock the auth client module at the test level

```typescript
// Example test pattern
import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/layout/Navbar'
import { mockSessions } from '@/__tests__/fixtures/auth-mocks'

// Mock the auth client
vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({
    data: mockSessions.loggedInWithImage,
    isPending: false,
    error: null
  })
}))

test('shows user avatar when logged in', () => {
  render(<Navbar />)
  expect(screen.getByAltText('User Avatar')).toBeInTheDocument()
})
```

**Alternatives Considered**:
- Context Provider wrapper → More complex, not needed for simple mocks
- Test-specific auth client configuration → Better Auth doesn't support test mode
- MSW (Mock Service Worker) → Overkill for unit tests, better for E2E

**Decision**: Mock at the module level using Vitest's `vi.mock()` for component unit tests.

---

## 5. Component Testing Patterns

### Testing Conditional Rendering

**Critical Test Cases**:

```typescript
// Test Case 1: Logged Out State
describe('Navbar - Logged Out', () => {
  beforeEach(() => {
    vi.mock('@/lib/auth-client', () => ({
      useSession: () => ({ data: null, isPending: false, error: null })
    }))
  })

  test('displays Sign In button', () => {
    render(<Navbar />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  test('displays Sign Up button', () => {
    render(<Navbar />)
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  test('does not display user avatar', () => {
    render(<Navbar />)
    expect(screen.queryByAltText('User Avatar')).not.toBeInTheDocument()
  })
})

// Test Case 2: Logged In State
describe('Navbar - Logged In', () => {
  beforeEach(() => {
    vi.mock('@/lib/auth-client', () => ({
      useSession: () => ({
        data: mockSessions.loggedInWithImage,
        isPending: false,
        error: null
      })
    }))
  })

  test('displays user avatar', () => {
    render(<Navbar />)
    expect(screen.getByAltText('User Avatar')).toBeInTheDocument()
  })

  test('does not display Sign In/Sign Up buttons', () => {
    render(<Navbar />)
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument()
  })
})

// Test Case 3: Loading State
describe('Navbar - Loading', () => {
  beforeEach(() => {
    vi.mock('@/lib/auth-client', () => ({
      useSession: () => ({ data: null, isPending: true, error: null })
    }))
  })

  test('shows loading state', () => {
    render(<Navbar />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
```

### Testing Avatar Fallback Logic

```typescript
describe('UserNav Avatar', () => {
  test('displays profile picture when available', () => {
    render(<UserNav session={mockSessions.loggedInWithImage} />)
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveAttribute('src', expect.stringContaining('john.jpg'))
  })

  test('displays initials when picture unavailable', () => {
    render(<UserNav session={mockSessions.loggedInWithoutImage} />)
    expect(screen.getByText('JS')).toBeInTheDocument() // Jane Smith → JS
  })

  test('displays first initial only when single name', () => {
    render(<UserNav session={mockSessions.loggedInFirstNameOnly} />)
    expect(screen.getByText('M')).toBeInTheDocument() // Madonna → M
  })

  test('displays default icon when no name', () => {
    render(<UserNav session={mockSessions.loggedInNoName} />)
    expect(screen.getByTestId('default-avatar-icon')).toBeInTheDocument()
  })
})
```

---

## 6. Performance Testing Approach

### Success Criteria from Spec

- **SC-001**: Navbar displays auth state within 500ms of page load
- **SC-004**: Session state changes update navbar within 200ms with no flickering

### Testing Strategy

**Unit Level**: Use Vitest's `vi.useFakeTimers()` to verify timing constraints

```typescript
test('session state check completes within 500ms', async () => {
  vi.useFakeTimers()
  render(<Navbar />)

  vi.advanceTimersByTime(500)
  await waitFor(() => {
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  vi.useRealTimers()
})
```

**E2E Level**: Use Playwright's performance API

```typescript
test('navbar loads without layout shift', async ({ page }) => {
  await page.goto('/')

  // Measure cumulative layout shift (CLS)
  const cls = await page.evaluate(() => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        let clsScore = 0
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value
          }
        }
        resolve(clsScore)
      })
      observer.observe({ type: 'layout-shift', buffered: true })
    })
  })

  expect(cls).toBeLessThan(0.1) // Good CLS score
})
```

---

## 7. Edge Case Testing

### Special Characters in Names

**Test Cases**:

```typescript
const edgeCaseNames = [
  { name: "José García", expected: "JG" },
  { name: "李明", expected: "李明" }, // Chinese characters
  { name: "🎨 Artist", expected: "🎨A" }, // Emoji
  { name: "Jean-Paul Sartre", expected: "JS" }, // Hyphenated
  { name: "Mary Jane Watson", expected: "MW" }, // Three names → first + last
  { name: "A", expected: "A" }, // Single character
  { name: "   Spaces   ", expected: "S" }, // Trimming
]

edgeCaseNames.forEach(({ name, expected }) => {
  test(`generates correct initials for "${name}"`, () => {
    const session = { user: { name, email: 'test@example.com', image: null } }
    render(<UserNav session={session} />)
    expect(screen.getByText(expected)).toBeInTheDocument()
  })
})
```

### Image Loading Errors

```typescript
test('falls back to initials when image fails to load', async () => {
  const session = mockSessions.loggedInWithImage
  render(<UserNav session={session} />)

  // Simulate image load error
  const img = screen.getByRole('img')
  fireEvent.error(img)

  // Should show initials instead
  expect(screen.getByText('JD')).toBeInTheDocument()
})
```

---

## 8. Recommended Implementation Order

### Phase 1A: Setup Testing Infrastructure

1. Install testing dependencies
2. Create `vitest.config.ts`
3. Create `__tests__/setup.ts` with custom render utilities
4. Create `__tests__/fixtures/auth-mocks.ts`
5. Add test scripts to `package.json`

### Phase 1B: Implement Auth Client

1. Create `lib/auth-client.ts` with `createAuthClient()`
2. Write unit tests for auth client initialization
3. Document expected behavior when backend unavailable

### Phase 1C: Create Auth Components (TDD Approach)

1. Write tests for `LoginButton` component
2. Implement `LoginButton` to pass tests
3. Write tests for `UserNav` component
4. Implement `UserNav` to pass tests
5. Write tests for updated `Navbar` component
6. Modify `Navbar` to pass tests

### Phase 1D: Edge Case Testing

1. Add tests for special characters in names
2. Add tests for image loading errors
3. Add tests for loading states
4. Add tests for error states
5. Add tests for performance requirements (timing)

### Phase 2: Integration & E2E Testing

1. Set up Playwright (if time permits)
2. Write E2E tests for user journeys
3. Verify layout shift metrics
4. Test across different browsers

---

## 9. Open Questions & Risks

### Questions Resolved

✅ **Q**: Does Better Auth work without a backend?
**A**: No, but `useSession()` will return `null` (logged-out state) which is acceptable for this phase.

✅ **Q**: What testing framework should we use?
**A**: Vitest + React Testing Library for unit/component tests, Playwright for E2E.

✅ **Q**: How do we test hooks like `useSession()`?
**A**: Mock the auth client module using `vi.mock()` at the test level.

### Remaining Risks

⚠️ **Risk**: Better Auth client will show console errors when backend unavailable
**Mitigation**: Add custom error handler in `fetchOptions` to suppress expected errors

⚠️ **Risk**: Future backend integration may require refactoring auth client config
**Mitigation**: Keep auth client configuration centralized in `lib/auth-client.ts` for easy updates

⚠️ **Risk**: Testing with mocked hooks may not catch integration issues
**Mitigation**: Add integration tests that use actual Better Auth client (when backend ready)

---

## 10. Summary & Next Steps

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Testing**: Vitest + RTL | Modern, fast, excellent React 19 support |
| **Mock Strategy**: Module-level mocks | Simplest approach for component unit tests |
| **Backend**: Accept null session | Natural default state, no backend needed yet |
| **Better Auth**: Install full package | Includes both client and server for future phases |
| **Test Priority**: Conditional rendering | Core feature requirement from spec |

### Implementation Readiness

✅ All "NEEDS CLARIFICATION" items from Technical Context resolved
✅ Testing strategy defined with clear patterns
✅ Mock data fixtures designed
✅ Edge cases identified and test cases defined
✅ Performance testing approach documented

### Next Phase: Phase 1 (Design & Contracts)

Proceed to:
1. Generate `data-model.md` for session/user entities
2. Generate API contracts in `/contracts/` directory
3. Generate `quickstart.md` for setup instructions
4. Update agent context with new technologies

**Research phase complete. Ready for Phase 1.**
