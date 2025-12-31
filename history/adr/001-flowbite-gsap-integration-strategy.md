# ADR 001: Flowbite-GSAP Integration Strategy

**Status**: Accepted
**Date**: 2025-12-31
**Context**: Professional Productivity Suite Frontend (002-productivity-suite)
**Phase**: Planning

## Context and Problem Statement

The Professional Productivity Suite frontend requires:
1. **Flowbite Components**: Pre-built accessible UI blocks (Navbar, Modal, Sidebar) with Tailwind CSS utility classes
2. **GSAP Animations**: Timeline-based entry effects for page-level animations (hero sections, dashboard elements)
3. **Framer Motion**: Micro-interactions (checkmarks, hover states, transitions)

**Problem**: Direct integration of GSAP with Flowbite components creates DOM manipulation conflicts:
- GSAP animates CSS properties directly via inline styles
- Flowbite components use Tailwind utility classes for styling
- GSAP setting layout properties (width, height, display) overrides Flowbite's layout
- GSAP running before React hydration causes mismatches
- Event handlers in Flowbite components create GSAP objects that leak on unmount

**Impact**: Without proper integration strategy, animations will break layouts, cause visual inconsistencies, and create memory leaks.

## Decision

**Approach**: Three-layered integration strategy with strict separation and scoping:

1. **Scope Isolation**: Use `useGSAP({ scope: container })` to limit GSAP to specific component areas
2. **Attribute Marking**: Add `data-gsap-animate` to elements GSAP should target
3. **Style Isolation**: GSAP animates only transforms/opacity (safe properties), never layout properties
4. **Lifecycle Separation**: GSAP triggers after Flowbite components render (useGSAP after mount)
5. **Event Handler Wrapping**: Use `contextSafe()` for all Flowbite event handlers that trigger GSAP

## Rationale

### Why This Strategy

**1. GSAP Strengths Preserved**:
- Timeline sequencing for complex multi-element animations
- ScrollTrigger integration for scroll-based effects
- Performance (60fps) with proper optimization

**2. Flowbite Strengths Preserved**:
- Pre-built accessible components with ARIA labels
- Responsive design patterns (mobile-first)
- Dark mode support via className prop
- Tailwind utility class integration

**3. Conflict Prevention**:
- `useGSAP({ scope: container })` ensures GSAP only manipulates DOM within component bounds
- Attribute marking prevents GSAP from accidentally animating Flowbite structural elements
- Transform/opacity animation preserves Flowbite's utility classes for layout properties

**4. React-Safe**:
- `contextSafe()` wraps event handlers to ensure GSAP objects are properly cleaned up
- Automatic cleanup when component unmounts (useGSAP handles this)
- Scoped selector text prevents cross-component GSAP interference

### Alternatives Considered

**Option 1: GSAP-Only (No Flowbite)**
- **Pros**: No DOM conflicts, full control
- **Cons**: Rebuild all accessible components, lose ARIA labels, lose responsive patterns
- **Rejected**: Too much work, violates "accelerated development" goal

**Option 2: Framer Motion-Only (No GSAP)**
- **Pros**: React-native, no DOM conflicts, simpler integration
- **Cons**: Less powerful timeline sequencing, losing entry animation polish
- **Rejected**: Fails spec requirement for "timeline-based entry effects"

**Option 3: Flowbite with Built-in Animations Only**
- **Pros**: No integration complexity, Flowbite handles animations
- **Cons**: Limited animation control, not enough for professional polish
- **Rejected**: Fails spec requirement for "GSAP for timeline-based entry effects"

**Option 4: Custom CSS Components Only**
- **Pros**: Full control, no dependencies
- **Cons**: Rebuild all components, lose accessibility patterns, slower development
- **Rejected**: Repeats work Flowbite already did, violates "accelerated development" goal

**Selected**: **Three-layered integration strategy** (see Decision section)

## Consequences

### Positive Consequences

1. **Professional Polish**: GSAP timeline animations provide cinematic entry effects
2. **Accelerated Development**: Flowbite components provide Navbar, Modal, Sidebar without building from scratch
3. **Accessibility Maintained**: Flowbite's ARIA labels and keyboard navigation preserved
4. **Performance**: Proper scoping prevents GSAP from animating outside component boundaries
5. **Memory Safety**: `contextSafe()` and `useGSAP()` cleanup prevent leaks
6. **Flexibility**: Can replace Flowbite components with custom implementations without breaking GSAP

### Negative Consequences

1. **Learning Curve**: Developers must understand `useGSAP` and `contextSafe()` patterns
2. **Boilerplate**: Component structure requires careful planning (container refs, scope passing)
3. **Bundle Size**: Three animation libraries (Framer Motion, GSAP, Lenis) increase client bundle
4. **Debugging Complexity**: GSAP conflicts harder to debug than pure React/Framer Motion

### Mitigations

1. **Documentation**: Pattern documented in quickstart.md with code examples
2. **Custom Hooks**: `useGSAPAnimations.ts` wrapper simplifies common patterns
3. **Developer Training**: Team onboarding covers integration patterns
4. **Bundle Optimization**: Code splitting, dynamic imports for GSAP ScrollTrigger
5. **Testing Strategy**: Unit tests verify GSAP doesn't override Flowbite layouts

## Implementation

### Pattern 1: Scope Isolation

```typescript
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { Navbar as FlowbiteNavbar } from 'flowbite-react'

gsap.registerPlugin(useGSAP)

export default function AnimatedNavbar() {
  const container = useRef<HTMLDivElement>(null)

  // GSAP scoped to this component only
  useGSAP(() => {
    gsap.from('.nav-link', {
      opacity: 0,
      y: -20,
      duration: 0.4,
      stagger: 0.05,
    })
  }, { scope: container }) // ← Critical: Limits GSAP to container

  return (
    <div ref={container}> {/* ← GSAP scope boundary */}
      <FlowbiteNavbar>
        {/* Flowbite renders here, GSAP animates after */}
        <FlowbiteNavbar.Brand href="/">Productivity Suite</FlowbiteNavbar.Brand>
        {/* Nav links will be animated by GSAP */}
      </FlowbiteNavbar>
    </div>
  )
}
```

### Pattern 2: Attribute Marking

```typescript
'use client'

import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export default function TaskList() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // GSAP only targets elements with data-gsap-animate
    gsap.from('[data-gsap-animate]', {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
    })
  }, { scope: container })

  return (
    <div ref={container}>
      {/* This will be animated by GSAP */}
      <div data-gsap-animate className="task-card">Task 1</div>

      {/* This will NOT be animated (safe Flowbite structure) */}
      <div className="sidebar-container">
        <Sidebar />
      </div>
    </div>
  )
}
```

### Pattern 3: Style Isolation

```typescript
'use client'

import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export default function AnimatedModal() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    // ✅ SAFE: Animating transforms and opacity
    gsap.from('.modal-content', {
      scale: 0.9,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
    })

    // ❌ DANGER: Never animate layout properties
    // gsap.to('.modal-overlay', { display: 'block' }) // ← DON'T DO THIS
    // gsap.to('.modal-container', { width: '100%' }) // ← DON'T DO THIS
    // gsap.to('.modal-header', { height: 'auto' }) // ← DON'T DO THIS
  }, { scope: container })

  return (
    <div ref={container}>
      {/* Flowbite Modal handles layout, GSAP only adds polish */}
      <Modal show={isOpen} onClose={handleClose}>
        <div className="modal-content">
          {/* Content here */}
        </div>
      </Modal>
    </div>
  )
}
```

### Pattern 4: Event Handler Wrapping

```typescript
'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Button } from 'flowbite-react'

gsap.registerPlugin(useGSAP)

export default function InteractiveCard() {
  const container = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { contextSafe } = useGSAP({ scope: container })

  // ❌ DANGER: Without contextSafe, this leaks GSAP objects
  const onClickBad = () => {
    gsap.to(buttonRef.current, { rotation: 360 }) // ← Leaks if component unmounts
  }

  // ✅ SAFE: Wrapped in contextSafe, automatic cleanup
  const onClickGood = contextSafe(() => {
    gsap.to(buttonRef.current, {
      rotation: '+=360',
      scale: 1.1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
    })
  })

  return (
    <div ref={container}>
      <Button ref={buttonRef} onClick={onClickGood}>
        Click Me (Safe GSAP)
      </Button>
    </div>
  )
}
```

### Pattern 5: Lifecycle Separation

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { Modal as FlowbiteModal } from 'flowbite-react'

gsap.registerPlugin(useGSAP)

export default function TaskFormModal() {
  const container = useRef<HTMLDivElement>(null)
  const [isFlowbiteReady, setIsFlowbiteReady] = useState(false)

  useGSAP(() => {
    // GSAP runs after Flowbite is fully rendered
    gsap.from('.form-element', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
    })
  }, { scope: container })

  // Ensure Flowbite renders first, then GSAP animates
  useEffect(() => {
    // Wait for Flowbite Modal to render (next tick)
    const timeout = setTimeout(() => {
      setIsFlowbiteReady(true)
    }, 0)

    return () => clearTimeout(timeout)
  }, [isOpen])

  return (
    <div ref={container}>
      {isOpen && (
        <>
          {/* Flowbite renders first */}
          <FlowbiteModal show={isOpen} onClose={onClose} size="lg">
            <div className="form-element">Field 1</div>
            <div className="form-element">Field 2</div>
            <div className="form-element">Field 3</div>
          </FlowbiteModal>

          {/* GSAP animates after isFlowbiteReady === true */}
          {isFlowbiteReady && <GSAPAnimationTrigger />}
        </>
      )}
    </div>
  )
}
```

## Testing Strategy

### Unit Tests

1. **Scope Verification**: Verify GSAP doesn't animate elements outside container
2. **Layout Preservation**: Verify Flowbite utility classes not overridden
3. **Cleanup Verification**: Verify GSAP objects cleaned up on unmount

### Component Tests

1. **Integration Tests**: Flowbite component renders correctly with GSAP animations
2. **Event Handlers**: Verify `contextSafe()` prevents leaks
3. **Lifecycle Tests**: Verify GSAP triggers after Flowbite hydration

### E2E Tests

1. **Visual Regression**: Screenshots to verify animations don't break layout
2. **Performance Tests**: Measure 60fps maintained during animations
3. **Memory Tests**: Verify no memory leaks after multiple mount/unmount cycles

## Rollout Plan

### Phase 1: Documentation
1. ✅ ADR created (this document)
2. ✅ Patterns documented in quickstart.md
3. ✅ Custom hook created (`useGSAPAnimations.ts`)

### Phase 2: Developer Training
1. Team onboarding session on integration patterns
2. Code review checklist for GSAP/Flowbite integration
3. Pair programming for first GSAP/Flowbite components

### Phase 3: Implementation
1. Implement Landing page animations (GSAP + Flowbite Navbar)
2. Implement Dashboard entry animations (GSAP + Flowbite Sidebar)
3. Verify no layout conflicts via visual testing

### Phase 4: Monitoring
1. Add performance monitoring for GSAP FPS
2. Add memory leak detection in development
3. Track user-reported animation issues

## Related Decisions

- [ADR 002: Theme Persistence Strategy](#) - Zero-flicker hydration with cookies
- [ADR 003: State Management Architecture](#) - Server-first with granular Client Components

## References

- [GSAP React Documentation](https://greensock.com/docs/v3/Plugins/React)
- [useGSAP Hook API](https://greensock.com/docs/v3/Plugins/React)
- [contextSafe() Function](https://greensock.com/docs/v3/Plugins/React)
- [Flowbite React Components](https://flowbite-react.com/)
- [Next.js 16 Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

## Status

**Status**: ✅ ACCEPTED
**Implementation**: Pending (awaiting /sp.tasks command)
**Review Date**: TBD (after initial implementation)

---

**Next Action**: Implement patterns documented in quickstart.md, starting with Landing page GSAP + Flowbite Navbar integration.
