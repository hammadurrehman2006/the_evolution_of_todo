"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, LayoutDashboard } from "lucide-react"
import { useSession } from "@/lib/auth-client"

export function Hero() {
  const { data: session } = useSession()

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 dark:bg-none px-4 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="mr-2 h-3 w-3" />
            Professional Task Management
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to <span className="text-primary">TaskHive</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Streamline your workflow with intelligent task management.
            Organize, prioritize, and accomplish more every day with powerful features designed for professionals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            {session ? (
              <Link href="/todos">
                <Button size="lg" className="text-lg">
                  Go to Dashboard
                  <LayoutDashboard className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/todos">
                  <Button size="lg" className="text-lg">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="text-lg">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
