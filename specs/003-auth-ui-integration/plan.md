# Implementation Plan: Better Auth UI Integration for Navbar

**Branch**: `003-auth-ui-integration` | **Date**: 2026-01-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-auth-ui-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate Better Auth React client library into the Next.js frontend to enable conditional navbar rendering based on user session state. When logged out, display "Sign In" and "Sign Up" buttons. When logged in (mocked), display a circular user avatar showing profile picture or initials. This is a non-functional UI integration only - no backend auth routes, no database connection. The goal is to establish client-side code structure (auth-client.ts) and visual conditional rendering patterns for future backend integration.

## Technical Context

**Language/Version**: TypeScript 5.7+, React 19, Next.js 16.0.3 (App Router)
**Primary Dependencies**:
- better-auth (core authentication library)
- @better-auth/react (React hooks and client utilities)
- Existing: Shadcn UI (Button, Avatar components), Lucide React (icons), next-themes (theme management)

**Storage**: N/A (client-side only, no backend storage for this phase)
**Testing**: NEEDS CLARIFICATION (React Testing Library, Playwright, or Vitest for component testing)
**Target Platform**: Web browsers (modern evergreen browsers supporting ES2020+)
**Project Type**: Web application (frontend only for this feature)
**Performance Goals**:
- Session state check completes within 500ms of page load
- UI state transitions complete within 200ms
- No layout shifts or flickering during auth state changes

**Constraints**:
- Must work without backend API routes or database connection
- Sign In/Sign Up buttons are non-functional placeholders (console.log only)
- Must maintain existing Navbar functionality (theme toggle, navigation links)
- Must use existing TaskHive design system (Shadcn UI components)
- Avatar must gracefully handle missing profile pictures with initials fallback

**Scale/Scope**:
- Single Navbar component modification
- 3 new components (auth-client.ts, LoginButton, UserNav)
- ~200-300 lines of new code
- 2-3 new dependencies (better-auth, @better-auth/react)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **No Task = No Code**: Will generate tasks.md after planning phase
✅ **Technology Stack Evolution**: Using Next.js 16+ as mandated by constitution
⚠️ **JWT-based Authentication**: Using Better Auth (supports JWT) but NOT implementing actual JWT validation in this phase (UI only)
N/A **AI Chatbot Interface**: Not applicable to this feature
N/A **Event-Driven Architecture**: Not applicable to this feature
N/A **Containerized Deployment**: Not applicable to this feature (frontend-only change)

### Technical Constraints Compliance

✅ **Stateless Systems**: Client-side only, no server state for this phase
✅ **No Hardcoding Secrets**: No secrets involved (UI-only, mock session data)
✅ **Cloud-Native Patterns**: Following React/Next.js best practices for client components
N/A **Observability**: Not applicable to client-side UI component

### Development Workflow Compliance

✅ **Spec-Driven Approach**: Specification created and validated in spec.md
✅ **Code Reviews Required**: Will follow PR process after implementation
✅ **Automated Testing**: Testing strategy to be defined in research phase
✅ **Technology Stack Requirements**: Using mandated Next.js 16+ and React 19

### Gate Status: ✅ PASS

**Justification for ⚠️ JWT Warning**: This phase establishes the client-side UI structure for Better Auth integration. Actual JWT validation and backend authentication will be implemented in a future phase when backend API routes are created. This is explicitly documented in the spec's "Out of Scope" section and aligns with the phased approach to building the authentication system.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
phase-2/frontend/                    # Next.js 16+ App Router frontend
├── app/
│   ├── layout.tsx                  # [EXISTING] Root layout with providers
│   └── page.tsx                    # [EXISTING] Home page
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx              # [MODIFY] Add auth state conditional rendering
│   │   └── Footer.tsx              # [EXISTING] No changes
│   ├── auth/                       # [NEW] Authentication UI components
│   │   ├── LoginButton.tsx         # [NEW] Sign In/Sign Up buttons
│   │   └── UserNav.tsx             # [NEW] User avatar dropdown
│   └── ui/                         # [EXISTING] Shadcn UI components
│       ├── button.tsx              # [EXISTING] Used by LoginButton
│       └── avatar.tsx              # [EXISTING] Used by UserNav
├── lib/
│   └── auth-client.ts              # [NEW] Better Auth client configuration
├── hooks/
│   └── use-mock-todos.ts           # [EXISTING] No changes
├── package.json                    # [MODIFY] Add better-auth dependencies
└── tsconfig.json                   # [EXISTING] No changes

tests/                              # [NEW] Component tests (Phase 0 research)
├── components/
│   └── auth/
│       ├── LoginButton.test.tsx   # [NEW] Test placeholder behavior
│       └── UserNav.test.tsx       # [NEW] Test avatar rendering
└── lib/
    └── auth-client.test.ts        # [NEW] Test client initialization
```

**Structure Decision**: Web application structure (frontend only). This feature modifies the existing `phase-2/frontend/` directory structure by:
1. Adding a new `components/auth/` directory for authentication UI components
2. Creating `lib/auth-client.ts` for centralized Better Auth client configuration
3. Modifying the existing `components/layout/Navbar.tsx` to conditionally render auth components
4. Adding test files to validate component behavior (testing framework TBD in Phase 0)

**No backend changes** are required for this phase as per the non-functional constraint.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations identified.** All constitution principles are either satisfied or not applicable to this frontend-only UI feature. The ⚠️ JWT warning is addressed by the phased implementation approach documented in the specification.
