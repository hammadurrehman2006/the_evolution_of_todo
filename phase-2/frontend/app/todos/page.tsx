"use client"

import { useState, useMemo, useEffect } from "react"
import { TaskList } from "@/components/todo/TaskList"
import { TaskForm } from "@/components/todo/TaskForm"
import { FilterBar } from "@/components/todo/FilterBar"
import { useMockTodos } from "@/hooks/use-mock-todos"
import { Button } from "@/components/ui/button"
import { Plus, Bell } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { FilterOptions, SortOption, Todo } from "@/lib/types"

export default function TodosPage() {
  const { todos, addTask, updateTask, deleteTask, toggleTask } = useMockTodos()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    status: 'all',
    priority: 'all',
    tags: [],
  })
  const [sortBy, setSortBy] = useState<SortOption>('createdAt')
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

  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('TaskFlow - Test Notification', {
          body: 'Notifications are working! You will be notified when tasks are due within 24 hours.',
          icon: '/favicon.ico',
        })
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('TaskFlow - Test Notification', {
              body: 'Notifications are working! You will be notified when tasks are due within 24 hours.',
              icon: '/favicon.ico',
            })
          } else {
            alert('Notification permission denied. Please enable notifications in your browser settings.')
          }
        })
      } else {
        alert('Notifications are blocked. Please enable them in your browser settings.')
      }
    } else {
      alert('Your browser does not support notifications.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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
            <div className="flex gap-2">
              <Button
                onClick={testNotification}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
                title="Test browser notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Test Notifications</span>
              </Button>
              <Button onClick={() => setIsFormOpen(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </Button>
            </div>
          </div>
          <Separator />
        </div>

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

        <TaskForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={addTask}
          editingTodo={editingTodo}
          onUpdate={updateTask}
        />
      </div>
    </div>
  )
}
