# Quickstart: Professional Productivity Suite Frontend

**Date**: 2025-12-31
**Feature**: 002-productivity-suite
**Phase**: 1 - Design & Contracts

## Overview

This guide provides step-by-step instructions for setting up the Professional Productivity Suite frontend with Next.js 16, Framer Motion, GSAP, Lenis, and Flowbite components.

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- Git repository initialized (phase-2/frontend directory)
- Code editor with TypeScript support (VS Code recommended)

## Step 1: Initialize Next.js 16 Project

Navigate to `/phase-2/frontend` directory and initialize Next.js 16 project.

```bash
cd phase-2/frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-react-compiler
```

**Configuration Options**:
- `--typescript`: Enable TypeScript
- `--tailwind`: Install Tailwind CSS (Flowbite dependency)
- `--eslint`: Code linting
- `--app`: Use App Router (required for Next.js 16)
- `--src-dir`: Use `src/` directory for cleaner structure
- `--import-alias "@/*"`: Import alias matching Flowbite conventions
- `--no-react-compiler`: Disable React Compiler (prevents conflicts with GSAP/Framer Motion)

**Expected Output**:
```
phase-2/frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   └── lib/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Step 2: Install Animation Libraries

Install Framer Motion, GSAP, and Lenis packages.

```bash
npm install framer-motion gsap @gsap/react lenis
```

**Package Versions**:
- `framer-motion`: Latest stable (v11.x for React 19 compatibility)
- `gsap`: Latest v3.x
- `@gsap/react`: Latest v1.x (React integration hooks)
- `lenis`: Latest v1.x

## Step 3: Install Flowbite and Theme

Install Flowbite components and generate custom Lyons Blue theme.

```bash
npm install flowbite flowbite-react
```

**Generate Custom Theme**:

Use Flowbite MCP to generate theme or create manual `src/styles/lyons-blue-theme.css`:

```css
@theme {
  @theme {
    /* Lyons Blue Brand Colors */
    --color-brand: #005871;
    --color-brand-soft: #e8f0f3;
    --color-brand-medium: #00b3e6;
    --color-brand-strong: #004f66;

    /* Urban Steel Neutral Colors */
    --color-neutral-secondary: #7B7B7A;
    --color-neutral-tertiary: #D1D1D1;

    /* Typography */
    --font-sans: 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif';

    /* Border Radius - Soft Rounded (8px) */
    --radius: 8px;
    --radius-sm: 6px;
    --radius-lg: 12px;

    /* Spacing - Balanced for Professional Look */
    --spacing-6: 1.5rem;
    --spacing-8: 2rem;
  }
}

.dark {
  @theme {
    /* Dark Mode Overrides */
    --color-brand: #00b3e6;
    --color-brand-soft: #004f66;
    --color-neutral-primary: #0f172a;
  }
}
```

**Import Theme in globals.css**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  @import './styles/lyons-blue-theme.css';
}
```

## Step 4: Configure TypeScript Paths

Update `tsconfig.json` to include type aliases and paths for clean imports.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/context/*": ["./src/context/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

## Step 5: Create Project Structure

Generate recommended directory structure:

```bash
cd src
mkdir -p components/{tasks,layout,ui} hooks context lib utils types
```

**Final Structure**:
```
phase-2/frontend/src/
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── globals.css           # Global styles + theme
│   ├── page.tsx              # Landing page
│   └── dashboard/
│       ├── page.tsx           # Dashboard page
│       └── loading.tsx         # Loading skeleton
├── components/
│   ├── tasks/
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   └── TaskFormModal.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── ui/
│       ├── PriorityBadge.tsx
│       ├── TagList.tsx
│       ├── FilterBar.tsx
│       └── DashboardMetrics.tsx
├── context/
│   ├── ThemeContext.tsx
│   └── UserContext.tsx
├── hooks/
│   ├── useGSAPAnimations.ts
│   ├── useFramerVariants.ts
│   └── useTheme.ts
├── lib/
│   ├── tasks.ts                # Task API client
│   ├── animations.ts            # Animation utilities
│   └── utils.ts                # General utilities
├── types/
│   └── index.ts                 # Type definitions
└── styles/
    └── lyons-blue-theme.css   # Flowbite theme
```

## Step 6: Configure Theme Context

Create `src/context/ThemeContext.tsx` with session-aware persistence.

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Theme } from '@/types'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Read from cookie on mount (session-aware)
    const savedTheme = document.cookie
      .split('; ')
      .find(c => c.trim().startsWith('theme='))
      ?.split('=')[1] as Theme || 'system'

    setThemeState(savedTheme)
  }, [])

  useEffect(() => {
    // Detect system theme preference
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setIsDark(mediaQuery.matches)
      const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      setIsDark(theme === 'dark')
    }
  }, [theme])

  useEffect(() => {
    // Apply theme class to body
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    // Persist to cookie (session-aware)
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Strict`
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

**Security Note**: Theme persistence uses `SameSite=Strict` for CSRF protection. Security auditor must validate implementation.

## Step 7: Configure GSAP with React

Create `src/hooks/useGSAPAnimations.ts` with proper cleanup.

```typescript
'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function useGSAPAnimations(scope: RefObject<HTMLElement> | null) {
  const { contextSafe } = useGSAP({ scope })

  const animateEntry = contextSafe((
    targets: string | Element[],
    options: gsap.TweenVars
  ) => {
    gsap.from(targets, options)
  })

  const animateExit = contextSafe((
    targets: string | Element[],
    options: gsap.TweenVars
  ) => {
    gsap.to(targets, options)
  })

  return { animateEntry, animateExit }
}
```

**Usage in Component**:
```typescript
'use client'

import { useRef } from 'react'
import { useGSAPAnimations } from '@/hooks/useGSAPAnimations'

export default function AnimatedComponent() {
  const container = useRef<HTMLDivElement>(null)
  const { animateEntry } = useGSAPAnimations(container)

  useGSAP(() => {
    animateEntry('.hero-element', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.1
    })
  }, { scope: container })

  return <div ref={container}>
    <div className="hero-element">Element 1</div>
    <div className="hero-element">Element 2</div>
  </div>
}
```

## Step 8: Configure Lenis for Smooth Scrolling

Create `src/lib/lenis.ts` initialization.

```typescript
import Lenis from 'lenis'

export function initLenis() {
  if (typeof window === 'undefined') return

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  })

  function raf(time: number) {
    lenis.raf(time)
  }

  requestAnimationFrame(raf)

  return lenis
}
```

**Initialize in Root Layout**:

```typescript
'use client'

import { useEffect } from 'react'
import { initLenis } from '@/lib/lenis'

export default function ScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = initLenis()
    return () => lenis.destroy()
  }, [])

  return <>{children}</>
}
```

## Step 9: Configure Flowbite Components

Wrap Flowbite components with custom theme support.

**Example: Navbar with Theme Toggle**:

```typescript
'use client'

import { Navbar as FlowbiteNavbar, Button } from 'flowbite-react'
import { useTheme } from '@/context/ThemeContext'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function Navbar() {
  const { theme, setTheme, isDark } = useTheme()

  return (
    <FlowbiteNavbar
      fluid
      theme={{
        custom: true,
        styles: {
          primary: '#005871',
          dark: '#0f172a',
        }
      }}
    >
      <FlowbiteNavbar.Brand href="/">
        <span className="font-bold text-xl">Productivity Suite</span>
      </FlowbiteNavbar.Brand>

      <div className="flex md:order-2">
        <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <Moon /> : <Sun />}
        </Button>
      </div>
    </FlowbiteNavbar>
  )
}
```

## Step 10: Implement Task Card with Animations

Create `src/components/tasks/TaskCard.tsx` combining Framer Motion and GSAP.

```typescript
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGSAPAnimations } from '@/hooks/useGSAPAnimations'
import { Task } from '@/types'
import { Checkbox } from 'flowbite-react'

interface TaskCardProps {
  task: Task
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const container = useRef<HTMLDivElement>(null)
  const { animateEntry } = useGSAPAnimations(container)

  // GSAP entry animation on mount
  useGSAP(() => {
    animateEntry('.task-card-entry', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: 'power2.out'
    })
  }, { scope: container })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={container}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
        className="task-card-entry bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md"
      >
        <div className="flex items-start gap-4">
          {/* Framer Motion checkmark animation */}
          <motion.div
            animate={{ pathLength: task.completed ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Checkbox
              checked={task.completed}
              onChange={() => onToggle(task.id, !task.completed)}
            />
          </motion.div>

          <div className="flex-1">
            <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {task.description}
              </p>
            )}
          </div>

          <Button onClick={() => onDelete(task.id)} color="failure">
            Delete
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
```

## Step 11: Run Development Server

Start Next.js development server to verify setup.

```bash
npm run dev
```

**Expected Output**:
- Server starts on `http://localhost:3000`
- Hot reload enabled for development
- No TypeScript errors
- No linting errors

## Step 12: Verify Animation Stack

Test animations are working correctly.

**GSAP Entry Animation**:
- Navigate to dashboard
- Observe staggered entry of task list elements

**Framer Motion Checkmark**:
- Click task checkbox
- Observe smooth checkmark path animation

**Lenis Smooth Scroll**:
- Scroll through task list
- Observe inertial momentum

**Theme Toggle**:
- Click theme toggle button
- Verify zero-flicker transition
- Check theme persists across page reload

## Step 13: Build Production Bundle

Test production build for errors.

```bash
npm run build
```

**Expected Output**:
- Build completes without errors
- Optimized bundle size (check `next build --stats`)
- No runtime errors in console

## Step 14: Run Type Checks

Verify TypeScript compilation.

```bash
npm run type-check
# Or
npx tsc --noEmit
```

**Expected Output**:
- No TypeScript errors
- All type definitions resolved

## Common Issues and Solutions

### Issue: Theme Flicker on Load

**Cause**: Theme class applied after React hydration

**Solution**: Apply theme class in `app/layout.tsx` before children render:

```typescript
export default function RootLayout({ children }: { children: ReactNode }) {
  // Read theme from cookie synchronously
  const theme = getThemeFromCookie()

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : ''}>
      <body>
        {children}
      </body>
    </html>
  )
}
```

### Issue: GSAP Animation Not Running

**Cause**: DOM not ready when GSAP tries to animate

**Solution**: Use `useGSAP({ scope: container })` ensures DOM is ready:

```typescript
useGSAP(() => {
  gsap.from('.element', { opacity: 0 })
}, { scope: container }) // Waits for container to be in DOM
```

### Issue: Lenis Scroll Jank

**Cause**: Conflicting with GSAP ScrollTrigger or native scroll

**Solution**: Register Lenis before GSAP ScrollTrigger:

```typescript
useEffect(() => {
  const lenis = new Lenis()
  gsap.registerPlugin(ScrollTrigger)

  ScrollTrigger.scrollerProxy(lenis)
}, [])
```

### Issue: Framer Motion Exit Animation Not Showing

**Cause**: Missing `AnimatePresence` wrapper

**Solution**: Wrap component with `AnimatePresence`:

```typescript
<AnimatePresence mode="wait">
  {items.map(item => (
    <motion.div key={item.id} exit={{ opacity: 0 }}>
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

## Next Steps

1. Review `/specs/002-productivity-suite/contracts/ui-component-contracts.md` for all component interfaces
2. Review `/specs/002-productivity-suite/data-model.md` for entity definitions
3. Generate ADR on Flowbite-GSAP Integration Strategy for conflict prevention
4. Begin implementation with `/sp.tasks` command to generate actionable tasks
