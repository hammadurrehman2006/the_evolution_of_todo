import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle2,
  Tag,
  Filter,
  Calendar,
  Repeat,
  Bell,
  ArrowRight,
  Zap,
  Target,
} from "lucide-react"
import { Hero } from "@/components/Hero"

export default function Home() {
  const features = [
    {
      icon: CheckCircle2,
      title: "Task Management",
      description: "Create, edit, and organize tasks with ease. Mark tasks as complete and track your progress effortlessly.",
    },
    {
      icon: Target,
      title: "Priority Levels",
      description: "Assign high, medium, or low priority to your tasks. Focus on what matters most and stay productive.",
    },
    {
      icon: Tag,
      title: "Tags & Categories",
      description: "Organize tasks with custom tags. Group related items and find what you need instantly.",
    },
    {
      icon: Filter,
      title: "Smart Filtering",
      description: "Filter tasks by status, priority, tags, or search keywords. Find exactly what you're looking for.",
    },
    {
      icon: Calendar,
      title: "Due Dates & Reminders",
      description: "Set deadlines with date and time. Receive browser notifications when tasks are due soon.",
    },
    {
      icon: Repeat,
      title: "Recurring Tasks",
      description: "Automate repeating tasks with daily, weekly, or monthly schedules. Never forget routine work.",
    },
  ]

  return (
    <div className="flex flex-col">
      <Hero />

      {/* Features Section */}
      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to stay organized
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Powerful features designed to help you manage tasks efficiently and boost your productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Benefits</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why choose TaskFlow?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Built with modern technologies for instant responsiveness and smooth interactions.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Smart Notifications</h3>
              <p className="text-muted-foreground">
                Never miss a deadline with intelligent browser notifications for upcoming tasks.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Stay Focused</h3>
              <p className="text-muted-foreground">
                Priority levels and smart filtering help you focus on what matters most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Card className="border-2">
            <CardHeader className="text-center space-y-4 pb-8">
              <CardTitle className="text-3xl sm:text-4xl">
                Ready to boost your productivity?
              </CardTitle>
              <CardDescription className="text-lg">
                Start organizing your tasks today with TaskHive&apos;s powerful features.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-8">
              <Link href="/todos">
                <Button size="lg" className="text-lg w-full sm:w-auto group">
                  Start Managing Tasks
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
