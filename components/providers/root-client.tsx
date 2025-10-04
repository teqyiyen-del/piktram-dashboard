'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import { NotificationProvider } from '@/components/providers/notification-provider'

export default function RootClient({
  children,
  initialTheme,
}: {
  children: ReactNode
  initialTheme: 'light' | 'dark'
}) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ToastProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
