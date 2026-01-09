"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { 
  TrendingUp, CheckCircle2, Calendar as CalendarIcon, 
  Award, AlertCircle, Clock, Activity, ListChecks, PieChart as PieChartIcon 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { DateRange } from "react-day-picker"
import { useTodoStore } from "@/lib/store"
import { InteractiveLoader } from "@/components/ui/interactive-loader"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export default function AnalyticsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const { todos, fetchTodos, loading: storeLoading } = useTodoStore()
  
  // Date range state
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })

  useEffect(() => {
    if (session) {
      // Fetch if we don't have data, or just refresh in background
      // If we have data, we don't wait (immediate display)
      fetchTodos() 
    } else if (!isPending) {
      router.push("/auth/login")
    }
  }, [session, isPending, router])

  // --- Filtered Data based on Date Range ---
  const filteredTodos = useMemo(() => {
    if (!date?.from || !date?.to) return todos
    
    return todos.filter(t => {
      const taskDate = new Date(t.createdAt)
      return isWithinInterval(taskDate, { start: startOfDay(date.from!), end: endOfDay(date.to!) })
    })
  }, [todos, date])

  // --- Metrics Calculation ---
  const stats = useMemo(() => {
    const total = filteredTodos.length
    const completed = filteredTodos.filter(t => t.completed).length
    const active = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    // Priority Breakdown
    const byPriority = [
      { name: "High", value: filteredTodos.filter(t => t.priority === "high").length },
      { name: "Medium", value: filteredTodos.filter(t => t.priority === "medium").length },
      { name: "Low", value: filteredTodos.filter(t => t.priority === "low").length },
    ].filter(i => i.value > 0)

    // Daily Productivity for the selected range
    const dailyMap: Record<string, number> = {}
    if (date?.from && date?.to) {
        let current = startOfDay(date.from)
        const end = endOfDay(date.to)
        while (current <= end) {
            dailyMap[format(current, "yyyy-MM-dd")] = 0
            current = new Date(current.getTime() + 86400000)
        }
    }

    filteredTodos.forEach(t => {
        if (t.completed && t.updatedAt) {
            const dateStr = format(new Date(t.updatedAt), "yyyy-MM-dd")
            if (dailyMap[dateStr] !== undefined) {
                dailyMap[dateStr]++
            }
        }
    })

    const trendData = Object.entries(dailyMap).map(([dateStr, count]) => ({
        name: format(new Date(dateStr), "MMM dd"),
        completed: count
    }))

    // Recent Activities
    const recentActivities = [...todos]
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
        .slice(0, 15)

    // Streak Calculation
    let streak = 0
    const todayStr = format(new Date(), "yyyy-MM-dd")
    const hasToday = todos.some(t => t.completed && t.updatedAt && format(new Date(t.updatedAt), "yyyy-MM-dd") === todayStr)
    
    if (hasToday) streak++
    
    for (let i = 1; i < 365; i++) {
      const dateStr = format(subDays(new Date(), i), "yyyy-MM-dd")
      const hasActivity = todos.some(t => t.completed && t.updatedAt && format(new Date(t.updatedAt), "yyyy-MM-dd") === dateStr)
      if (hasActivity) {
        streak++
      } else {
        if (i === 1 && !hasToday) continue 
        break
      }
    }

    return { total, completed, active, completionRate, byPriority, trendData, streak, recentActivities }
  }, [filteredTodos, todos, date])

  // Only show loader if we have NO data and are loading/pending
  // This satisfies "displayed immediately" if data exists in store
  const shouldShowLoader = isPending || (storeLoading && todos.length === 0)

  if (shouldShowLoader) {
    return <InteractiveLoader />
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Productivity Hub</h1>
          <p className="text-muted-foreground mt-2 text-lg">Your evolution, quantified.</p>
        </div>
        
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                    date.to ? (
                        <>
                        {format(date.from, "LLL dd, y") + " - " + format(date.to, "LLL dd, y")}
                        </>
                    ) : (
                        format(date.from, "LLL dd, y")
                    )
                    ) : (
                    <span>Pick a date</span>
                    )}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                />
                </PopoverContent>
            </Popover>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex justify-center md:justify-start">
            <TabsList className="grid w-full max-w-[400px] grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.completionRate}%</div>
                        <div className="flex items-center mt-1">
                            <Badge variant="secondary" className="text-[10px] py-0">Target: 80%</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Successes</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tasks completed in range</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-orange-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hot Streak</CardTitle>
                        <Award className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.streak} Days</div>
                        <p className="text-xs text-muted-foreground mt-1">Don't break the chain!</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <AlertCircle className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground mt-1">Open loops detected</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Completion Volume
                        </CardTitle>
                        <CardDescription>Daily completed tasks for current selection</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pl-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 4 }}
                                />
                                <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5 text-primary" />
                            Priority Mix
                        </CardTitle>
                        <CardDescription>Workload distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center justify-center">
                        {stats.byPriority.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                data={stats.byPriority}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                >
                                {stats.byPriority.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <ListChecks className="h-12 w-12 opacity-20" />
                                <p>No task data for this range</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Cumulative Progress
                    </CardTitle>
                    <CardDescription>Visualizing your forward momentum</CardDescription>
                </CardHeader>
                <CardContent className="h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.trendData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="completed" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={3} 
                                dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="activity">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Activity Timeline
                    </CardTitle>
                    <CardDescription>Recently updated or created tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                            {stats.recentActivities.length > 0 ? (
                                stats.recentActivities.map((todo) => (
                                    <div key={todo.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className={cn(
                                            "mt-1 p-2 rounded-full",
                                            todo.completed ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
                                        )}>
                                            {todo.completed ? <CheckCircle2 className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-sm">{todo.title}</p>
                                                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                                    {format(new Date(todo.updatedAt || todo.createdAt), "MMM dd, HH:mm")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px] py-0 h-4 capitalize">
                                                    {todo.priority}
                                                </Badge>
                                                {todo.tags.slice(0, 2).map(tag => (
                                                    <Badge key={tag} variant="secondary" className="text-[10px] py-0 h-4">
                                                        #{tag}
                                                    </Badge>
                                                ))}
                                                <span className="text-[11px] text-muted-foreground">
                                                    {todo.completed ? "Completed" : "Active"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-muted-foreground">
                                    No recent activity found.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}