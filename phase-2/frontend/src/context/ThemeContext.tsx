'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, getThemeFromCookie, setThemeCookie } from '@/types'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  systemTheme: 'light' | 'dark' | null
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | null>(null)
  const [isDark, setIsDark] = useState(false)

  // Read theme from cookie on mount (session-aware)
  useEffect(() => {
    const savedTheme = getThemeFromCookie()
    setThemeState(savedTheme)
  }, [])

  // Detect system theme preference
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
      setIsDark(mediaQuery.matches)

      const handler = (e: MediaQueryListEvent) => {
        setSystemTheme(e.matches ? 'dark' : 'light')
        setIsDark(e.matches)
      }

      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    } else {
      setSystemTheme(theme === 'dark' ? 'dark' : 'light')
      setIsDark(theme === 'dark')
    }
  }, [theme])

  // Apply theme class to html element (zero-flicker: before hydration)
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    setThemeCookie(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, systemTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
