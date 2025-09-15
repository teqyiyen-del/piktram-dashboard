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
      applyTheme(stored)
    } else {
      applyTheme(initialTheme)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem('piktram-theme', theme)
  }, [theme])

  const value = useMemo(() => ({
    theme,
    setTheme: (next: Theme) => setThemeState(next)
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }
  return context
}
