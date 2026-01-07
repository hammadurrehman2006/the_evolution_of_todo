"use client"

import { useEffect, useCallback } from 'react'
import { useTodoStore } from '@/lib/store'
import {
  initNotifications,
  requestNotificationPermission,
  showTaskDueNotification,
  isNotificationReady
} from '@/lib/notifications'

/**
 * useTodos Hook - Hybrid Cloud Integration
 *
 * Now powered by Zustand for state management.
 * Keeps backward compatibility for components using this hook.
 */
export function useTodos() {
  const {
    todos,
    loading,
    error,
    fetchTodos,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getTask
  } = useTodoStore()

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
            if (success) notifiedTasksRef.add(fiveMinKey)
          }

          // 1-minute warning
          if (timeUntilDue > 0 && timeUntilDue <= oneMinuteMs && !notifiedTasksRef.has(oneMinKey)) {
            const success = await showTaskDueNotification(todo.title, 1)
            if (success) notifiedTasksRef.add(oneMinKey)
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

  // Initial fetch if empty and not loading
  useEffect(() => {
    // Only fetch if we haven't loaded yet to avoid infinite loops if strict mode is on
    // But since we want to ensure fresh data on mount, calling it is safer.
    // The store's fetchTodos sets loading state which prevents flickering if handled correctly.
    fetchTodos()
  }, [fetchTodos])

  const {
    filters,
    sortBy,
    setFilters,
    setSortBy
  } = useTodoStore()

  return {
    todos,
    loading,
    error,
    fetchTodos,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getTask,
    filters,
    sortBy,
    setFilters,
    setSortBy
  }
}