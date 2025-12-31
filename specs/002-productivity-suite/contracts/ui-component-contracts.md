# UI Component Contracts: Professional Productivity Suite

**Date**: 2025-12-31
**Feature**: 002-productivity-suite
**Phase**: 1 - Design & Contracts

## Overview

This document defines TypeScript interfaces for all UI components in the Professional Productivity Suite frontend. Contracts ensure type safety across components and provide clear contracts between parent and child components.

## Core Component Contracts

### TaskCard

A card component displaying a single task with interactive elements.

**Props Interface**:
```typescript
interface TaskCardProps {
  // Required props
  task: Task
  onUpdate: (task: Partial<Task>) => Promise<void> | void
  onDelete: (taskId: string) => Promise<void> | void
  onToggleComplete: (taskId: string, completed: boolean) => Promise<void> | void

  // Optional props
  showDescription?: boolean // Default: true
  showTags?: boolean // Default: true
  showDueDate?: boolean // Default: true
  className?: string // Additional CSS classes
  onHover?: (task: Task) => void // Hover callback for parent tracking
}
```

**Component Behavior**:
- Displays task title, description (if showDescription=true), priority badge, tags, due date
- Checkmark icon uses Framer Motion animation on complete state change
- Hover effect shows delete button (if not hovering by default)
- Priority badge colored by PriorityLevel enum
- Overdue tasks display red due date badge

**Animation Contract**:
```typescript
interface TaskCardAnimations {
  checkmark: {
    initial: { pathLength: 0 }
    animate: { pathLength: completed ? 1 : 0 }
    transition: { duration: 0.3, ease: 'easeInOut' }
  }
  entry: {
    initial: { opacity: 0, y: 20 }
    animate: { opacity: 1, y: 0 }
    exit: { opacity: 0, x: -100 }
    transition: { duration: 0.3 }
  }
}
```

### TaskList

A list component displaying tasks with filtering and sorting.

**Props Interface**:
```typescript
interface TaskListProps {
  // Required props
  tasks: Task[] // All tasks from server
  criteria: FilterCriteria
  sort: SortCriteria

  // Optional props
  onTaskUpdate?: (task: Task) => void // For optimistic updates
  onTaskDelete?: (taskId: string) => void // For optimistic deletions
  onFilterChange?: (criteria: FilterCriteria) => void // Filter change callback
  onSortChange?: (sort: SortCriteria) => void // Sort change callback
  loading?: boolean // Show loading state, default: false
  className?: string // Additional CSS classes
}
```

**Component Behavior**:
- Filters tasks based on criteria (status, priority, tags, due date range)
- Sorts tasks based on sort configuration (field, direction)
- Uses AnimatePresence for smooth add/remove animations
- Shows metrics header (total, completed, pending, overdue)
- Empty state when no tasks match filters
- Loading skeleton when loading=true

**Derived State** (computed within component):
```typescript
interface TaskListState {
  filteredTasks: Task[]
  metrics: TaskMetrics
  hasFilters: boolean // Show clear filters button
  hasSearch: boolean // Show clear search button
}
```

### TaskFormModal

A modal component for creating and editing tasks.

**Props Interface**:
```typescript
interface TaskFormModalProps {
  // Required props
  isOpen: boolean // Modal open state
  onClose: () => void // Close callback
  onSubmit: (task: CreateTaskRequest | UpdateTaskRequest) => Promise<void>

  // Optional props
  task?: Task | null // If provided, edit mode; otherwise create mode
  availableTags?: Tag[] // Tags available for selection
  className?: string // Additional CSS classes
}
```

**Component Behavior**:
- Flowbite Modal component wrapper
- Form validation (client-side) before submission
- Title input (1-200 characters, required)
- Description textarea (up to 1000 characters, optional)
- Priority dropdown (Low, Medium, High, Critical)
- Tag selector (multi-select, creates new tags)
- Due date picker (date + time, optional)
- Recurrence configuration (if due date set)
- Submit button with loading state
- Error display with aria-live region

**Animation Contract**:
```typescript
interface ModalAnimations {
  overlay: {
    initial: { opacity: 0 }
    animate: { opacity: 1 }
    exit: { opacity: 0 }
  }
  content: {
    initial: { scale: 0.9, opacity: 0 }
    animate: { scale: 1, opacity: 1 }
    exit: { scale: 0.9, opacity: 0 }
    transition: { type: 'spring', duration: 0.3 }
  }
}
```

### Navbar

A navigation bar component with theme toggle and navigation links.

**Props Interface**:
```typescript
interface NavbarProps {
  // Required props
  onThemeToggle?: () => void // Theme change callback (optional, uses context by default)
  currentPath?: string // Current route path for active link styling

  // Optional props
  logo?: ReactNode // Custom logo component, default: Lyons Blue text
  links?: NavLink[] // Navigation links, default: dashboard routes
  userMenu?: boolean // Show user menu, default: true
  className?: string // Additional CSS classes
}
```

**Component Behavior**:
- Flowbite Navbar component wrapper
- Logo in Lyons Blue (#005871)
- Links: Landing, Dashboard (or sign-in if not authenticated)
- Theme toggle (light/dark/system) with icon
- User dropdown (avatar, sign-out)
- Mobile responsive: hamburger menu
- GSAP entry animation on mount (staggered links)

**Animation Contract** (GSAP):
```typescript
interface NavbarAnimations {
  entry: {
    targets: '.nav-link'
    from: { opacity: 0, x: -20 }
    to: { opacity: 1, x: 0 }
    stagger: 0.05
    duration: 0.4
  }
}
```

### ThemeToggle

A theme switcher component with light/dark/system options.

**Props Interface**:
```typescript
interface ThemeToggleProps {
  // Optional props
  currentTheme?: Theme // Current theme (optional, uses context by default)
  onThemeChange?: (theme: Theme) => void // Theme change callback
  showLabel?: boolean // Show "Theme" label, default: false
  variant?: 'button' | 'dropdown' | 'switch' // UI variant, default: 'button'
  className?: string // Additional CSS classes
}
```

**Component Behavior**:
- Button variant: Single button cycles light → dark → system
- Dropdown variant: Select with all three options
- Switch variant: Toggle switch between light and dark
- Zero-flicker requirement: Apply theme class before hydration
- Icon reflects current theme state (sun/moon/auto)

**Animation Contract**:
```typescript
interface ThemeToggleAnimations {
  iconTransition: {
    initial: { rotate: -90, opacity: 0 }
    animate: { rotate: 0, opacity: 1 }
    exit: { rotate: 90, opacity: 0 }
  }
}
```

### PriorityBadge

A badge component displaying task priority with color coding.

**Props Interface**:
```typescript
interface PriorityBadgeProps {
  // Required props
  priority: PriorityLevel

  // Optional props
  showLabel?: boolean // Show text label, default: true
  variant?: 'dot' | 'pill' | 'badge' // Visual variant, default: 'badge'
  size?: 'sm' | 'md' | 'lg' // Size variant, default: 'md'
  className?: string // Additional CSS classes
}
```

**Component Behavior**:
- Colors: Critical=red, High=orange, Medium=yellow, Low=green
- Dot variant: Simple colored circle
- Pill variant: Rounded rectangle with label
- Badge variant: Badge shape with label and icon
- Framer Motion scale animation on priority change

**Color Mapping**:
```typescript
const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#10b981',
}
```

### TagList

A list component displaying tags with filtering.

**Props Interface**:
```typescript
interface TagListProps {
  // Required props
  tags: Tag[]
  onTagToggle?: (tagId: string) => void // Filter by tag callback
  onTagDelete?: (tagId: string) => void // Delete tag callback

  // Optional props
  selectedTagIds?: string[] // Currently selected tag IDs for filtering
  maxVisible?: number // Max tags before "show more", default: 10
  className?: string // Additional CSS classes
}
```

**Component Behavior**:
- Display tags in horizontal scrollable list
- Selected tags highlighted with active state
- Click toggles filter (add/remove from filter)
- Hover shows delete button (if onTagDelete provided)
- "Show more" button if tags.length > maxVisible

### FilterBar

A bar component displaying filter and sort controls.

**Props Interface**:
```typescript
interface FilterBarProps {
  // Required props
  criteria: FilterCriteria
  sort: SortCriteria
  availableTags?: Tag[] // Tags available for filtering

  // Optional props
  onCriteriaChange?: (criteria: FilterCriteria) => void
  onSortChange?: (sort: SortCriteria) => void
  onSearchChange?: (searchTerm: string) => void
  searchTerm?: string // Current search term
  className?: string // Additional CSS classes
}
```

**Component Behavior**:
- Search input with debounced updates (500ms)
- Status filter dropdown (active, completed, all)
- Priority filter multi-select (checkboxes)
- Tag filter multi-select (pill buttons)
- Due date range picker (optional, advanced filters toggle)
- Sort dropdown (due date, priority, creation date)
- "Clear all filters" button when any filter active

**Derived State**:
```typescript
interface FilterBarState {
  hasActiveFilters: boolean
  activeFilterCount: number
  showAdvancedFilters: boolean // Expandable section for due date range
}
```

### DashboardMetrics

A metrics component displaying task statistics.

**Props Interface**:
```typescript
interface DashboardMetricsProps {
  // Required props
  metrics: TaskMetrics

  // Optional props
  showProgress?: boolean // Show progress bar, default: true
  compact?: boolean // Smaller layout, default: false
  className?: string // Additional CSS classes
}
```

**Component Behavior**:
- Displays total, completed, pending, overdue counts
- Progress bar (completed/total percentage)
- Completion rate percentage
- Animated count changes (Framer Motion numbers)

**Animation Contract**:
```typescript
interface MetricsAnimations {
  countChange: {
    initial: { scale: 0.8 }
    animate: { scale: 1 }
    transition: { type: 'spring', stiffness: 300 }
  }
  progress: {
    initial: { width: 0 }
    animate: { width: `${completionRate}%` }
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}
```

### LandingHero

A hero section component for landing page.

**Props Interface**:
```typescript
interface LandingHeroProps {
  // Optional props
  title?: string // Hero title, default: brand tagline
  subtitle?: string // Hero subtitle, default: value proposition
  ctaText?: string // Call-to-action text, default: "Get Started"
  ctaLink?: string // CTA link, default: "/dashboard"
  className?: string // Additional CSS classes
}
```

**Component Behavior**:
- Lyons Blue (#005871) background with gradient
- White text for contrast
- Animated title on mount (GSAP Timeline)
- Animated subtitle with delay
- Animated CTA button with hover effect
- Framer Motion scroll-triggered animations for features

**Animation Contract** (GSAP):
```typescript
interface HeroAnimations {
  title: {
    from: { opacity: 0, y: 50 }
    to: { opacity: 1, y: 0 }
    duration: 0.8
    ease: 'power3.out'
  }
  subtitle: {
    from: { opacity: 0 }
    to: { opacity: 1 }
    delay: 0.3
    duration: 0.8
  }
  cta: {
    from: { opacity: 0, scale: 0.9 }
    to: { opacity: 1, scale: 1 }
    delay: 0.6
    duration: 0.5
    ease: 'back.out(1.7)'
  }
}
```

## Context Provider Contracts

### ThemeContextProvider

A context provider for theme state management.

**Props Interface**:
```typescript
interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: Theme // Override theme from storage
}
```

**Context Value Interface**:
```typescript
interface ThemeContextValue {
  theme: Theme // Current theme (light, dark, system)
  setTheme: (theme: Theme) => void // Update theme
  systemTheme: 'light' | 'dark' | null // Detected system preference
  isDark: boolean // Computed dark mode state
}
```

**Component Behavior**:
- Reads theme from cookies on mount (session-aware)
- Detects system theme via `matchMedia('(prefers-color-scheme: dark)')`
- Persists theme changes to cookies
- Applies theme class to `<body>` element
- Zero-flicker: Apply theme before hydration using next-themes pattern

### UserContextProvider

A context provider for user session state.

**Props Interface**:
```typescript
interface UserProviderProps {
  children: ReactNode
  initialUser?: User // Override user from auth
}
```

**Context Value Interface**:
```typescript
interface UserContextValue {
  user: User | null // Current authenticated user
  isLoading: boolean // Auth loading state
  signOut: () => Promise<void> // Sign out action
  requestNotificationPermission: () => Promise<boolean> // Request browser notification permissions
}
```

**Component Behavior**:
- Reads user session from authentication cookies (JWT)
- Provides sign-out action (clears session)
- Manages browser notification permission request
- Updates notificationPermission in UserPreferences

## Helper Type Contracts

### TaskMetrics

Computed task statistics.

```typescript
interface TaskMetrics {
  total: number // Total tasks (non-deleted)
  completed: number // Completed tasks
  pending: number // Pending tasks
  overdue: number // Overdue tasks (not completed, due date in past)
  completionRate: number // Percentage (0-100)
}
```

### CreateTaskRequest

Request payload for task creation.

```typescript
interface CreateTaskRequest {
  title: string
  description?: string
  priority?: PriorityLevel
  tagIds?: string[]
  dueDate?: string | null
  recurrence?: {
    intervalType: IntervalType
    intervalValue?: number
    endCondition: EndCondition
    endValue?: string | number
  }
}
```

### UpdateTaskRequest

Request payload for task update.

```typescript
interface UpdateTaskRequest {
  id: string // Task ID to update
  updates: Partial<Pick<Task, 'id'>>
}
```

### NavLink

Navigation link configuration.

```typescript
interface NavLink {
  label: string
  href: string
  icon?: ReactNode // Optional icon component
  exact?: boolean // Exact match for active state
}
```

## Flowbite Component Wrappers

All components using Flowbite should export wrapper interfaces for type safety:

### NavbarWrapper

```typescript
interface NavbarWrapperProps {
  children: ReactNode
  fluid?: boolean // Full width, default: false
  border?: boolean // Bottom border, default: true
  className?: string
}
```

### ModalWrapper

```typescript
interface ModalWrapperProps {
  show: boolean // Modal open state
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl' // Modal size, default: 'md'
  dismissible?: boolean // Close on overlay click, default: true
  children: ReactNode
  className?: string
}
```

### SidebarWrapper

```typescript
interface SidebarWrapperProps {
  isOpen: boolean // Sidebar open state
  onToggle?: () => void // Toggle callback
  items: SidebarItem[] // Sidebar navigation items
  children?: ReactNode
  className?: string
}
```

```typescript
interface SidebarItem {
  label: string
  href: string
  icon?: ReactNode
  active?: boolean // Active state
}
```

## Animation Helper Contracts

### useGSAPAnimations

Custom hook for GSAP animations with proper cleanup.

```typescript
interface UseGSAPAnimationsReturn {
  animateEntry: (targets: string | Element[], options: GSAPAnimationOptions) => void
  animateExit: (targets: string | Element[], options: GSAPAnimationOptions) => void
  cleanup: () => void // Manual cleanup function
}

function useGSAPAnimations(scope: RefObject<HTMLElement> | null): UseGSAPAnimationsReturn
```

### useFramerVariants

Custom hook for Framer Motion variant management.

```typescript
interface UseFramerVariantsReturn {
  variants: MotionVariants
  animate: (state: string) => void // Trigger variant transition
}

interface MotionVariants {
  [key: string]: {
    [property: string]: number | string | object
    transition?: Transition
  }
}

interface Transition {
  duration?: number
  delay?: number
  ease?: string
  type?: 'tween' | 'spring' | 'just'
}
```

## Accessibility Contracts

All components must implement:

### ARIA Attributes

```typescript
interface AccessibilityProps {
  'aria-label'?: string // Screen reader label
  'aria-labelledby'?: string // Label reference
  'aria-describedby'?: string // Description reference
  'aria-live'?: 'polite' | 'assertive' // Live region for announcements
  'aria-hidden'?: boolean // Hide from screen readers
}
```

### Keyboard Navigation

```typescript
interface KeyboardProps {
  tabIndex?: number // Tab index, default: 0 (focusable)
  onKeyDown?: (event: KeyboardEvent) => void // Keyboard event handler
}
```

## Testing Contracts

### Component Test Props

For unit testing, components should export test-specific interfaces:

```typescript
interface TaskCardTestProps extends TaskCardProps {
  // Override animations for testing
  disableAnimations?: boolean
  // Override async handlers for testing
  mockUpdate?: (task: Partial<Task>) => void
  mockDelete?: (taskId: string) => void
  mockToggleComplete?: (taskId: string, completed: boolean) => void
}
```

## Next Steps

1. Generate API client contracts for task CRUD operations
2. Generate quickstart.md with setup instructions
3. Generate ADR on Flowbite-GSAP Integration Strategy
