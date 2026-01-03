"use client"

import { useState, useCallback, useEffect } from 'react'
import type { Todo, Priority } from '@/lib/types'
import {
  initNotifications,
  requestNotificationPermission,
  showTaskDueNotification,
  isNotificationReady
} from '@/lib/notifications'

const STORAGE_KEY = 'taskhive-todos'

export function useMockTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    // Load todos from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          // Convert date strings back to Date objects
          return parsed.map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined,
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          }))
        }
      } catch (error) {
        console.error('Failed to load todos from localStorage:', error)
      }
    }
    return []
  })

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
      } catch (error) {
        console.error('Failed to save todos to localStorage:', error)
      }
    }
  }, [todos])

  // Initialize notifications with Service Worker (mobile-safe)
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Initialize service worker for mobile compatibility
        const initialized = await initNotifications()

        if (initialized) {
          console.log('[TodoApp] Notification system initialized')

          // Request permission if not already set
          if (Notification.permission === 'default') {
            const permission = await requestNotificationPermission()
            console.log('[TodoApp] Notification permission:', permission)
          } else {
            console.log('[TodoApp] Notification permission already set to:', Notification.permission)
          }
        } else {
          console.log('[TodoApp] Notifications not supported on this device')
        }
      } catch (error) {
        console.warn('[TodoApp] Failed to setup notifications:', error)
      }
    }

    setupNotifications()
  }, [])

  // Check for recurring tasks and due date notifications
  useEffect(() => {
    // Track which tasks have been notified to avoid spam
    const notifiedTasksRef: Set<string> = new Set()

    const checkRecurringTasks = () => {
      setTodos((prev) => {
        const now = new Date()
        let hasChanges = false

        const updated = prev.map((todo) => {
          if (
            todo.recurring?.enabled &&
            todo.completed &&
            todo.updatedAt
          ) {
            const timeSinceUpdate = now.getTime() - todo.updatedAt.getTime()
            const intervalMs = getIntervalMs(todo.recurring.frequency, todo.recurring.interval)

            if (timeSinceUpdate >= intervalMs) {
              hasChanges = true
              // Reset the task and update due date if present
              return {
                ...todo,
                completed: false,
                dueDate: todo.dueDate ? new Date(todo.dueDate.getTime() + intervalMs) : undefined,
                updatedAt: now,
              }
            }
          }
          return todo
        })

        // Only update state if there are actual changes
        return hasChanges ? updated : prev
      })
    }

    // Check for due date notifications (Mobile-Safe with Service Worker)
    const checkNotifications = async () => {
      if (typeof window === 'undefined') return

      // Check if notification system is ready
      if (!isNotificationReady()) {
        return
      }

      const now = new Date()

      for (const todo of todos) {
        if (todo.dueDate && !todo.completed) {
          const timeUntilDue = new Date(todo.dueDate).getTime() - now.getTime()
          const fiveMinutesMs = 5 * 60 * 1000 // 5 minutes in milliseconds
          const oneMinuteMs = 1 * 60 * 1000 // 1 minute in milliseconds

          // Create unique notification keys for 5-min and 1-min warnings
          const fiveMinKey = `${todo.id}-5min`
          const oneMinKey = `${todo.id}-1min`

          // Notify 5 minutes before due time
          if (timeUntilDue > 0 && timeUntilDue <= fiveMinutesMs && !notifiedTasksRef.has(fiveMinKey)) {
            const minutesLeft = Math.ceil(timeUntilDue / 60000)
            const success = await showTaskDueNotification(todo.title, minutesLeft)

            if (success) {
              notifiedTasksRef.add(fiveMinKey)
              console.log(`[TodoApp] 5-minute notification sent for task: ${todo.title}`)
            } else {
              // Mark as notified even on failure to avoid spam
              notifiedTasksRef.add(fiveMinKey)
              console.warn(`[TodoApp] Failed to send 5-minute notification for: ${todo.title}`)
            }
          }

          // Notify 1 minute before due time
          if (timeUntilDue > 0 && timeUntilDue <= oneMinuteMs && !notifiedTasksRef.has(oneMinKey)) {
            const success = await showTaskDueNotification(todo.title, 1)

            if (success) {
              notifiedTasksRef.add(oneMinKey)
              console.log(`[TodoApp] 1-minute notification sent for task: ${todo.title}`)
            } else {
              // Mark as notified even on failure to avoid spam
              notifiedTasksRef.add(oneMinKey)
              console.warn(`[TodoApp] Failed to send 1-minute notification for: ${todo.title}`)
            }
          }

          // Clear notification flags if task is no longer due soon or is overdue
          if (timeUntilDue > fiveMinutesMs || timeUntilDue <= 0) {
            notifiedTasksRef.delete(fiveMinKey)
            notifiedTasksRef.delete(oneMinKey)
          }
        }
      }
    }

    // Check notifications immediately (but don't check recurring tasks to avoid infinite loop)
    checkNotifications()

    // Set up interval to check both periodically
    const interval = setInterval(() => {
      checkRecurringTasks()
      checkNotifications()
    }, 30000) // Check every 30 seconds for more timely notifications

    return () => clearInterval(interval)
  }, [todos])

  const addTask = useCallback((
    title: string,
    description?: string,
    priority: Priority = 'medium',
    tags: string[] = [],
    dueDate?: Date,
    recurring?: { enabled: boolean; frequency: 'daily' | 'weekly' | 'monthly'; interval: number }
  ) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description?.trim(),
      completed: false,
      priority,
      tags,
      dueDate,
      recurring,
      createdAt: new Date(),
    }
    setTodos((prev) => [newTodo, ...prev])
  }, [])

  const updateTask = useCallback((
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
  ) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      )
    )
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
    updateTask,
    deleteTask,
    toggleTask,
  }
}

function getIntervalMs(frequency: 'daily' | 'weekly' | 'monthly', interval: number): number {
  const dayMs = 24 * 60 * 60 * 1000
  switch (frequency) {
    case 'daily':
      return dayMs * interval
    case 'weekly':
      return dayMs * 7 * interval
    case 'monthly':
      return dayMs * 30 * interval // Approximate
    default:
      return dayMs
  }
}
