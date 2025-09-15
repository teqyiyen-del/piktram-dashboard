'use client'

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

type Props = {
  children: ReactNode
  initialTheme?: Theme
}

export function ThemeProvider({ children, initialTheme = 'light' }: Props) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)

  useEffect(() => {
    const stored = window.localStorage.getItem('piktram-theme') as Theme | null
    if (stored) {
      setThemeState(stored)
    }
  }, [])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('bg-gray-900', 'text-white')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('bg-gray-900', 'text-white')
    }
    window.localStorage.setItem('piktram-theme', theme)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    setTheme: (next: Theme) => setThemeState(next)
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}
