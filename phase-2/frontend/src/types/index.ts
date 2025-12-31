/* Type definitions for Professional Productivity Suite */

// Task Entity
export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority?: PriorityLevel
  tags?: Tag[]
  dueDate?: string | null
  recurrence?: RecurrenceSchedule | null
  createdAt: string
  updatedAt: string
  deleted: boolean
}

// Tag Entity
export interface Tag {
  id: string
  label: string
  color: string
  createdAt: string
  usageCount: number
}

// Priority Levels
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical'

// Priority color mapping
export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#10b981',
}

// Recurrence Schedule
export interface RecurrenceSchedule {
  taskId: string
  intervalType: IntervalType
  intervalValue?: number | null
  endCondition: EndCondition
  endValue?: string | number | null
  timezone: string
  lastGenerated: string
}

// Interval Types
export type IntervalType = 'daily' | 'weekly' | 'monthly' | 'custom'

// End Condition
export type EndCondition = 'none' | 'date' | 'occurrences'

// User Preferences
export interface UserPreferences {
  userId: string
  theme: Theme
  notificationPermission: NotificationPermission
  timezone: string
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Notification Permission
export type NotificationPermission = 'default' | 'granted' | 'denied'

// Filter Criteria
export interface FilterCriteria {
  status?: string[]
  priority?: PriorityLevel[]
  tags?: string[]
  dueDateRange?: DateRange | null
  searchTerm?: string
}

// Date Range
export interface DateRange {
  start?: string | null
  end?: string | null
}

// Sort Criteria
export interface SortCriteria {
  field: SortField
  direction: SortDirection
}

// Sort Field
export type SortField = 'dueDate' | 'priority' | 'createdAt' | 'updatedAt' | 'completedAt'

// Sort Direction
export type SortDirection = 'asc' | 'desc'

// Task Metrics
export interface TaskMetrics {
  total: number
  completed: number
  pending: number
  overdue: number
  completionRate: number
}

// Create Task Request
export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: PriorityLevel
  tagIds?: string[]
  dueDate?: string | null
  recurrence?: {
    intervalType: IntervalType
    intervalValue?: number
    endCondition: EndCondition
    endValue?: string | number
  }
}

// Update Task Request
export interface UpdateTaskRequest {
  id: string
  updates: Partial<Omit<Task, 'id'>>
}

// Navigation Link
export interface NavLink {
  label: string
  href: string
  icon?: React.ReactNode
  exact?: boolean
}

// Validation Error
export interface ValidationError {
  field: string
  message: string
}
