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
