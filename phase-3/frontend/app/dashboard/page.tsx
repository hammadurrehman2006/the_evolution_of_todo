"use client"

import { useEffect, useState, useMemo } from "react"
import { useTodoStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  Tag,
  Award,
  Flame,
  BarChart3,
  PieChart,
  ListTodo
} from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

export default function DashboardPage() {
  const { todos, loading } = useTodoStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!todos) return {
      total: 0, active: 0, completed: 0, completionRate: 0,
      completedToday: 0, overdue: 0, dueThisWeek: 0, highPriority: 0,
      avgPerDay: 0, currentStreak: 0, bestDay: '',
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const total = todos.length
    const completed = todos.filter(t => t.completed).length
    const active = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    // Completed today
    const completedToday = todos.filter(t => {
      if (!t.completed || !t.updatedAt) return false
      const completedDate = new Date(t.updatedAt)
      return completedDate >= today
    }).length
    
    // Overdue tasks
    const overdue = todos.filter(t => {
      if (t.completed || !t.dueDate) return false
      return new Date(t.dueDate) < now
    }).length
    
    // Due this week
    const dueThisWeek = todos.filter(t => {
      if (t.completed || !t.dueDate) return false
      const dueDate = new Date(t.dueDate)
      return dueDate >= today && dueDate <= weekFromNow
    }).length
    
    // High priority active tasks
    const highPriority = todos.filter(t => 
      !t.completed && t.priority === 'high'
    ).length
    
    // Average tasks per day (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const completedLast30 = todos.filter(t => {
      if (!t.completed || !t.updatedAt) return false
      return new Date(t.updatedAt) >= thirtyDaysAgo
    }).length
    const avgPerDay = parseFloat((completedLast30 / 30).toFixed(1))
    
    // Current streak
    let streak = 0
    let currentDate = today
    while (true) {
      const dayStart = new Date(currentDate)
      const dayEnd = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
      
      const completedOnDay = todos.some(t => {
        if (!t.completed || !t.updatedAt) return false
        const completedDate = new Date(t.updatedAt)
        return completedDate >= dayStart && completedDate < dayEnd
      })
      
      if (completedOnDay) {
        streak++
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)
      } else {
        break
      }
    }
    
    // Best day
    const tasksByDay = new Map<string, number>()
    todos.filter(t => t.completed && t.updatedAt).forEach(t => {
      const dayKey = new Date(t.updatedAt!).toISOString().split('T')[0]
      tasksByDay.set(dayKey, (tasksByDay.get(dayKey) || 0) + 1)
    })
    
    let bestDay = ''
    let maxTasks = 0
    tasksByDay.forEach((count, day) => {
      if (count > maxTasks) {
        maxTasks = count
        bestDay = day
      }
    })
    
    return {
      total, active, completed, completionRate,
      completedToday, overdue, dueThisWeek, highPriority,
      avgPerDay, currentStreak: streak, bestDay,
    }
  }, [todos])

  // Priority breakdown for pie chart
  const priorityData = useMemo(() => {
    if (!todos) return []
    
    const active = todos.filter(t => !t.completed)
    const high = active.filter(t => t.priority === 'high').length
    const medium = active.filter(t => t.priority === 'medium').length
    const low = active.filter(t => t.priority === 'low').length
    
    return [
      { name: 'High', value: high, color: '#ef4444' },
      { name: 'Medium', value: medium, color: '#f59e0b' },
      { name: 'Low', value: low, color: '#22c55e' },
    ].filter(d => d.value > 0)
  }, [todos])

  // Tag breakdown for bar chart
  const tagData = useMemo(() => {
    if (!todos) return []
    
    const active = todos.filter(t => !t.completed)
    const tagCount = new Map<string, number>()
    
    active.forEach(task => {
      task.tags?.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
      })
    })
    
    return Array.from(tagCount.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 tags
  }, [todos])

  // Due this week list
  const dueThisWeekList = useMemo(() => {
    if (!todos) return []
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return todos
      .filter(t => {
        if (t.completed || !t.dueDate) return false
        const dueDate = new Date(t.dueDate)
        return dueDate >= today && dueDate <= weekFromNow
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5) // Top 5
  }, [todos])

  // Recent activity
  const recentActivity = useMemo(() => {
    if (!todos) return []
    
    return todos
      .filter(t => t.updatedAt)
      .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
      .slice(0, 5)
  }, [todos])

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Track your productivity and task completion metrics
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Tasks"
              value={stats.total}
              description={`${stats.active} active, ${stats.completed} completed`}
              icon={ListTodo}
            />
            
            <StatCard
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              description="Of all tasks created"
              icon={TrendingUp}
              trend={stats.completionRate > 75 ? 'positive' : stats.completionRate < 50 ? 'negative' : 'neutral'}
            />
            
            <StatCard
              title="Completed Today"
              value={stats.completedToday}
              description="Tasks finished today"
              icon={Award}
              trend={stats.completedToday > 0 ? 'positive' : 'neutral'}
            />
            
            <StatCard
              title="Current Streak"
              value={stats.currentStreak}
              description="Days with completions"
              icon={Flame}
              suffix="days"
            />
          </div>

          {/* Alerts */}
          {(stats.overdue > 0 || stats.highPriority > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {stats.overdue > 0 && (
                <AlertCard
                  title="Overdue Tasks"
                  value={stats.overdue}
                  description="Tasks past their due date"
                  variant="destructive"
                />
              )}
              
              {stats.highPriority > 0 && (
                <AlertCard
                  title="High Priority"
                  value={stats.highPriority}
                  description="Active high-priority tasks"
                  variant="warning"
                />
              )}
            </div>
          )}

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Tasks by Priority
                </CardTitle>
                <CardDescription>Distribution of active tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {priorityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPie>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No active tasks to display
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tasks by Tag
                </CardTitle>
                <CardDescription>Most used tags</CardDescription>
              </CardHeader>
              <CardContent>
                {tagData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={tagData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="#005871" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No tags to display
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Task Lists */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Due This Week
                </CardTitle>
                <CardDescription>Upcoming deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-3">
                    {dueThisWeekList.length > 0 ? (
                      dueThisWeekList.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                              {task.priority}
                            </Badge>
                            <span className="font-medium">{task.title}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(task.dueDate!).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No tasks due this week
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest task updates</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={task.completed ? 'default' : 'outline'}>
                              {task.completed ? 'Completed' : 'Updated'}
                            </Badge>
                            <span className="font-medium">{task.title}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(task.updatedAt!).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No recent activity
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// Stat Card Component
interface StatCardProps {
  title: string
  value: number | string
  description: string
  icon: React.ElementType
  trend?: 'positive' | 'negative' | 'neutral'
  suffix?: string
}

function StatCard({ title, value, description, icon: Icon, trend, suffix }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}{suffix && <span className="text-sm font-normal ml-1">{suffix}</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className={`text-xs mt-2 ${
            trend === 'positive' ? 'text-green-600' : trend === 'negative' ? 'text-red-600' : 'text-muted-foreground'
          }`}>
            {trend === 'positive' ? '↑' : trend === 'negative' ? '↓' : '→'} Good
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Alert Card Component
interface AlertCardProps {
  title: string
  value: number
  description: string
  variant: 'destructive' | 'warning'
}

function AlertCard({ title, value, description, variant }: AlertCardProps) {
  return (
    <Card className={variant === 'destructive' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <AlertCircle className={`h-4 w-4 ${variant === 'destructive' ? 'text-red-600' : 'text-yellow-600'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
