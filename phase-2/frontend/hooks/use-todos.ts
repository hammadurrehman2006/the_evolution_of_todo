"use client"

import { useState, useEffect, useCallback } from 'react'
import type { Todo, Priority } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { ApiError } from '@/lib/types'

/**
 * useTodos Hook - Hybrid Cloud Integration
 *
 * Replaces useMockTodos with remote API integration.
 * All data persistence happens in the remote Neon PostgreSQL database
 * via the production API at https://teot-phase2.vercel.app/
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<ApiError | null>(null)

  /**
   * Fetch todos from remote API
   * Supports optional filters for status, priority, and search
   */
  const fetchTodos = useCallback(async (filters?: {
    status?: 'all' | 'active' | 'completed'
    priority?: 'low' | 'medium' | 'high'
    search?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiClient.getTodos(filters)

      // Convert ISO 8601 date strings to Date objects
      const todosWithDates: Todo[] = data.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      }))

      setTodos(todosWithDates)
    } catch (err) {
      console.error('Failed to fetch todos:', err)
      setError(err instanceof ApiError ? err : new ApiError('Failed to load todos', 500))
      setTodos([])
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  /**
   * Add a new todo via API
   * T017: Implement addTask function
   */
  const addTask = useCallback(async (
    title: string,
    description?: string,
    priority: Priority = 'medium',
    tags: string[] = [],
    dueDate?: Date,
    recurring?: { enabled: boolean; frequency: 'daily' | 'weekly' | 'monthly'; interval: number }
  ) => {
    try {
      setError(null)

      // Convert dates to ISO 8601 strings (T019)
      const newTodoInput = {
        title: title.trim(),
        description: description?.trim(),
        completed: false,
        priority,
        tags,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        recurring,
      }

      // Call API to create todo
      const createdTodo = await apiClient.createTodo(newTodoInput)

      // Convert dates back to Date objects
      const todoWithDates: Todo = {
        ...createdTodo,
        createdAt: new Date(createdTodo.createdAt),
        updatedAt: createdTodo.updatedAt ? new Date(createdTodo.updatedAt) : undefined,
        dueDate: createdTodo.dueDate ? new Date(createdTodo.dueDate) : undefined,
      }

      // Update local state with new todo
      setTodos((prev) => [todoWithDates, ...prev])

      return todoWithDates
    } catch (err) {
      console.error('Failed to add todo:', err)
      const apiError = err instanceof ApiError ? err : new ApiError('Failed to add todo', 500)
      setError(apiError)
      throw apiError
    }
  }, [])

  /**
   * Update a todo via API
   * T026: Implement updateTask function
   */
  const updateTask = useCallback(async (
    id: string,
    updates: Partial<Omit<Todo, 'id' | 'createdAt'>>
  ) => {
    try {
      setError(null)

      // Convert dates to ISO 8601 strings (T019)
      const updatesWithDates: any = {
        ...updates,
        dueDate: updates.dueDate ? updates.dueDate.toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      }

      // Call API to update todo
      const updatedTodo = await apiClient.updateTodo(id, updatesWithDates)

      // Convert dates back to Date objects
      const todoWithDates: Todo = {
        ...updatedTodo,
        createdAt: new Date(updatedTodo.createdAt),
        updatedAt: updatedTodo.updatedAt ? new Date(updatedTodo.updatedAt) : undefined,
        dueDate: updatedTodo.dueDate ? new Date(updatedTodo.dueDate) : undefined,
      }

      // Update local state
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? todoWithDates : todo))
      )

      return todoWithDates
    } catch (err) {
      console.error('Failed to update todo:', err)
      const apiError = err instanceof ApiError ? err : new ApiError('Failed to update todo', 500)
      setError(apiError)
      throw apiError
    }
  }, [])

  /**
   * Delete a todo via API
   * T027: Implement deleteTask function
   */
  const deleteTask = useCallback(async (id: string) => {
    try {
      setError(null)

      // Call API to delete todo
      await apiClient.deleteTodo(id)

      // Remove from local state
      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    } catch (err) {
      console.error('Failed to delete todo:', err)
      const apiError = err instanceof ApiError ? err : new ApiError('Failed to delete todo', 500)
      setError(apiError)
      throw apiError
    }
  }, [])

  /**
   * Toggle todo completion status via API
   * T028: Implement toggleTask function
   */
  const toggleTask = useCallback(async (id: string) => {
    try {
      setError(null)

      // Call API to toggle todo
      const toggledTodo = await apiClient.toggleTodo(id)

      // Convert dates back to Date objects
      const todoWithDates: Todo = {
        ...toggledTodo,
        createdAt: new Date(toggledTodo.createdAt),
        updatedAt: toggledTodo.updatedAt ? new Date(toggledTodo.updatedAt) : undefined,
        dueDate: toggledTodo.dueDate ? new Date(toggledTodo.dueDate) : undefined,
      }

      // Update local state
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? todoWithDates : todo))
      )

      return todoWithDates
    } catch (err) {
      console.error('Failed to toggle todo:', err)
      const apiError = err instanceof ApiError ? err : new ApiError('Failed to toggle todo', 500)
      setError(apiError)
      throw apiError
    }
  }, [])

  /**
   * Get a single todo by ID
   * T018: Implement getTask function
   */
  const getTask = useCallback(async (id: string): Promise<Todo> => {
    try {
      setError(null)

      const todo = await apiClient.getTodo(id)

      // Convert dates back to Date objects
      const todoWithDates: Todo = {
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      }

      return todoWithDates
    } catch (err) {
      console.error('Failed to fetch todo:', err)
      const apiError = err instanceof ApiError ? err : new ApiError('Failed to fetch todo', 500)
      setError(apiError)
      throw apiError
    }
  }, [])

  return {
    todos,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getTask,
    fetchTodos,
  }
}
