import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Todo, Priority, FilterOptions, SortOption, ApiError } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { ApiError as ApiErrorClass } from '@/lib/types'

// Backend Data Types (Snake Case)
interface BackendTask {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'High' | 'Medium' | 'Low'
  tags: string[]
  due_date?: string
  reminder_at?: string
  is_recurring: boolean
  recurrence_rule?: string
  created_at: string
  updated_at: string
}

interface TodoState {
  todos: Todo[]
  loading: boolean
  error: ApiError | null
  filters: FilterOptions
  sortBy: SortOption
  
  // Actions
  setFilters: (filters: FilterOptions) => void
  setSortBy: (sortBy: SortOption) => void
  fetchTodos: (filters?: any) => Promise<void>
  addTask: (
    title: string,
    description?: string,
    priority?: Priority,
    tags?: string[],
    dueDate?: Date,
    recurring?: { enabled: boolean; frequency: 'daily' | 'weekly' | 'monthly'; interval: number }
  ) => Promise<Todo>
  updateTask: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => Promise<Todo>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<Todo>
  getTask: (id: string) => Promise<Todo>
}

// --- Mappers ---

const mapBackendTaskToTodo = (task: BackendTask): Todo => {
  // Parse RRULE (Simple)
  let recurring = undefined
  if (task.is_recurring && task.recurrence_rule) {
    const parts = task.recurrence_rule.split(';')
    const freqPart = parts.find(p => p.startsWith('FREQ='))?.split('=')[1]
    const intervalPart = parts.find(p => p.startsWith('INTERVAL='))?.split('=')[1]
    
    if (freqPart) {
      recurring = {
        enabled: true,
        frequency: freqPart.toLowerCase() as 'daily' | 'weekly' | 'monthly',
        interval: intervalPart ? parseInt(intervalPart) : 1
      }
    }
  }

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    priority: task.priority.toLowerCase() as Priority,
    tags: task.tags || [],
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    recurring,
    createdAt: new Date(task.created_at),
    updatedAt: task.updated_at ? new Date(task.updated_at) : undefined
  }
}

const mapTodoInputToBackend = (input: any): any => {
  let recurrence_rule = undefined
  if (input.recurring?.enabled) {
    recurrence_rule = `FREQ=${input.recurring.frequency.toUpperCase()};INTERVAL=${input.recurring.interval || 1}`
  }

  return {
    title: input.title,
    description: input.description,
    priority: input.priority.charAt(0).toUpperCase() + input.priority.slice(1), // Title Case
    tags: input.tags,
    due_date: input.dueDate,
    is_recurring: input.recurring?.enabled || false,
    recurrence_rule
  }
}

// Custom storage object to handle Date hydration
const storageWithDateHydration = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name)
    if (!str) return null
    return JSON.parse(str, (key, value) => {
      // Basic heuristic to detect ISO date strings and convert them back to Date objects
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value)
      }
      return value
    })
  },
  setItem: (name: string, value: any) => {
    localStorage.setItem(name, JSON.stringify(value))
  },
  removeItem: (name: string) => localStorage.removeItem(name),
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      loading: false,
      error: null,
      filters: {
        search: '',
        status: 'all',
        priority: 'all',
        tags: [],
      },
      sortBy: 'createdAt',

      setFilters: (filters) => set({ filters }),
      setSortBy: (sortBy) => set({ sortBy }),

      fetchTodos: async (filters) => {
        try {
          // If we already have todos, we don't need to show loading state effectively
          // But we want to indicate background update? Maybe distinct state?
          // For "no time consumed", we keep loading false if we have data?
          const currentTodos = get().todos
          if (currentTodos.length === 0) {
             set({ loading: true, error: null })
          } else {
             set({ error: null }) // Clear error but keep old data while fetching
          }
          
          const data = await apiClient.getTodos(filters)
          // data is items array due to api-client fix
          const mappedTodos = data.map((item: any) => mapBackendTaskToTodo(item))
          set({ todos: mappedTodos, loading: false })
        } catch (err) {
          console.error('Failed to fetch todos:', err)
          set({ 
            error: err instanceof ApiErrorClass ? err : new ApiErrorClass('Failed to load todos', 500), 
            loading: false 
          })
        }
      },

      addTask: async (title, description, priority = 'medium', tags = [], dueDate, recurring) => {
        const tempId = `temp-${Date.now()}`
        const tempTodo: Todo = {
          id: tempId,
          title: title.trim(),
          description: description?.trim(),
          completed: false,
          priority,
          tags,
          dueDate,
          recurring,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        try {
          set((state) => ({ error: null, todos: [tempTodo, ...state.todos] }))

          const input = {
            title: title.trim(),
            description: description?.trim(),
            priority,
            tags,
            dueDate: dueDate?.toISOString(),
            recurring
          }

          const backendPayload = mapTodoInputToBackend(input)
          const createdTask = await apiClient.createTodo(backendPayload as any)
          const newTodo = mapBackendTaskToTodo(createdTask as any)

          // Replace temp task with real task
          set((state) => ({
            todos: state.todos.map(t => t.id === tempId ? newTodo : t)
          }))
          return newTodo
        } catch (err) {
          console.error('Failed to add todo:', err)
          
          // Rollback
          set((state) => ({
            todos: state.todos.filter(t => t.id !== tempId),
            error: err instanceof ApiErrorClass ? err : new ApiErrorClass('Failed to add todo', 500)
          }))
          throw err
        }
      },

      updateTask: async (id, updates) => {
        try {
          set({ error: null })

          // Map updates to backend format
          const backendUpdates: any = {}
          if (updates.title !== undefined) backendUpdates.title = updates.title
          if (updates.description !== undefined) backendUpdates.description = updates.description
          if (updates.priority !== undefined) backendUpdates.priority = updates.priority.charAt(0).toUpperCase() + updates.priority.slice(1)
          if (updates.tags !== undefined) backendUpdates.tags = updates.tags
          if (updates.dueDate !== undefined) backendUpdates.due_date = updates.dueDate ? updates.dueDate.toISOString() : null
          
          if (updates.recurring !== undefined) {
            backendUpdates.is_recurring = updates.recurring.enabled
            if (updates.recurring.enabled) {
              backendUpdates.recurrence_rule = `FREQ=${updates.recurring.frequency.toUpperCase()};INTERVAL=${updates.recurring.interval || 1}`
            } else {
              backendUpdates.recurrence_rule = null
            }
          }

          const updatedTask = await apiClient.updateTodo(id, backendUpdates)
          const mappedTodo = mapBackendTaskToTodo(updatedTask as any)

          set((state) => ({
            todos: state.todos.map((t) => (t.id === id ? mappedTodo : t))
          }))
          return mappedTodo
        } catch (err) {
          console.error('Failed to update todo:', err)
          set({ error: err instanceof ApiErrorClass ? err : new ApiErrorClass('Failed to update todo', 500) })
          throw err
        }
      },

      deleteTask: async (id) => {
        const previousTodos = get().todos
        
        try {
          set((state) => ({ 
            error: null, 
            todos: state.todos.filter((t) => t.id !== id) 
          }))
          
          await apiClient.deleteTodo(id)
        } catch (err) {
          console.error('Failed to delete todo:', err)
          
          // Rollback
          set({ 
            todos: previousTodos,
            error: err instanceof ApiErrorClass ? err : new ApiErrorClass('Failed to delete todo', 500)
          })
          throw err
        }
      },

      toggleTask: async (id) => {
        try {
          set({ error: null })
          const result: any = await apiClient.toggleTodo(id)
          
          const toggledTask = mapBackendTaskToTodo(result.task)
          
          set((state) => {
            let next = state.todos.map((t) => (t.id === id ? toggledTask : t))
            
            // If a new task was created (recurrence), add it
            if (result.new_task) {
              const newTask = mapBackendTaskToTodo(result.new_task)
              next = [newTask, ...next]
            }
            return { todos: next }
          })

          return toggledTask
        } catch (err) {
          console.error('Failed to toggle todo:', err)
          set({ error: err instanceof ApiErrorClass ? err : new ApiErrorClass('Failed to toggle todo', 500) })
          throw err
        }
      },

      getTask: async (id) => {
        try {
            // First check local state
            const localTask = get().todos.find(t => t.id === id)
            if (localTask) return localTask

            const task = await apiClient.getTodo(id)
            return mapBackendTaskToTodo(task as any)
        } catch (err) {
            console.error('Failed to get task:', err)
            throw err
        }
      }
    }),
    {
      name: 'todo-storage',
      storage: storageWithDateHydration,
      skipHydration: false, // Ensure it hydrates on init
    }
  )
)