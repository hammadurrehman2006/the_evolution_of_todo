"use client"

import { useState, useEffect } from 'react'

// Helper function to convert Date to datetime-local input format (local timezone)
function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Todo, Priority } from "@/lib/types"

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (
    title: string,
    description?: string,
    priority?: Priority,
    tags?: string[],
    dueDate?: Date,
    recurring?: { enabled: boolean; frequency: 'daily' | 'weekly' | 'monthly'; interval: number }
  ) => void
  editingTodo?: Todo | null
  onUpdate?: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
}

export function TaskForm({ isOpen, onClose, onSubmit, editingTodo, onUpdate }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [recurringEnabled, setRecurringEnabled] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [recurringInterval, setRecurringInterval] = useState(1)

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setPriority("medium")
    setTags([])
    setTagInput("")
    setDueDate("")
    setRecurringEnabled(false)
    setRecurringFrequency('weekly')
    setRecurringInterval(1)
  }

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title)
      setDescription(editingTodo.description || "")
      setPriority(editingTodo.priority)
      setTags(editingTodo.tags)
      setDueDate(editingTodo.dueDate ? formatDateForInput(new Date(editingTodo.dueDate)) : "")
      setRecurringEnabled(editingTodo.recurring?.enabled || false)
      setRecurringFrequency(editingTodo.recurring?.frequency || 'weekly')
      setRecurringInterval(editingTodo.recurring?.interval || 1)
    } else {
      resetForm()
    }
  }, [editingTodo, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        tags,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        recurring: recurringEnabled ? { enabled: true, frequency: recurringFrequency, interval: recurringInterval } : undefined,
      }

      if (editingTodo && onUpdate) {
        onUpdate(editingTodo.id, taskData)
      } else {
        onSubmit(
          taskData.title,
          taskData.description,
          taskData.priority,
          taskData.tags,
          taskData.dueDate,
          taskData.recurring
        )
      }
      resetForm()
      onClose()
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTodo ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {editingTodo ? 'Update the task details below.' : 'Add a new task to your workflow. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Task Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                maxLength={200}
                required
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about your task..."
                maxLength={1000}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/1000 characters
              </p>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="Add a tag and press Enter..."
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date & Time</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Recurring */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={recurringEnabled}
                  onCheckedChange={setRecurringEnabled}
                />
                <Label htmlFor="recurring">Recurring Task</Label>
              </div>

              {recurringEnabled && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={recurringFrequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setRecurringFrequency(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interval">Every</Label>
                    <Input
                      id="interval"
                      type="number"
                      min={1}
                      max={30}
                      value={recurringInterval}
                      onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {editingTodo ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
