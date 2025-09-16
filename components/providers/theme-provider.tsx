"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  initialTheme = "light",
}: {
  children: React.ReactNode
  initialTheme?: Theme
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)

  // LocalStorage'dan tema oku
  useEffect(() => {
    const stored = window.localStorage.getItem("piktram-theme") as Theme | null
    if (stored) {
      setThemeState(stored)
      applyTheme(stored)
    } else {
      applyTheme(initialTheme)
    }
  }, [])

  // Tema değiştiğinde uygulama
  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem("piktram-theme", theme)
  }, [theme])

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme)
    applyTheme(newTheme)
    window.localStorage.setItem("piktram-theme", newTheme)
  }

  function applyTheme(theme: Theme) {
    if (theme  "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}

