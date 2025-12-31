# Implementation Plan: Professional Productivity Suite Frontend

**Branch**: `002-productivity-suite` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-productivity-suite/spec.md`

**Note**: This template is filled in by `/sp.plan` command. See `.specify/templates/commands/plan.md` for execution workflow.

## Summary

This plan implements a Professional Productivity Suite frontend in `/phase-2/frontend` using Next.js 16 App Router with a three-tiered animation stack: Framer Motion for micro-interactions, GSAP for timeline-based entry effects, and Lenis for smooth inertial scrolling. The application includes a landing page, dashboard with task CRUD, search/filter/sort capabilities, and industrial Lyons Blue (#005871) branding with Urban Steel (#7B7B7A) accents.

**Technical Approach**:
- **Framework**: Next.js 16 App Router (Server Components first, Client Components selective)
- **Animation Stack**: Framer Motion (micro-interactions) + GSAP (timelines) + Lenis (scroll)
- **UI Components**: Flowbite MCP for Navbar, Modal, Sidebar blocks with custom theme
- **State Management**: Server-first architecture with granular Client Components
- **Theme Persistence**: Session-aware via cookies with zero-flicker hydration
- **Performance**: Optimized for 10,000 tasks, <1s interactions, WCAG 2.2 AA accessibility

## Technical Context

**Language/Version**: TypeScript 5.7+, React 19, Next.js 16.0.3
**Primary Dependencies**:
- Next.js 16.0.3 (App Router, Server Components)
- React 19 (concurrent features, Server Actions)
- Framer Motion 11.x (micro-interactions, checkmarks)
- GSAP 3.x (@gsap/react 1.x for React integration)
- Lenis 1.x (smooth inertial scrolling)
- Flowbite React (UI component blocks)
- Tailwind CSS 3.x (styling, Flowbite dependency)

**Storage**: Client-side localStorage (not for sensitive data), Cookies (theme persistence), Server API (task data)
**Testing**: Vitest (unit), Playwright (end-to-end), React Testing Library (component)
**Target Platform**: Modern browsers (Chrome 120+, Firefox 125+, Safari 18+, Edge 120+)
**Project Type**: Web application (single frontend under /phase-2)

**Performance Goals**:
- List rendering: Under 1 second for 1,000 tasks
- Large lists: No significant degradation with 10,000 items
- Theme switching: Instant (< 100ms) with zero flicker
- Search response: Under 500ms for 1,000 tasks
- Completion feedback: Immediate visual update (< 100ms)
- Animation FPS: 60fps maintained during GSAP/Framer animations

**Constraints**:
- <100ms p95 for UI interactions (Framer Motion)
- <200ms p95 for form submissions
- <500ms p95 for search/filter operations
- Zero-flicker theme switching (critical requirement)
- WCAG 2.2 Level AA color contrast (minimum 4.5:1 ratio)
- Session-aware theme persistence (cookies, not localStorage)
- No DOM conflicts between Flowbite and GSAP (ADR addresses this)

**Scale/Scope**:
- 1,000 concurrent users (target for MVP)
- 10,000 tasks per user list (max supported)
- 50 screens/pages (landing, dashboard, settings)
- 3 animation layers (page-level, component-level, scroll)
- 10 core components (TaskCard, TaskList, Navbar, Modal, etc.)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate 1: No Task = No Code
**Status**: ✅ PASS
**Justification**: This planning phase generates artifacts (research.md, data-model.md, contracts/) before implementation. No code will be written until /sp.tasks command generates actionable tasks with corresponding implementation tasks.

### Gate 2: Technology Stack Evolution
**Status**: ✅ PASS
**Justification**: Plan uses Next.js 16 App Router (modern React framework), which aligns with constitution's "cloud-native system" evolution from in-memory Python console app. Backend integration with FastAPI/SQLModel/Neon is planned for Phase 3.

### Gate 3: JWT-based Authentication
**Status**: ✅ PASS (deferred to Phase 3)
**Justification**: This frontend phase implements UI components and state management infrastructure. JWT authentication via Better Auth is assigned to backend phase (Phase 3). Frontend will consume auth tokens via cookies once backend is implemented.

### Gate 4: AI Chatbot Interface
**Status**: ⚠️ DEFERRED (not in scope for frontend phase)
**Justification**: AI Chatbot using OpenAI Agents SDK and MCP is assigned to later phase (backend integration). This frontend phase focuses on productivity UI foundation.

### Gate 5: Event-Driven Architecture
**Status**: ⚠️ DEFERRED (not in scope for frontend phase)
**Justification**: Event-driven architecture using Kafka and Dapr is assigned to backend phase. Frontend will consume REST/GraphQL APIs and WebSocket events (for real-time updates) when backend is implemented.

### Gate 6: Containerized Deployment
**Status**: ⚠️ DEFERRED (not in scope for frontend phase)
**Justification**: Containerized deployment via Docker and Kubernetes is assigned to DevOps phase. Frontend artifacts will be prepared for containerization but actual deployment is later phase.

**Gate Summary**: All frontend-specific gates passed. Backend-related gates (JWT, AI Chatbot, Event-Driven, Containerization) are correctly deferrred to backend implementation phase.

## Project Structure

### Documentation (this feature)

```text
specs/002-productivity-suite/
├── spec.md               # Feature requirements (already exists)
├── plan.md               # This file (/sp.plan command output)
├── research.md             # Phase 0 output (already created)
├── data-model.md           # Phase 1 output (already created)
├── quickstart.md           # Phase 1 output (already created)
└── contracts/              # Phase 1 output (already created)
    └── ui-component-contracts.md  # UI component interfaces (already created)
```

### Source Code (phase-2/frontend)

```text
phase-2/frontend/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── globals.css           # Global styles + theme import
│   │   ├── page.tsx             # Landing page
│   │   └── dashboard/
│   │       ├── page.tsx         # Dashboard page
│   │       └── loading.tsx       # Loading skeleton
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx      # Task card with animations
│   │   │   ├── TaskList.tsx       # Task list with filters
│   │   │   └── TaskFormModal.tsx # Task creation/edit modal
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         # Navigation bar
│   │   │   ├── Sidebar.tsx         # Dashboard sidebar
│   │   │   └── Footer.tsx         # Footer component
│   │   └── ui/
│   │       ├── PriorityBadge.tsx  # Priority badge component
│   │       ├── TagList.tsx        # Tag list component
│   │       ├── FilterBar.tsx       # Filter/sort controls
│   │       └── DashboardMetrics.tsx # Statistics display
│   ├── context/
│   │   ├── ThemeContext.tsx     # Theme management (session-aware)
│   │   └── UserContext.tsx      # User session context
│   ├── hooks/
│   │   ├── useGSAPAnimations.ts  # GSAP React integration
│   │   ├── useFramerVariants.ts # Framer Motion utilities
│   │   └── useTheme.ts           # Theme hook
│   ├── lib/
│   │   ├── tasks.ts              # Task API client (placeholder for now)
│   │   ├── animations.ts         # Animation utilities
│   │   ├── lenis.ts             # Lenis initialization
│   │   └── utils.ts              # General utilities
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── styles/
│       └── lyons-blue-theme.css # Flowbite custom theme
├── public/                    # Static assets
├── tests/
│   ├── unit/                # Vitest unit tests
│   └── e2e/                 # Playwright end-to-end tests
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS config
├── next.config.ts              # Next.js configuration
├── vitest.config.ts            # Vitest configuration
└── playwright.config.ts         # Playwright configuration
```

**Structure Decision**: Option 2 (Web application frontend) selected because feature spec explicitly states "frontend" directory under /phase-2/. Backend will be implemented in separate phase. This structure follows Next.js 16 best practices with src/ directory and App Router pattern.

## Complexity Tracking

> **No Constitution violations require justification.** All gates passed or correctly deferrred to appropriate phases.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Architecture Decisions

### Decision 1: Three-Tiered Animation Stack

**Options Considered**:
1. Framer Motion only (for all animations)
2. GSAP only (for all animations)
3. React Spring (single library)

**Selected**: Framer Motion (micro-interactions) + GSAP (timelines) + Lenis (scroll)

**Rationale**:
- **Framer Motion** excels at React-native declarative API for micro-interactions (checkmarks, hover states)
- **GSAP** provides superior timeline sequencing for page-level entry animations
- **Lenis** solves scroll jank with inertial momentum physics
- **Combination** leverages each library's strengths while minimizing weaknesses

**Trade-offs**:
- **Pros**: Best-of-breed animation capabilities, professional polish, performant
- **Cons**: Higher bundle size (3 libraries), learning curve for integration patterns
- **Mitigation**: Code splitting, selective imports, GSAP useGSAP hook for automatic cleanup

### Decision 2: Server-First Architecture

**Options Considered**:
1. Global Zustand store for all state
2. React Context for task data
3. Redux Toolkit for state management

**Selected**: Server-first architecture with granular Client Components

**Rationale**:
- **Next.js 16 Server Components**: Efficient data fetching, reduced client bundle, automatic caching
- **Granular Client Components**: State kept at component level, minimized re-renders
- **Server Actions**: Simplify form handling with optimistic updates

**Trade-offs**:
- **Pros**: Performance, simplified state synchronization, leverages Next.js strengths
- **Cons**: Requires careful component design (when to use 'use client'), backend required for data
- **Mitigation**: Clear patterns documented in quickstart.md, component contracts in contracts/

### Decision 3: Flowbite Component Blocks

**Options Considered**:
1. Radix UI + Headless UI (building from primitives)
2. shadcn/ui (similar to Radix but less MCP support)
3. Custom CSS components (build from scratch)

**Selected**: Flowbite MCP for Navbar, Modal, Sidebar blocks

**Rationale**:
- **MCP Integration**: Direct Flowbite MCP access for component generation
- **Pre-built Components**: ARIA labels, responsive design, dark mode included
- **Tailwind Alignment**: Seamless integration with Next.js 16 default Tailwind setup
- **Custom Theme**: Lyons Blue (#005871) and Urban Steel (#7B7B7A) branding

**Trade-offs**:
- **Pros**: Accelerated development, accessibility built-in, consistent patterns
- **Cons**: Less customization than building from primitives, Flowbite dependency
- **Mitigation**: Custom theme overrides, wrap Flowbite components with custom animations, ADR prevents DOM conflicts

### Decision 4: Theme Persistence Strategy

**Options Considered**:
1. localStorage (client-side only)
2. IndexedDB (client-side database)
3. Cookies (server-accessible)

**Selected**: Cookies with session-aware implementation (SameSite=Strict)

**Rationale**:
- **Session-Aware**: Theme preference accessible to Server Components for SSR
- **Zero-Flicker**: Apply theme class before hydration (critical requirement from FR-029)
- **Security**: SameSite=Strict for CSRF protection (security-auditor assignment)
- **Accessibility**: Works with JavaScript disabled (progressive enhancement)

**Trade-offs**:
- **Pros**: Server-side SSR, secure, zero-flicker, accessible
- **Cons**: 4KB limit per cookie, server coordination needed
- **Mitigation**: Store only theme preference (small payload), security-auditor validates implementation

## Phase 0: Research ✅ COMPLETED

**Output**: `/specs/002-productivity-suite/research.md`

**Key Findings**:
- Framer Motion variants pattern for state transitions
- GSAP useGSAP hook with automatic cleanup and scope isolation
- Lenis integration pattern for smooth scrolling
- Flowbite theme customization with CSS variables
- Next.js 16 Server vs Client Component patterns
- Granular state management strategies (React.memo, useMemo, useCallback)

**Open Questions**: None. All technical decisions resolved through Context7 and Sequential Thinking.

## Phase 1: Design & Contracts ✅ COMPLETED

**Outputs**:
1. `/specs/002-productivity-suite/data-model.md` - Frontend entity definitions
2. `/specs/002-productivity-suite/contracts/ui-component-contracts.md` - UI component interfaces
3. `/specs/002-productivity-suite/quickstart.md` - Setup instructions

**Key Artifacts**:
- **Task Entity**: Full CRUD contract with validation rules
- **Component Contracts**: TypeScript interfaces for all UI components
- **Animation Contracts**: GSAP and Framer Motion patterns defined
- **Quickstart Guide**: Step-by-step setup with code examples

## Next Steps (Phase 2: Tasks Generation)

**Action Required**: Run `/sp.tasks` command to generate actionable tasks for implementation.

**Task Categories** (to be generated):
1. **Setup & Configuration**: Next.js 16 initialization, dependency installation, TypeScript config
2. **Theme & Styling**: Flowbite theme generation, Tailwind configuration, zero-flicker implementation
3. **Core Components**: TaskCard, TaskList, TaskFormModal implementation
4. **Layout Components**: Navbar, Sidebar, Footer with animations
5. **Context & State Management**: ThemeContext, UserContext, granular state hooks
6. **Animation Integration**: GSAP setup, Framer Motion patterns, Lenis initialization
7. **Pages**: Landing page, Dashboard page with real-time updates (placeholder for backend)
8. **Accessibility**: WCAG 2.2 AA compliance verification, keyboard navigation, ARIA labels
9. **Testing**: Unit tests (Vitest), component tests (RTL), e2e tests (Playwright)

## Architecture Decision Record

📋 **Architectural decision detected: Flowbite-GSAP Integration Strategy** — Document reasoning and tradeoffs?

**Decision**: Use GSAP for page-level entry animations while using Flowbite components for UI structure, with strict separation and scoping to prevent DOM conflicts.

**Rationale**:
- GSAP provides superior timeline sequencing for entry animations
- Flowbite provides pre-built accessible components (Navbar, Modal, Sidebar)
- Integration challenge: GSAP manipulating DOM conflicts with Flowbite's Tailwind utility classes

**Trade-offs**:
- Scope isolation required (useGSAP with container ref)
- Attribute marking for animated elements (data-gsap-animate)
- Lifecycle separation (Flowbite renders first, GSAP triggers after mount)

**Recommendation**: Run `/sp.adr "Flowbite-GSAP Integration Strategy"` to document detailed implementation patterns and conflict prevention strategies.

## Success Criteria (From Spec)

### Measurable Outcomes

- **SC-001**: Landing page visitors understand value proposition within 10 seconds (measured via user testing)
- **SC-002**: First task created and visible within 5 seconds (performance monitoring)
- **SC-003**: Task completion reflects visually within 100ms (Framer Motion benchmark)
- **SC-004**: Search through 1,000 tasks within 500ms (useMemo optimization)
- **SC-005**: Theme switching instant (<100ms) with zero flicker (hydration pattern)
- **SC-006**: Multiple filters/sort applied to 1,000 tasks within 1 second (React.memo optimization)
- **SC-007**: Browser notifications trigger at exact due time (Notification API integration)
- **SC-008**: Recurring task next instance generated within 1 second (server logic, frontend update)
- **SC-009**: No performance degradation with 10,000 tasks (React.memo, virtualization if needed)
- **SC-010**: All interactive elements ≥ 4.5:1 color contrast (WCAG testing)

## Risks and Mitigations

### Risk 1: Animation Bundle Size

**Risk**: Three animation libraries (Framer Motion, GSAP, Lenis) increase client bundle size

**Impact**: Slow initial load on mobile networks

**Mitigation**:
- Code splitting with React.lazy() for heavy components
- Load GSAP ScrollTrigger only on-demand
- Use next/dynamic for animation utilities
- Monitor bundle size with `next build --stats`

### Risk 2: GSAP Flowbite DOM Conflicts

**Risk**: GSAP overrides Flowbite's Tailwind utility classes causing layout issues

**Impact**: Broken layouts, visual inconsistencies

**Mitigation**:
- **ADR Required**: Document strict integration patterns (see ADR recommendation above)
- Scope isolation with useGSAP hook
- Never animate layout properties (width, height, display)
- Only animate transforms/opacity (safe properties)

### Risk 3: Theme Flicker on Load

**Risk**: Theme class applied after React hydration causes visual flash

**Impact**: Poor UX, fails requirement FR-029

**Mitigation**:
- Apply theme class in app/layout.tsx before children render
- Read theme from cookie synchronously during SSR
- Test with slow network throttling (DevTools Network tab)

### Risk 4: Large Task List Performance

**Risk**: Rendering 10,000 tasks causes re-render performance issues

**Impact**: UI freezes, poor user experience

**Mitigation**:
- React.memo() for TaskListItem component
- useMemo() for filtered/sorted results
- Virtualization (react-window) if performance benchmarks fail
- Server-side pagination for initial load

## Dependencies

### Runtime Dependencies
```json
{
  "dependencies": {
    "next": "16.0.3",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "framer-motion": "^11.0.0",
    "gsap": "^3.13.0",
    "@gsap/react": "^2.1.0",
    "lenis": "^1.0.0",
    "flowbite-react": "^0.9.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.400.0"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "playwright": "^1.48.0",
    "@playwright/test": "^1.48.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

## References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Framer Motion Documentation](https://motion.dev/)
- [GSAP Documentation](https://greensock.com/docs/)
- [Lenis Documentation](https://github.com/studio-freight/lenis)
- [Flowbite React Components](https://flowbite-react.com/)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Context7 Research](/mcp__context7__query-docs) - Used for latest Next.js 16 patterns

---

**Plan Status**: ✅ Phase 0 (Research) COMPLETED, ✅ Phase 1 (Design & Contracts) COMPLETED

**Next Action**: Run `/sp.tasks` to generate actionable implementation tasks.
