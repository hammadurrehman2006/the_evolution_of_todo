'use client'

import { useState } from 'react'
import { Modal, Button, Label, TextInput, Textarea, Select } from 'flowbite-react'
import { X } from 'lucide-react'

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description?: string }) => Promise<void>
  task?: { id: string; title: string; description: string } | null
}

interface TaskForm {
  title: string
  description: string
}

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority?: string
  tags?: { id: string; label: string; color: string }[]
  dueDate?: string | null
}

export default function TaskFormModal({ isOpen, onClose, onSubmit, task }: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskForm>({ title: '', description: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (task) {
        // Edit mode - not implemented for MVP
        await onSubmit({
          title: formData.title,
          description: formData.description
        })
      } else {
        await onSubmit({
          title: formData.title,
          description: formData.description
        })
      }

      setFormData({ title: '', description: '' })
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title" className="mb-2 block">
            Title <span className="text-red-500">*</span>
          </Label>
          <TextInput
            id="title"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter task title..."
            required
            minLength={1}
            maxLength={200}
            disabled={isSubmitting}
            className="w-full"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            1-200 characters
          </p>
        </div>

        <div>
          <Label htmlFor="description" className="mb-2 block">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter task description..."
            rows={4}
            maxLength={1000}
            disabled={isSubmitting}
            className="w-full"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Up to 1000 characters (optional)
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          color="info"
          disabled={isSubmitting || !formData.title.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
      </div>
    </div>
  )
}
