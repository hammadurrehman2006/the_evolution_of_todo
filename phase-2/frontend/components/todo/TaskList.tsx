"use client"

import type { Todo } from "@/lib/types"
import { TaskCard } from "./TaskCard"
import { ListTodo } from "lucide-react"

interface TaskListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (todo: Todo) => void
}

export function TaskList({ todos, onToggle, onDelete, onEdit }: TaskListProps) {
  if (todos.length === 0) {
    return (
      <div className="py-16 text-center">
        <ListTodo className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-xl font-semibold text-muted-foreground">No tasks found</p>
        <p className="mt-2 text-muted-foreground">
          Try adjusting your filters or create a new task to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <TaskCard
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
