'use client'

import Link from 'next/link'
import { Navbar as FlowbiteNavbar, Button } from 'flowbite-react'
import { Moon, Sun, Monitor, LayoutDashboard, Home } from 'lucide-react'

export default function Navbar() {
  const [theme, setTheme] = useState('light')

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />
      case 'dark':
        return <Moon className="w-5 h-5" />
      case 'system':
        return <Monitor className="w-5 h-5" />
    }
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  return (
    <FlowbiteNavbar fluid>
      <FlowbiteNavbar.Brand href="/">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Productivity Suite
          </span>
        </div>
      </FlowbiteNavbar.Brand>

      <div className="flex md:order-2 items-center gap-4">
        <Link href="/" className="nav-link">
          <Button
            variant="ghost"
            color="gray"
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Home className="w-5 h-5 mr-2" />
          </Button>
        </Link>

        <Link href="/dashboard" className="nav-link">
          <Button
            variant="ghost"
            color="gray"
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LayoutDashboard className="w-5 h-5 mr-2" />
            Dashboard
          </Button>
        </Link>

        <Button
          onClick={cycleTheme}
          variant="ghost"
          color="gray"
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          {getThemeIcon()}
        </Button>
      </div>
    </FlowbiteNavbar>
  )
}
