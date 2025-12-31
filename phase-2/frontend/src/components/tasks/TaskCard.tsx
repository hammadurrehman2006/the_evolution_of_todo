'use client'

import { Checkbox } from 'flowbite-react'
import { Trash2 } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onToggleComplete: (taskId: string, completed: boolean) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-4">
        <Checkbox
          checked={task.completed}
          onChange={() => onToggleComplete(task.id, !task.completed)}
          className="mt-1"
        />

        <div className="flex-1">
          <div className="flex-1">
            <h3
              className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {task.description}
              </p>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {task.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 text-xs rounded-full text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            {task.dueDate && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}

            {task.priority && (
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                  task.priority === 'Critical' ? 'bg-red-600' :
                  task.priority === 'High' ? 'bg-orange-500' :
                  task.priority === 'Medium' ? 'bg-yellow-500' :
                  'bg-green-600'
                }`}
              >
                {task.priority}
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
            >
              Edit
            </Button>

            <Button
              color="failure"
              size="sm"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
