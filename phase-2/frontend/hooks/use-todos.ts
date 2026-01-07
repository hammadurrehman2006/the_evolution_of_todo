"use client"

import { useState, useEffect, useCallback } from 'react'
import type { Todo, Priority, TodoInput } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { ApiError } from '@/lib/types'
import {
  initNotifications,
  requestNotificationPermission,
  showTaskDueNotification,
  isNotificationReady
} from '@/lib/notifications'

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

/**
 * useTodos Hook - Hybrid Cloud Integration
 *
 * Replaces useMockTodos with remote API integration.
 * All data persistence happens in the remote Neon PostgreSQL database
 * via the production API.
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<ApiError | null>(null)

  // Initialize notifications
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const initialized = await initNotifications()
        if (initialized && Notification.permission === 'default') {
          await requestNotificationPermission()
        }
      } catch (error) {
        console.warn('[TodoApp] Failed to setup notifications:', error)
      }
    }
    setupNotifications()
  }, [])

  // Check for due date notifications
  useEffect(() => {
    const notifiedTasksRef: Set<string> = new Set()

    const checkNotifications = async () => {
      if (typeof window === 'undefined') return
      if (!isNotificationReady()) return

      const now = new Date()

      for (const todo of todos) {
        if (todo.dueDate && !todo.completed) {
          const timeUntilDue = new Date(todo.dueDate).getTime() - now.getTime()
          const fiveMinutesMs = 5 * 60 * 1000
          const oneMinuteMs = 1 * 60 * 1000

          const fiveMinKey = `${todo.id}-5min`
          const oneMinKey = `${todo.id}-1min`

          // 5-minute warning
          if (timeUntilDue > oneMinuteMs && timeUntilDue <= fiveMinutesMs && !notifiedTasksRef.has(fiveMinKey)) {
            const minutesLeft = Math.ceil(timeUntilDue / 60000)
            const success = await showTaskDueNotification(todo.title, minutesLeft)
            notifiedTasksRef.add(fiveMinKey)
          }

          // 1-minute warning
          if (timeUntilDue > 0 && timeUntilDue <= oneMinuteMs && !notifiedTasksRef.has(oneMinKey)) {
            const success = await showTaskDueNotification(todo.title, 1)
            notifiedTasksRef.add(oneMinKey)
          }

          // Clear flags if not relevant
          if (timeUntilDue > fiveMinutesMs || timeUntilDue <= 0) {
            notifiedTasksRef.delete(fiveMinKey)
            notifiedTasksRef.delete(oneMinKey)
          }
        }
      }
    }

    const interval = setInterval(checkNotifications, 15000)
    checkNotifications() // Check immediately

    return () => clearInterval(interval)
  }, [todos])

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

  // --- Actions ---

  const fetchTodos = useCallback(async (filters?: any) => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getTodos(filters)
      // data is now items array due to api-client fix
      setTodos(data.map((item: any) => mapBackendTaskToTodo(item)))
    } catch (err) {
      console.error('Failed to fetch todos:', err)
      setError(err instanceof ApiError ? err : new ApiError('Failed to load todos', 500))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const addTask = useCallback(async (
    title: string,
    description?: string,
    priority: Priority = 'medium',
    tags: string[] = [],
    dueDate?: Date,
    recurring?: { enabled: boolean; frequency: 'daily' | 'weekly' | 'monthly'; interval: number }
  ) => {
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
      setError(null)
      
      // Optimistic update: Add to UI immediately
      setTodos((prev) => [tempTodo, ...prev])

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
      setTodos((prev) => prev.map(t => t.id === tempId ? newTodo : t))
      return newTodo
    } catch (err) {
      console.error('Failed to add todo:', err)
      
      // Rollback: Remove the optimistic task
      setTodos((prev) => prev.filter(t => t.id !== tempId))
      
      const apiError = err instanceof ApiError ? err : new ApiError('Failed to add todo', 500)
      setError(apiError)
      throw apiError
    }
  }, [])

  const updateTask = useCallback(async (
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
  ) => {
    try {
      setError(null)

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

      setTodos((prev) => prev.map((t) => (t.id === id ? mappedTodo : t)))
      return mappedTodo
    } catch (err) {
      console.error('Failed to update todo:', err)
      const apiError = err instanceof ApiError ? err : new ApiError('Failed to update todo', 500)
      setError(apiError)
      throw apiError
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    // Store previous state for rollback
    let previousTodos: Todo[] = []
    
    try {
      setError(null)
      
      // Optimistic update: Remove from UI immediately
      setTodos((prev) => {
        previousTodos = prev
        return prev.filter((t) => t.id !== id)
      })
      
      await apiClient.deleteTodo(id)
    } catch (err) {
      console.error('Failed to delete todo:', err)
      
      // Rollback: Restore previous state
      setTodos(previousTodos)
      
      const apiError = err instanceof ApiError ? err : new ApiError('Failed to delete todo', 500)
      setError(apiError)
      throw apiError
    }
  }, [])

  const toggleTask = useCallback(async (id: string) => {
    try {
      setError(null)
      const result: any = await apiClient.toggleTodo(id)
      // Result is ToggleResponse { task: ..., new_task: ... }
      
      const toggledTask = mapBackendTaskToTodo(result.task)
      
      setTodos((prev) => {
        let next = prev.map((t) => (t.id === id ? toggledTask : t))
        
        // If a new task was created (recurrence), add it
        if (result.new_task) {
          const newTask = mapBackendTaskToTodo(result.new_task)
          next = [newTask, ...next]
        }
        return next
      })

      return toggledTask
    } catch (err) {
      console.error('Failed to toggle todo:', err)
      const apiError = err instanceof ApiError ? err : new ApiError('Failed to toggle todo', 500)
      setError(apiError)
      throw apiError
    }
  }, [])

  const getTask = useCallback(async (id: string) => {
    try {
      const task = await apiClient.getTodo(id)
      return mapBackendTaskToTodo(task as any)
    } catch (err) {
      console.error('Failed to get task:', err)
      throw err
    }
  }, [])

  return {
    todos,
    loading,
    error,
    fetchTodos,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getTask
  }
}