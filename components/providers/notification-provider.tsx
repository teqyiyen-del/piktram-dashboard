'use client'

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import type { Notification } from '@/lib/types'

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  refresh: () => Promise<void>
  markAsRead: (ids: string[]) => Promise<void>
  push: (notification: Notification) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotifications = async () => {
    const response = await fetch('/api/notifications', { cache: 'no-store' })
    if (!response.ok) return
    const data = (await response.json()) as Notification[]
    setNotifications(data)
  }

  useEffect(() => {
    void fetchNotifications()
  }, [])

  const markAsRead = async (ids: string[]) => {
    if (!ids.length) return
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    })
    setNotifications((prev) =>
      prev.map((item) => (ids.includes(item.id) ? { ...item, read_at: new Date().toISOString() } : item))
    )
  }

  const push = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev])
  }

  const value = useMemo<NotificationContextValue>(() => ({
    notifications,
    unreadCount: notifications.filter((item) => !item.read_at).length,
    refresh: fetchNotifications,
    markAsRead,
    push
  }), [notifications])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotificationCenter() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('NotificationProvider dışında useNotificationCenter kullanılamaz')
  }
  return context
}
