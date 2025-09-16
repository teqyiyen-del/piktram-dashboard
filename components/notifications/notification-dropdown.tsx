'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck, FileText, Loader2, StickyNote, UploadCloud, Video } from 'lucide-react'
import { useNotificationCenter } from '@/components/providers/notification-provider'
import { formatDateTime } from '@/lib/utils'

const typeIconMap = {
  task: StickyNote,
  report: FileText,
  invoice: UploadCloud,
  meeting: Video,
  general: Bell
} as const

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, refresh } = useNotificationCenter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open && unreadCount > 0) {
      void markAsRead(notifications.filter((item) => !item.read_at).map((item) => item.id))
    }
  }, [open, unreadCount, notifications, markAsRead])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:text-accent dark:bg-gray-800 dark:text-gray-300 dark:hover:text-accent"
        aria-label="Bildirimler"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-accent" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-40 w-80 rounded-3xl border border-gray-200 bg-white p-4 text-sm shadow-xl transition dark:border-gray-700 dark:bg-surface-dark">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Bildirimler</p>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 transition hover:text-accent dark:bg-gray-800 dark:text-gray-300"
              onClick={handleRefresh}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />} Güncelle
            </button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="rounded-2xl bg-gray-50 px-4 py-6 text-center text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Henüz bildirim yok.
              </p>
            ) : (
              notifications.map((notification) => {
                const Icon = typeIconMap[notification.type]
                return (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 rounded-2xl border border-gray-100 px-3 py-3 transition hover:border-accent/40 hover:bg-accent/5 dark:border-gray-700 dark:hover:border-accent/40"
                  >
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{notification.title}</p>
                      {notification.description ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{notification.description}</p>
                      ) : null}
                      <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        {formatDateTime(notification.created_at)}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
