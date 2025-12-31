/* Task API client placeholder for MVP */
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types'

// Mock data for MVP (will be replaced with real API in backend phase)
let mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review project documentation',
    description: 'Read through the spec.md, plan.md, and data-model.md files',
    completed: false,
    priority: 'High',
    tags: [],
    dueDate: null,
    recurrence: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false
  },
  {
    id: '2',
    title: 'Set up development environment',
    description: 'Install Node.js 18+, configure Git, set up VS Code',
    completed: true,
    priority: 'Medium',
    tags: [],
    dueDate: null,
    recurrence: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    deleted: false
  },
  {
    id: '3',
    title: 'Implement user authentication',
    description: 'Integrate Better Auth for secure login',
    completed: false,
    priority: 'Critical',
    tags: [],
    dueDate: null,
    recurrence: null,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    deleted: false
  }
]

export async function getTasks(): Promise<Task[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockTasks.filter(task => !task.deleted)
}

export async function createTask(request: CreateTaskRequest): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 300))

  const newTask: Task = {
    id: Math.random().toString(36).substr(2, 9),
    title: request.title,
    description: request.description || '',
    completed: false,
    priority: request.priority || 'Medium',
    tags: [],
    dueDate: request.dueDate || null,
    recurrence: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false
  }

  mockTasks.unshift(newTask)
  return newTask
}

export async function updateTask(request: UpdateTaskRequest): Promise<Task> {
  await new Promise(resolve => setTimeout(resolve, 300))

  const index = mockTasks.findIndex(t => t.id === request.id)
  if (index === -1) throw new Error('Task not found')

  const updatedTask = {
    ...mockTasks[index],
    ...request.updates,
    updatedAt: new Date().toISOString()
  }

  mockTasks[index] = updatedTask
  return updatedTask
}

export async function deleteTask(taskId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300))

  const index = mockTasks.findIndex(t => t.id === taskId)
  if (index === -1) throw new Error('Task not found')

  // Soft delete
  mockTasks[index].deleted = true
  mockTasks[index].updatedAt = new Date().toISOString()
}

export async function toggleTaskCompletion(taskId: string, completed: boolean): Promise<Task> {
  return updateTask({
    id: taskId,
    updates: { completed }
  })
}
