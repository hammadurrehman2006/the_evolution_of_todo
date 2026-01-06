export type Priority = 'low' | 'medium' | 'high'

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: Priority
  tags: string[]
  dueDate?: Date
  recurring?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
  }
  createdAt: Date
  updatedAt?: Date
}

export type Theme = 'light' | 'dark' | 'system'

// API Types
export interface ApiResponse<T = any> {
  data?: T
  error?: {
    message: string
    code?: string
    status?: number
  }
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number = 500, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export interface ThemePreference {
  theme: Theme
}

export interface FilterOptions {
  search: string
  status: 'all' | 'active' | 'completed'
  priority: 'all' | Priority
  tags: string[]
}

export type SortOption = 'dueDate' | 'priority' | 'title' | 'createdAt'
