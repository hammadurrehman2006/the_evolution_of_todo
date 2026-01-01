# Quickstart: Todo UI Pages

**Feature**: Todo UI Pages
**Date**: 2026-01-01
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Next.js 16+ project initialized in `phase-2/frontend/`
- Basic knowledge of React and TypeScript

## Installation

### 1. Navigate to Frontend Directory

```bash
cd phase-2/frontend
```

### 2. Initialize Shadcn UI

```bash
npx shadcn-ui@latest init
```

This command will prompt you for configuration. Recommended answers:
- Which style would you like to use? › **Default**
- Which color would you like to use as base color? › **Slate**
- Do you want to use CSS variables for colors? › **Yes**

### 3. Install Required Shadcn Components

```bash
npx shadcn-ui@latest add button card input dialog badge separator
```

This installs the UI components we'll use:
- `button`: CTA buttons, navigation links, theme toggle
- `card`: Todo items, dashboard containers
- `input`: Task input fields
- `dialog`: Task form modal
- `badge`: Task status indicators, priority tags
- `separator`: Visual dividers

### 4. Install next-themes

```bash
npm install next-themes
```

This package handles theme management with localStorage persistence.

### 5. Verify Project Structure

Ensure the following directories exist:

```bash
mkdir -p components/layout components/todo hooks lib
```

Your structure should look like:
```
phase-2/frontend/
├── components/
│   ├── layout/
│   ├── todo/
│   └── ui/              # Created by shadcn-ui
├── hooks/
└── lib/
```

## Implementation Steps

### Step 1: Configure Theme (Root Layout)

Update `app/layout.tsx` to wrap your application in the ThemeProvider:

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple and elegant todo application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Key Points**:
- `suppressHydrationWarning` prevents theme mismatch errors during SSR
- `attribute="class"` uses CSS class-based theming
- `defaultTheme="system"` respects OS preference (FR-010)
- `disableTransitionOnChange` ensures instant theme switching

### Step 2: Create Type Definitions

Create `lib/types.ts`:

```typescript
export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: Date
  updatedAt?: Date
}

export type Theme = 'light' | 'dark' | 'system'

export interface ThemePreference {
  theme: Theme
}
```

### Step 3: Create Utility Functions

Create `lib/utils.ts` (if not already created by shadcn-ui):

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Step 4: Create use-mock-todos Hook

Create `hooks/use-mock-todos.ts`:

```typescript
"use client"

import { useState, useCallback } from 'react'
import type { Todo } from '@/lib/types'

export function useMockTodos() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: crypto.randomUUID(),
      title: "Welcome to Todo App!",
      description: "This is a sample todo to get you started.",
      completed: false,
      createdAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      title: "Try adding a new todo",
      description: "Click the 'Add Todo' button to create your first task.",
      completed: false,
      createdAt: new Date(),
    },
  ])

  const addTask = useCallback((title: string, description?: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description?.trim(),
      completed: false,
      createdAt: new Date(),
    }
    setTodos((prev) => [newTodo, ...prev])
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }, [])

  const toggleTask = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      )
    )
  }, [])

  return {
    todos,
    addTask,
    deleteTask,
    toggleTask,
  }
}
```

**Key Points**:
- `"use client"` directive for client-side state management
- Sample todos provide immediate visual feedback
- All functions use `useCallback` for performance
- IDs generated with `crypto.randomUUID()` for uniqueness

### Step 5: Create Navigation Bar

Create `components/layout/Navbar.tsx`:

```typescript
"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { theme, setTheme } = useTheme()

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/todos">
            <Button variant="ghost">Todos</Button>
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <span className="sr-only">Toggle theme</span>
          {/* Icon will be shown here */}
          {theme === "dark" ? "☀️" : "🌙"}
        </Button>
      </div>
    </nav>
  )
}
```

**Key Points**:
- `"use client"` directive for hooks and event handlers
- Links use Next.js `Link` for client-side navigation
- Theme toggle accessible via ARIA label
- Mobile-responsive with flexbox

### Step 6: Create Home Page

Update `app/page.tsx`:

```typescript
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-3xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-4xl">
              Welcome to Todo App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-lg text-muted-foreground">
              A simple and elegant application to help you stay organized.
              Create tasks, track progress, and achieve your goals.
            </p>
            <div className="flex justify-center">
              <Link href="/todos">
                <Button size="lg" className="text-lg">
                  Get Started →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**Key Points**:
- Server component (no `"use client"` needed)
- Welcome message as per FR-001
- "Get Started" button links to `/todos` (FR-002)
- Visually consistent with Shadcn components

### Step 7: Create Todo Components

#### TaskCard Component

Create `components/todo/TaskCard.tsx`:

```typescript
"use client"

import type { Todo } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface TaskCardProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskCard({ todo, onToggle, onDelete }: TaskCardProps) {
  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <CardTitle
              className={`text-xl ${
                todo.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {todo.title}
            </CardTitle>
            {todo.description && (
              <p className="text-sm text-muted-foreground">
                {todo.description}
              </p>
            )}
          </div>
          <Badge variant={todo.completed ? "secondary" : "default"}>
            {todo.completed ? "Done" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(todo.id)}
          >
            {todo.completed ? "Mark Incomplete" : "Mark Complete"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(todo.id)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### TaskList Component

Create `components/todo/TaskList.tsx`:

```typescript
"use client"

import type { Todo } from "@/lib/types"
import { TaskCard } from "./TaskCard"

interface TaskListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskList({ todos, onToggle, onDelete }: TaskListProps) {
  if (todos.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-xl">No todos yet</p>
        <p className="mt-2">Create your first task to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TaskCard
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
```

#### TaskForm Component

Create `components/todo/TaskForm.tsx`:

```typescript
"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // Need to add this from shadcn

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, description?: string) => void
}

export function TaskForm({ isOpen, onClose, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit(title.trim(), description.trim())
      setTitle("")
      setDescription("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Todo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                maxLength={200}
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {title.length}/200 characters
              </p>
            </div>
            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                maxLength={1000}
                rows={4}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {description.length}/1000 characters
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Add Todo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Note**: You'll need to add the `textarea` component:
```bash
npx shadcn-ui@latest add textarea
```

### Step 8: Create Todo Dashboard

Create `app/todos/page.tsx`:

```typescript
"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { TaskList } from "@/components/todo/TaskList"
import { TaskForm } from "@/components/todo/TaskForm"
import { useMockTodos } from "@/hooks/use-mock-todos"
import { Button } from "@/components/ui/button"

export default function TodosPage() {
  const { todos, addTask, deleteTask, toggleTask } = useMockTodos()
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Todos</h1>
            <p className="mt-2 text-muted-foreground">
              {todos.filter((t) => !t.completed).length} active task
              {todos.filter((t) => !t.completed).length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>Add Todo</Button>
        </div>
        <TaskList
          todos={todos}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
        <TaskForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={addTask}
        />
      </div>
    </div>
  )
}
```

**Key Points**:
- `"use client"` directive for state and hooks
- Shows active task count (non-completed)
- "Add Todo" button opens TaskForm dialog
- Navbar component persists across all pages

### Step 9: Update Root Layout to Include Navbar

Update `app/layout.tsx` to include the Navbar:

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Navbar } from "@/components/layout/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple and elegant todo application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Important**: Now remove the Navbar from individual pages since it's in the root layout.

Update `app/todos/page.tsx` - remove the `<Navbar />` component:

```typescript
"use client"

import { useState } from "react"
import { TaskList } from "@/components/todo/TaskList"
import { TaskForm } from "@/components/todo/TaskForm"
import { useMockTodos } from "@/hooks/use-mock-todos"
import { Button } from "@/components/ui/button"

export default function TodosPage() {
  const { todos, addTask, deleteTask, toggleTask } = useMockTodos()
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* pt-16 adds top padding to account for Navbar height */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Todos</h1>
            <p className="mt-2 text-muted-foreground">
              {todos.filter((t) => !t.completed).length} active task
              {todos.filter((t) => !t.completed).length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>Add Todo</Button>
        </div>
        <TaskList
          todos={todos}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
        <TaskForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={addTask}
        />
      </div>
    </div>
  )
}
```

### Step 10: Configure Tailwind for Dark Mode

Update `tailwind.config.ts` to enable dark mode:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  // ... rest of your config
}

export default config
```

### Step 11: Add Theme Colors to globals.css

Update `app/globals.css` with theme colors:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Running the Application

### Start Development Server

```bash
cd phase-2/frontend
npm run dev
```

The application should start at `http://localhost:3000`

### Test the Application

#### 1. Home Page Test

Visit `http://localhost:3000`:
- [ ] See welcome message "Welcome to Todo App"
- [ ] See "Get Started" button
- [ ] Click button and navigate to `/todos`

#### 2. Todo Dashboard Test

Visit `http://localhost:3000/todos`:
- [ ] See navigation bar with Home, Todos links, and theme toggle
- [ ] See sample todos displayed
- [ ] See active task count
- [ ] Click "Add Todo" button - dialog opens
- [ ] Fill in form and submit - new todo appears
- [ ] Click "Mark Complete" - task shows as "Done"
- [ ] Click "Delete" - task is removed

#### 3. Theme Toggle Test

On any page:
- [ ] Click theme toggle button (sun/moon icon)
- [ ] Verify theme changes instantly (< 200ms)
- [ ] Refresh page - verify theme preference persists
- [ ] Check browser DevTools - see `dark` or `light` class on `html` element

#### 4. Navigation Test

- [ ] Click "Home" link - navigate to landing page
- [ ] Click "Todos" link - navigate to dashboard
- [ ] Verify navigation happens without page reload

#### 5. Responsive Design Test

- [ ] Resize browser to mobile width (< 768px)
- [ ] Verify navigation bar remains accessible
- [ ] Verify layout adapts to mobile

## Troubleshooting

### Theme Not Switching

- Ensure `suppressHydrationWarning` is on the `<html>` tag
- Check that `darkMode: ["class"]` is set in `tailwind.config.ts`
- Verify `ThemeProvider` wraps all content in `app/layout.tsx`
- Check browser console for hydration errors

### Components Not Found

- Ensure all Shadcn components are installed: `ls components/ui/`
- Re-run `npx shadcn-ui@latest add <component-name>`
- Check import paths in your components

### Styling Issues

- Verify `globals.css` is imported in `app/layout.tsx`
- Check Tailwind CSS is properly configured
- Ensure theme colors are defined with HSL format

## Next Steps

After completing this UI foundation:

1. **Testing**: Add unit tests with React Testing Library and E2E tests with Playwright
2. **Backend Integration**: Connect to FastAPI backend with REST API
3. **Authentication**: Add JWT-based authentication via Better Auth
4. **Advanced Features**: Implement search, filter, sort, and categorization
5. **Deployment**: Deploy to production with containerization (Docker/Kubernetes)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com)
- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
