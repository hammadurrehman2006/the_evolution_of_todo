'use client'

import { useState, useCallback } from 'react'
import { Task, TaskMetrics } from '@/types'
import TaskCard from './TaskCard'
import DashboardMetrics from '@/components/ui/DashboardMetrics'
import { Button } from 'flowbite-react'
import { Plus, Loader2, Trash2, Filter as FilterIcon } from 'lucide-react'
import { getTasks, createTask, deleteTask, toggleTaskCompletion } from '@/lib/tasks'

interface TaskForm {
  title: string
  description?: string
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState<TaskForm>({ title: '', description: '' })

  // Load tasks on mount
  useEffect(() => {
    getTasks().then(setTasks).finally(() => setLoading(false))
  }, [])

  // Calculate metrics
  const metrics: TaskMetrics = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length,
    completionRate: tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0
  }

  // Event handlers
  const handleToggleComplete = useCallback(async (taskId: string, completed: boolean) => {
    const updatedTask = await toggleTaskCompletion(taskId, completed)
    setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))
  }, [])

  const handleDelete = useCallback(async (taskId: string) => {
    await deleteTask(taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }, [])

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task)
    setFormData({ title: task.title, description: task.description })
    setShowModal(true)
  }, [])

  const handleCreate = useCallback(async () => {
    setEditingTask(null)
    setFormData({ title: '', description: '' })
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    if (editingTask) {
      const updatedTask = await toggleTaskCompletion(editingTask.id, formData.title !== editingTask.title ? false : editingTask.completed)
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t))
    } else {
      const newTask = await createTask({
        title: formData.title,
        description: formData.description
      })
      setTasks(prev => [newTask, ...prev])
    }

    setShowModal(false)
    setEditingTask(null)
    setFormData({ title: '', description: '' })
  }, [editingTask])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <DashboardMetrics metrics={metrics} />

      {/* Task List Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tasks
        </h2>
        <Button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Task
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No tasks found matching your filters.
            </p>
            <Button variant="outline" onClick={() => setShowModal(true)}>
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Task Form Modal */}
        <TaskFormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingTask(null)
            setFormData({ title: '', description: '' })
          }}
          onSubmit={handleSubmit}
          task={editingTask}
          availableTags={[]}
        />
      </div>
    </div>
  )
}
