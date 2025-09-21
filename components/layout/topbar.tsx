'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { Menu, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  onMenuClick?: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [openNotif, setOpenNotif] = useState(false)
  const [notifications, setNotifications] = useState<Database['public']['Tables']['notifications']['Row'][]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  // İlk yüklemede bildirimleri çek
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.read).length)
      }
    }

    fetchNotifications()

    // Realtime dinleme
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new as Database['public']['Tables']['notifications']['Row']
          setNotifications((prev) => [newNotif, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // dışarı tıklayınca dropdown kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpenNotif(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBellClick = () => {
    setOpenNotif(!openNotif)
    if (!openNotif) {
      // açıldığında unread sıfırlansın
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
      if (unreadIds.length > 0) {
        supabase.from('notifications').update({ read: true }).in('id', unreadIds)
        setNotifications((prev) =>
          prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: true } : n))
        )
        setUnreadCount(0)
      }
    }
  }

  const handleClick = (n: Database['public']['Tables']['notifications']['Row']) => {
    // yönlendirme
    if (n.type === 'revision' && n.task_id) {
      router.push(`/admin/tasks/${n.task_id}`)
    } else if (n.type === 'announcement') {
      router.push('/duyurular')
    } else if (n.type === 'task_update') {
      router.push('/is-akisi')
    } else if (n.target_url) {
      router.push(n.target_url)
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
                          n.read ? 'opacity-60' : 'font-semibold'
                        }`}
                        onClick={() => handleClick(n)}
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
        </div>
      </div>
    </header>
  )
}
