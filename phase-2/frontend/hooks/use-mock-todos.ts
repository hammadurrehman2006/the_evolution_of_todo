"use client"

import { useState, useCallback, useEffect } from 'react'
import type { Todo, Priority } from '@/lib/types'

const STORAGE_KEY = 'taskflow-todos'

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

  // Request notification permission on mount (separate effect to run immediately)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          console.log('Notification permission:', permission)
        })
      } else {
        console.log('Notification permission already set to:', Notification.permission)
      }
    }
  }, [])

  // Check for recurring tasks and due date notifications
  useEffect(() => {
    // Track which tasks have been notified to avoid spam
    const notifiedTasksRef: Set<string> = new Set()

    const checkRecurringTasks = () => {
      setTodos((prev) => {
        const now = new Date()
        return prev.map((todo) => {
          if (
            todo.recurring?.enabled &&
            todo.completed &&
            todo.updatedAt
          ) {
            const timeSinceUpdate = now.getTime() - todo.updatedAt.getTime()
            const intervalMs = getIntervalMs(todo.recurring.frequency, todo.recurring.interval)

            if (timeSinceUpdate >= intervalMs) {
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
      })
    }

    // Check for due date notifications
    const checkNotifications = () => {
      const now = new Date()
      todos.forEach((todo) => {
        if (todo.dueDate && !todo.completed) {
          const timeUntilDue = new Date(todo.dueDate).getTime() - now.getTime()
          const oneDayMs = 24 * 60 * 60 * 1000

          // Notify if due within 24 hours and not already notified
          if (timeUntilDue > 0 && timeUntilDue <= oneDayMs && !notifiedTasksRef.has(todo.id)) {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('TaskFlow - Task Due Soon', {
                body: `"${todo.title}" is due soon!`,
                icon: '/favicon.ico',
              })
              notifiedTasksRef.add(todo.id)
              console.log(`Notification sent for task: ${todo.title}`)
            }
          }

          // Clear notification flag if task is no longer due within 24 hours
          if (timeUntilDue > oneDayMs || timeUntilDue <= 0) {
            notifiedTasksRef.delete(todo.id)
          }
        }
      })
    }

    // Run checks immediately on mount and when todos change
    checkRecurringTasks()
    checkNotifications()

    // Then check every minute
    const interval = setInterval(() => {
      checkRecurringTasks()
      checkNotifications()
    }, 60000) // Check every minute

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
