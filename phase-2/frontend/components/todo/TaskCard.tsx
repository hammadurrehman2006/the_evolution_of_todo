"use client"

import type { Todo } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Trash2, Edit, Clock, Repeat } from "lucide-react"

interface TaskCardProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
}

export function TaskCard({ todo, onToggle, onDelete, onEdit }: TaskCardProps) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  const formatDueDate = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return `Overdue by ${Math.abs(days)} days`
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    return `Due in ${days} days`
  }

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date()

  return (
    <Card className={`transition-all hover:shadow-lg ${isOverdue ? 'border-red-500' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle
                className={`text-xl ${
                  todo.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {todo.title}
              </CardTitle>
              <Badge variant={todo.completed ? "secondary" : "default"} className="ml-auto">
                {todo.completed ? "Completed" : "Active"}
              </Badge>
            </div>

            {todo.description && (
              <p className="text-sm text-muted-foreground">
                {todo.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2 items-center">
              {/* Priority Badge */}
              <Badge className={priorityColors[todo.priority]}>
                {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
              </Badge>

              {/* Tags */}
              {todo.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}

              {/* Due Date */}
              {todo.dueDate && (
                <Badge
                  variant={isOverdue ? "destructive" : "secondary"}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  {formatDueDate(new Date(todo.dueDate))}
                </Badge>
              )}

              {/* Recurring */}
              {todo.recurring?.enabled && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Repeat className="h-3 w-3" />
                  {todo.recurring.frequency}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(todo.id)}
            className="flex items-center space-x-2"
          >
            {todo.completed ? (
              <>
                <Circle className="h-4 w-4" />
                <span>Mark Active</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(todo)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(todo.id)}
            className="flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
