# Research: Professional Productivity Suite Frontend

**Date**: 2025-12-31
**Feature**: 002-productivity-suite
**Phase**: 0 - Outline & Research

## Technology Decisions

### Animation Library Strategy

**Decision**: Three-tiered animation stack: Framer Motion + GSAP + Lenis

**Rationale**:
- **Framer Motion**: Best for micro-interactions (checkmarks, buttons, hover states) due to React-native declarative API and automatic accessibility
- **GSAP**: Best for timeline-based entry effects (hero sections, dashboard sections) due to powerful sequencing and timeline control
- **Lenis**: Best for smooth inertial scrolling due to native momentum physics and GSAP ScrollTrigger compatibility

**Alternatives Considered**:
1. **Framer Motion only**: Rejected because timeline sequencing is less powerful than GSAP's Timeline API for complex multi-element orchestration
2. **GSAP only**: Rejected because declarative React integration requires more boilerplate for micro-interactions (checkmarks, hover states)
3. **React Spring**: Rejected because less mature ecosystem and steeper learning curve than Framer Motion

### UI Component Strategy

**Decision**: Use Flowbite MCP for component blocks (Navbar, Modal, Sidebar) with custom Lyons Blue theme

**Rationale**:
- Accelerated development with pre-built accessible components
- Consistent design patterns across application
- Built-in WCAG compliance
- Tailwind CSS integration (aligned with Next.js 16 best practices)

**Alternatives Considered**:
1. **Radix UI + Headless UI**: Rejected due to higher implementation complexity for MVP timeline
2. **Shadcn/ui**: Rejected due to similar complexity but less MCP integration support
3. **Custom CSS components**: Rejected due to re-inventing accessible patterns and higher maintenance burden

### State Management Strategy

**Decision**: Server-first architecture with granular Client Components only where interactivity needed

**Rationale**:
- Leverages Next.js 16 Server Components for efficient data fetching
- Minimizes client-side JavaScript bundle size
- Reduces re-renders by keeping state at component level
- Simplifies data synchronization (server is source of truth)

**Alternatives Considered**:
1. **Global Zustand store**: Rejected for task data because it creates synchronization complexity when using Server Actions
2. **React Context for all state**: Rejected due to performance overhead (entire subtree re-renders on context changes)
3. **Redux Toolkit**: Rejected due to boilerplate overhead for productivity suite scope

## Next.js 16 App Router Patterns

### Server vs Client Components

**Pattern**: Default to Server Components, mark 'use client' only when:
- Event handlers needed (onClick, onChange)
- State management required (useState)
- Browser APIs accessed (localStorage, Notifications)
- Animation libraries used (Framer Motion, GSAP)

**Implementation**:
```typescript
'use client' // Required for interactivity
import { useState } from 'react'

export default function InteractiveTaskCard() {
  const [isComplete, setIsComplete] = useState(false)
  // Component logic
}
```

### Data Fetching Pattern

**Pattern**: Server Components fetch data, pass as props to Client Components

**Implementation**:
```typescript
// Server Component
import TaskList from '@/components/TaskList'
import { getTasks } from '@/lib/tasks'

export default async function DashboardPage() {
  const tasks = await getTasks()
  return <TaskList initialTasks={tasks} />
}
```

### Theme Persistence Pattern

**Pattern**: Client Component provider for React Context, imported into Server Component layout

**Implementation**:
```typescript
'use client'
import { ThemeProvider } from '@/context/ThemeContext'

export default function RootLayout({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
```

## GSAP React Integration Patterns

### useGSAP Hook

**Pattern**: Replace useEffect with useGSAP for automatic cleanup

**Key Findings**:
- `useGSAP({ scope: container })` limits animations to component container
- `contextSafe()` wraps event handlers to prevent memory leaks
- Automatic cleanup when component unmounts
- Scoped selector text prevents cross-component interference

**Implementation**:
```typescript
'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

function AnimatedHero() {
  const container = useRef()
  const { contextSafe } = useGSAP({ scope: container })

  const handleInteraction = contextSafe(() => {
    gsap.to('.element', { scale: 1.2 })
  })

  useGSAP(() => {
    gsap.from('.hero-element', { opacity: 0, y: 50 })
  }, { scope: container })

  return <div ref={container}>...</div>
}
```

## Framer Motion Patterns

### Variants for State Transitions

**Pattern**: Define reusable animation states for component-level interactions

**Key Findings**:
- `variants` object defines states (initial, active, hover)
- `animate` prop drives state transitions based on React state
- `AnimatePresence` enables exit animations for removed elements

**Implementation**:
```typescript
'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function TaskCheckmark() {
  const [completed, setCompleted] = useState(false)

  return (
    <AnimatePresence>
      <motion.div
        animate={{ pathLength: completed ? 1 : 0 }}
        onClick={() => setCompleted(!completed)}
      >
        <path d="M5 13l4 4L19 7" />
      </motion.div>
    </AnimatePresence>
  )
}
```

## Flowbite Integration Strategy

### Theme Customization

**Pattern**: Use Flowbite MCP to generate base theme, customize CSS variables

**Key Findings**:
- Lyons Blue (#005871) brand color generates palette of 50-950 shades
- Soft rounded corners (8px) for modern industrial aesthetic
- WCAG 2.2 Level AA compliance via color contrast ratios
- Dark mode via `.dark` class toggle

**Implementation**:
```css
@theme {
  @theme {
    --color-brand: #005871;
    --color-brand-soft: #e8f0f3;
    --color-brand-medium: #00b3e6;
    --radius: 8px;
    --font-sans: 'Inter', system-ui, sans-serif;
  }
}
```

### Component Block Selection

**Pattern**: Use Flowbite MCP for Navbar, Modal, Sidebar blocks

**Key Findings**:
- Pre-built accessible components with ARIA labels
- Tailwind utility class integration
- Responsive design patterns included
- Dark mode support via className prop

**Components to Use**:
1. **Navbar**: Navigation with theme toggle and links
2. **Modal**: Task creation/edit forms
3. **Sidebar**: Dashboard navigation and filters

## Animation Orchestration Architecture

### Layered Animation Strategy

**Layer 1: Page-Level Entry (GSAP Timelines)**
- Hero section staggered animations (title, subtitle, CTA)
- Dashboard section entry (sidebar, task list, header)
- Trigger on component mount via useGSAP
- Scope to container to prevent cross-component interference

**Layer 2: Component-Level Micro-Interactions (Framer Motion)**
- Task completion checkmarks: SVG path animations
- Button hover/click: spring-based transitions
- Modal open/close: layout animations with AnimatePresence
- Priority badges: scale/color transitions on filter changes
- Task list items: add/remove animations

**Layer 3: Scroll Interactions (Lenis + GSAP)**
- Lenis: Smooth inertial scrolling (momentum physics)
- GSAP ScrollTrigger: Parallax reveals and scroll-based animations
- Integration: Lenis handles scroll physics, GSAP listens to events

### Conflict Prevention: Flowbite vs GSAP

**Key Conflict Points Identified**:
1. GSAP manipulating layout properties (width, height, display) that Flowbite manages via utility classes
2. GSAP override of Tailwind inline styles
3. DOM manipulation timing (GSAP before React hydration)

**Mitigation Strategy**:
- **Scope Isolation**: useGSAP({ scope: container })
- **Attribute Marking**: Add `data-gsap-animate` to elements GSAP targets
- **Style Isolation**: GSAP animates transforms/opacity only (safe properties)
- **Lifecycle Separation**: GSAP triggers after Flowbite renders (useGSAP after mount)
- **Event Handler Wrapping**: contextSafe() for all GSAP-triggering handlers

## Granular State Management Strategy

### Component Granularity

**Principles**:
1. **Coarse-Grained Global State** (ThemeContext, UserContext): Theme preference, user session, notification permissions
2. **Fine-Grained Local State** (useState): Form inputs, modal open/close, individual task hover
3. **Derived State** (useMemo): Filtered task lists, sorted results, completion metrics
4. **Component Isolation**: Small focused components to minimize re-render scope

### Optimization Techniques

**React.memo()**: Wrap expensive child components (TaskListItem)
**useCallback()**: Stable function references passed as props
**useMemo()**: Expensive computations (filter/sort 1000+ tasks)
**Server Actions**: Use useActionState for form handling with error states

### Data Flow Pattern

**Pattern**: Server fetches data → Client component receives as props → Local state for transient interactions → Re-fetch from server on mutations

**Benefits**:
- Single source of truth (server database)
- No client-side synchronization bugs
- Optimistic UI updates via useState
- Automatic cache invalidation via Next.js 16 revalidation

## Performance Goals

From FR-034-FR-039:
- **List rendering**: Under 1 second for 1000 tasks
- **Large lists**: No significant degradation with 10,000 items
- **Theme switching**: Instant (< 100ms) with zero flicker
- **Search response**: Under 500ms for 1000 tasks
- **Completion feedback**: Immediate visual update (< 100ms)

## Accessibility Requirements

From FR-031-FR-033:
- **WCAG 2.2 Level AA**: Minimum 4.5:1 color contrast
- **Keyboard navigation**: All interactive elements accessible via Tab/Enter
- **ARIA labels**: Proper roles and labels for all interactive elements
- **Focus management**: Visible focus indicators for keyboard users

## Open Questions

None. All technical decisions resolved through research.

## Next Steps

Proceed to Phase 1: Design & Contracts
1. Generate data-model.md from feature spec entities
2. Generate UI component contracts in contracts/ directory
3. Create quickstart.md for setup instructions
4. Generate ADR on Flowbite-GSAP Integration Strategy
