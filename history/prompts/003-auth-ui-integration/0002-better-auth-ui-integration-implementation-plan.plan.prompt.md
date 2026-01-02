---
id: 0002
title: Better Auth UI Integration Implementation Plan
stage: plan
date: 2026-01-02
surface: agent
model: claude-sonnet-4-5
feature: 003-auth-ui-integration
branch: 003-auth-ui-integration
user: hammadurrehman2006
command: /sp.plan
labels: ["implementation-plan", "better-auth", "ui-integration", "design-phase", "architecture"]
links:
  spec: /home/hammadurrehman2006/Desktop/the_evolution_of_todo/specs/003-auth-ui-integration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-auth-ui-integration/plan.md
  - specs/003-auth-ui-integration/research.md
  - specs/003-auth-ui-integration/data-model.md
  - specs/003-auth-ui-integration/contracts/auth-client-api.md
  - specs/003-auth-ui-integration/quickstart.md
  - CLAUDE.md (agent context updated)
tests:
  - Research phase: Better Auth integration patterns validated via MCP
  - Testing framework selection: Vitest recommended for React 19 components
---

## Prompt

Generate a technical implementation plan based on specs/features/auth-ui-integration.md for the frontend/ directory.

Dependencies: Plan to install the better-auth library and @better-auth/react components.

Infrastructure: Create frontend/lib/auth-client.ts to export the authClient instance using createAuthClient.

Component Architecture: Plan modifications to the existing Navbar component. It should use the useSession hook from the auth client.

UI Elements:

Plan a LoginButton component that (for now) just logs "Sign In Clicked" to the console.

Plan a UserNav component that displays the Shadcn Avatar component.

Update the Navbar to toggle between these two based on session.data.

Mocking (Optional): Explicitly note that since the backend isn't ready, the useSession hook will naturally return null (logged out), so the default view will be the "Sign In" buttons, which is the expected behavior for this phase.

## Response snapshot

Successfully completed comprehensive implementation planning for Better Auth UI integration following the `/sp.plan` workflow:

### Phase 0: Research & Analysis

**Better Auth Integration Research**:
- Confirmed Better Auth requires backend server (no client-only mode)
- `createAuthClient()` config patterns documented
- `useSession()` hook behavior analyzed: returns `{ data: null, isPending: false, error: Error }` when backend unavailable
- Key finding: Graceful degradation to logged-out state is expected behavior for non-functional prototype

**Testing Strategy Research**:
- Selected Vitest over Jest for modern, fast React 19 testing
- React Testing Library for user-centric component testing
- Playwright for E2E browser behavior validation
- Mock strategy: Module-level mocking using `vi.mock()` for `useSession()` hook
- Created comprehensive test fixture patterns for all session states

**Deliverables**:
- `research.md` (1,200+ lines): Detailed Better Auth patterns, testing approaches, edge case handling
- All "NEEDS CLARIFICATION" items from Technical Context resolved

### Phase 1: Design & Contracts

**Data Model Design**:
- Defined 3 core entities: User, Session, SessionState
- User entity with validation rules for initials generation (handles special characters, emojis, Chinese characters)
- Session state machine with 4 states: authenticated, unauthenticated, loading, error
- TypeScript interfaces with complete type safety

**API Contract Definition**:
- `createAuthClient()` configuration interface
- `useSession()` hook return type specification
- Component props contracts (LoginButton, UserNav)
- Future backend endpoints documented (not implemented yet)
- Error handling strategy: suppress expected 404s, default to logged-out UI

**Implementation Guidance**:
- `quickstart.md` with step-by-step 2-3 hour implementation guide
- Vitest configuration patterns
- Mock data fixtures for testing
- Component test examples with edge cases
- Validation checklist and troubleshooting guide

**Project Structure**:
```
phase-2/frontend/
├── lib/auth-client.ts               [NEW] Better Auth client config
├── components/auth/
│   ├── LoginButton.tsx             [NEW] Sign In/Sign Up buttons
│   └── UserNav.tsx                 [NEW] Avatar with initials fallback
├── components/layout/Navbar.tsx    [MODIFY] Add conditional auth rendering
├── __tests__/
│   ├── setup.ts                    [NEW] Vitest config
│   ├── fixtures/auth-mocks.ts      [NEW] Mock session data
│   └── components/auth/*.test.tsx  [NEW] Component tests
└── vitest.config.ts                [NEW] Test runner config
```

**Constitution Check**: ✅ PASS
- All principles satisfied or not applicable
- JWT authentication principle addressed via phased approach
- No violations requiring justification

### Key Technical Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| **Testing**: Vitest + RTL | Modern, fast, React 19 support | Jest (slower, more config) |
| **Mock Strategy**: Module-level | Simplest for unit tests | Context providers (overkill) |
| **Backend Approach**: Accept null session | Natural default, no backend needed | Fake API endpoint (unnecessary) |
| **Error Handling**: Suppress 404s | Expected behavior when backend not ready | Show error messages (confusing UX) |

### Deliverables Summary

1. **plan.md** (130 lines): Technical context, constitution check, project structure
2. **research.md** (1,200+ lines): Comprehensive Better Auth and testing research
3. **data-model.md** (600+ lines): Entity definitions, validation rules, state machine
4. **contracts/auth-client-api.md** (800+ lines): TypeScript API contracts, error handling
5. **quickstart.md** (500+ lines): Step-by-step implementation guide with examples
6. **CLAUDE.md**: Updated agent context with new technologies

**Total Planning Documentation**: ~3,200 lines

## Outcome

- ✅ Impact: Complete implementation plan ready for tasks generation. Provides detailed technical architecture, testing strategy, and quickstart guide for Better Auth UI integration. All "NEEDS CLARIFICATION" items resolved through comprehensive research.
- 🧪 Tests: Testing strategy defined with Vitest + RTL + Playwright. Mock data fixtures designed. Component test patterns documented. Coverage targets set (>80% for auth components).
- 📁 Files: Created 5 planning artifacts (plan.md, research.md, data-model.md, contracts/auth-client-api.md, quickstart.md). Updated agent context (CLAUDE.md). Total ~3,200 lines of documentation.
- 🔁 Next prompts: `/sp.tasks` to generate atomic implementation tasks from planning artifacts.
- 🧠 Reflection: Planning successfully addresses the non-functional constraint (no backend) by documenting expected behavior (null session → logged-out UI). Research phase discovered Better Auth requires backend but validated graceful degradation approach. Quickstart provides 2-3 hour implementation path with comprehensive testing guidance.

## Evaluation notes (flywheel)

- Failure modes observed: None. Workflow executed smoothly. Research agents successfully retrieved Better Auth and testing framework documentation.
- Graders run and results (PASS/FAIL): Constitution Check - PASS. Technical Context - PASS (all clarifications resolved). Research completeness - PASS. Contract clarity - PASS. Quickstart actionability - PASS.
- Prompt variant (if applicable): Standard /sp.plan workflow with detailed user requirements for component architecture and mocking strategy.
- Next experiment (smallest change to try): Consider adding Storybook setup for visual component development alongside Vitest tests to enable design iteration without backend dependency.
