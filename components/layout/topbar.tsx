'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, Bell } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useNotificationCenter } from '@/components/providers/notification-provider'

interface TopbarProps {
  fullName: string | null
  email: string
  role: 'admin' | 'user'
  onMenuClick?: () => void
}

export default function Topbar({ fullName, email, onMenuClick }: TopbarProps) {
  const router = useRouter()
  const [openNotif, setOpenNotif] = useState(false)
  const { notifications, unreadCount, markAsRead } = useNotificationCenter()
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  // dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpenNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // zil butonu
  const handleBellClick = async () => {
    if (!openNotif) {
      const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id)
      if (unreadIds.length) {
        // 🔑 Optimistik update: hemen okunmuş gibi işaretle
        const now = new Date().toISOString()
        notifications.forEach((n) => {
          if (unreadIds.includes(n.id)) {
            n.read_at = now
          }
        })

        // backend'e gönder
        await markAsRead(unreadIds)
      }
      setOpenNotif(true)
    } else {
      setOpenNotif(false)
    }
  }

  const handleClick = async (
    id: string,
    type?: string,
    targetUrl?: string
  ) => {
    await markAsRead([id])

    if (targetUrl) {
      router.push(targetUrl)
    } else {
      if (type === 'announcement') router.push('/duyurular')
      else if (type === 'task_update') router.push('/is-akisi')
      else if (type === 'revision') router.push('/revizyonlar')
    }

    setOpenNotif(false)
  }

  return (
    <header className="fixed top-4 left-0 right-0 z-30 h-16">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:pl-[300px] lg:pr-8">
        {/* Menü butonu → sadece mobilde */}
        {onMenuClick && (
          <Button
            type="button"
            onClick={onMenuClick}
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-xl lg:hidden"
            aria-label="Menüyü aç"
          >
            <Menu className="h-6 w-6" />
          </Button>
        )}

        {/* Sağ kısım */}
        <div className="ml-auto flex items-center gap-4">
          {/* Bildirim */}
          <div className="relative" ref={wrapperRef}>
            <Button
              type="button"
              onClick={handleBellClick}
              variant="outline"
              size="icon"
              className="relative h-12 w-12 rounded-xl"
              aria-label="Bildirimler"
            >
              <Bell className="h-7 w-7" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Button>

            {openNotif && (
              <div className="absolute right-0 mt-3 w-80 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-lg dark:border-gray-700 dark:bg-surface-dark">
                <p className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                  Bildirimler
                </p>
                <ul className="max-h-72 space-y-2 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          n.read_at ? 'opacity-60' : 'font-semibold'
                        }`}
                        onClick={() =>
                          handleClick(
                            n.id,
                            (n as any).type,
                            (n as any).target_url
                          )
                        }
                      >
                        <p className="font-medium text-gray-800 dark:text-gray-100">
                          {n.title ?? 'Yeni bildirim'}
                        </p>
                        {n.description && (
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            {n.description}
                          </p>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="px-3 py-2 text-gray-500 dark:text-gray-400">
                      Bildirim yok
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Kullanıcı bilgisi */}
          <div className="hidden min-w-[220px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
              {getInitials(fullName)}
            </div>
            <div className="truncate text-sm">
              <p className="font-semibold text-gray-900 dark:text-white">
                {fullName ?? 'Takım Üyesi'}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
