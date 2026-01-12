"use client"

import { useState, useMemo, useEffect } from "react"
import { TaskList } from "@/components/todo/TaskList"
import { TaskForm } from "@/components/todo/TaskForm"
import { FilterBar } from "@/components/todo/FilterBar"
import { useTodos } from "@/hooks/use-todos"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { FilterOptions, SortOption, Todo } from "@/lib/types"
import { AuthSuccessCard } from "@/components/auth/AuthSuccessCard"
import { InteractiveLoader } from "@/components/ui/interactive-loader"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function TodosPage() {
  const { 
    todos, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTask, 
    loading, 
    error, 
    filters,
    sortBy,
    setFilters,
    setSortBy
  } = useTodos()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering stats after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter and sort todos
  const filteredAndSortedTodos = useMemo(() => {
    let filtered = [...todos]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchLower) ||
          todo.description?.toLowerCase().includes(searchLower) ||
          todo.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((todo) =>
        filters.status === 'completed' ? todo.completed : !todo.completed
      )
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter((todo) => todo.priority === filters.priority)
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((todo) =>
        filters.tags.some((filterTag) => todo.tags.includes(filterTag))
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        case 'title':
          return a.title.localeCompare(b.title)
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [todos, filters, sortBy])

  const activeTasks = todos.filter((t) => !t.completed).length
  const completedTasks = todos.filter((t) => t.completed).length
  const highPriorityTasks = todos.filter((t) => t.priority === 'high' && !t.completed).length

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingTodo(null)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <AuthSuccessCard />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

          {/* Error Alert (T022) */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Tasks</AlertTitle>
              <AlertDescription>
                {error.message}
                {error.status === 401 && (
                  <span className="block mt-2 text-sm">
                    Please log in to access your tasks.{' '}
                    <a href="/auth/login" className="underline font-semibold">
                      Go to login →
                    </a>
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading Spinner (T021) */}
          {loading && !error && (
            <InteractiveLoader />
          )}

          {/* Main Content */}
          {!loading && (
            <>
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">My Tasks</h1>
                    {mounted && (
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                          <span className="font-semibold text-foreground">{activeTasks}</span> active
                        </span>
                        <span>•</span>
                        <span>
                          <span className="font-semibold text-foreground">{completedTasks}</span> completed
                        </span>
                        <span>•</span>
                        <span>
                          <span className="font-semibold text-foreground">{todos.length}</span> total
                        </span>
                        {highPriorityTasks > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-red-500 font-semibold">
                              {highPriorityTasks} high priority
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <Button onClick={() => setIsFormOpen(true)} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Task</span>
                  </Button>
                </div>
                <Separator />
              </div>

              {mounted && (
                <>
                  <FilterBar
                    filters={filters}
                    sortBy={sortBy}
                    onFilterChange={setFilters}
                    onSortChange={setSortBy}
                  />

                  <TaskList
                    todos={filteredAndSortedTodos}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onEdit={handleEdit}
                  />
                </>
              )}

              <TaskForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={addTask}
                editingTodo={editingTodo}
                onUpdate={updateTask}
              />
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}