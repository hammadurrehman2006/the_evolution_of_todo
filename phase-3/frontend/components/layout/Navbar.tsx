"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, CheckCircle2, Menu, X } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { LoginButton } from "@/components/auth/LoginButton"
import { UserNav } from "@/components/auth/UserNav"
import { useState } from "react"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { data: session, isPending } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">TaskHive</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-4 ml-6">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/todos">
              <Button variant="ghost">Tasks</Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Auth UI - conditional rendering */}
          {!isPending && (
            session ? <UserNav user={session.user} /> : <LoginButton />
          )}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t px-4 py-4 space-y-2 bg-background">
          <Link href="/" className="block" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">Home</Button>
          </Link>
          <Link href="/todos" className="block" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">Tasks</Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
