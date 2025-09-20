'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/supabase-types'
import type { Notification } from '@/lib/types'

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  refresh: () => Promise<void>
  markAsRead: (ids: string[]) => Promise<void>
  push: (notification: Notification) => void
}

const NotificationContext = createContext<
  NotificationContextValue | undefined
>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClientComponentClient<Database>()

  // API'den çek
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (!res.ok) {
        console.error('notifications API error', await res.text())
        return
      }
      const data = (await res.json()) as Notification[]
      setNotifications(data.slice(0, 4)) // 🔑 max 4 tutuyorsan bırak, yoksa slice kaldır
    } catch (err) {
      console.error('fetchNotifications error', err)
    }
  }

  useEffect(() => {
    void fetchNotifications()

    // Realtime insert
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        async (payload) => {
          const newNotif = payload.new as Notification

          const { data: userData } = await supabase.auth.getUser()
          const currentUserId = userData?.user?.id ?? null

          if (newNotif.user_id === null || newNotif.user_id === currentUserId) {
            setNotifications((prev) => {
              const updated = [newNotif, ...prev]
              return updated.slice(0, 4)
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Okundu işaretle
  const markAsRead = async (ids: string[]) => {
    if (!ids.length) return
    const now = new Date().toISOString()

    // 🔑 Optimistik update → unreadCount anında sıfırlanır
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read_at: now } : n))
    )

    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) {
        console.error('PATCH /api/notifications failed', await res.text())
        void fetchNotifications()
      }
    } catch (err) {
      console.error('markAsRead error', err)
      void fetchNotifications()
    }
  }

  const push = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 4))
  }

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((item) => !item.read_at).length,
      refresh: fetchNotifications,
      markAsRead,
      push,
    }),
    [notifications]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationCenter() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'NotificationProvider dışında useNotificationCenter kullanılamaz'
    )
  }
  return context
}
