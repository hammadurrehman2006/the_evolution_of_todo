"use client"

import { useState, useCallback, useEffect } from 'react'
import type { Todo, Priority } from '@/lib/types'

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

  // Request notification permission on mount (with mobile-safe checks)
  useEffect(() => {
    // Comprehensive feature detection for mobile compatibility
    const isNotificationSupported =
      typeof window !== 'undefined' &&
      'Notification' in window &&
      typeof Notification === 'function' &&
      Notification.requestPermission !== undefined

    if (isNotificationSupported) {
      try {
        // Check if permission is already granted or denied
        if (Notification.permission === 'default') {
          // Request permission asynchronously with error handling
          Notification.requestPermission()
            .then((permission) => {
              console.log('Notification permission:', permission)
            })
            .catch((error) => {
              console.warn('Failed to request notification permission:', error)
            })
        } else {
          console.log('Notification permission already set to:', Notification.permission)
        }
      } catch (error) {
        console.warn('Notification API not fully supported on this device:', error)
      }
    } else {
      console.log('Notifications are not supported on this device/browser')
    }
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

    // Check for due date notifications (doesn't modify state) - MOBILE-SAFE VERSION
    const checkNotifications = () => {
      if (typeof window === 'undefined') return

      // Enhanced feature detection for mobile compatibility
      const isNotificationSupported =
        'Notification' in window &&
        typeof Notification === 'function' &&
        Notification.permission === 'granted'

      if (!isNotificationSupported) {
        // Silently skip notifications if not supported
        return
      }

      const now = new Date()
      todos.forEach((todo) => {
        if (todo.dueDate && !todo.completed) {
          const timeUntilDue = new Date(todo.dueDate).getTime() - now.getTime()
          const fiveMinutesMs = 5 * 60 * 1000 // 5 minutes in milliseconds
          const oneMinuteMs = 1 * 60 * 1000 // 1 minute in milliseconds

          // Create unique notification keys for 5-min and 1-min warnings
          const fiveMinKey = `${todo.id}-5min`
          const oneMinKey = `${todo.id}-1min`

          // Notify 5 minutes before due time (with error handling)
          if (timeUntilDue > 0 && timeUntilDue <= fiveMinutesMs && !notifiedTasksRef.has(fiveMinKey)) {
            try {
              const minutesLeft = Math.ceil(timeUntilDue / 60000)
              new Notification('TaskHive - Task Due Soon', {
                body: `"${todo.title}" is due in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}!`,
                icon: '/favicon.ico',
                tag: fiveMinKey, // Prevent duplicate notifications
                requireInteraction: false, // Mobile-friendly: don't require user action
              })
              notifiedTasksRef.add(fiveMinKey)
              console.log(`5-minute notification sent for task: ${todo.title}`)
            } catch (error) {
              console.warn('Failed to show 5-minute notification:', error)
              // Mark as notified even on error to avoid retry spam
              notifiedTasksRef.add(fiveMinKey)
            }
          }

          // Notify 1 minute before due time (with error handling)
          if (timeUntilDue > 0 && timeUntilDue <= oneMinuteMs && !notifiedTasksRef.has(oneMinKey)) {
            try {
              new Notification('TaskHive - Task Due Very Soon!', {
                body: `"${todo.title}" is due in less than 1 minute!`,
                icon: '/favicon.ico',
                tag: oneMinKey, // Prevent duplicate notifications
                requireInteraction: false, // Mobile-friendly: don't require user action
              })
              notifiedTasksRef.add(oneMinKey)
              console.log(`1-minute notification sent for task: ${todo.title}`)
            } catch (error) {
              console.warn('Failed to show 1-minute notification:', error)
              // Mark as notified even on error to avoid retry spam
              notifiedTasksRef.add(oneMinKey)
            }
          }

          // Clear notification flags if task is no longer due soon or is overdue
          if (timeUntilDue > fiveMinutesMs || timeUntilDue <= 0) {
            notifiedTasksRef.delete(fiveMinKey)
            notifiedTasksRef.delete(oneMinKey)
          }
        }
      })
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
