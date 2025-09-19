'use client'

import { useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { Menu, LogOut, Bell } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  fullName: string | null
  email: string
  role: 'admin' | 'user'
  onMenuClick?: () => void // ✅ opsiyonel hale getirildi
}

export default function Topbar({ fullName, email, onMenuClick }: TopbarProps) {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const [openNotif, setOpenNotif] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 border-b border-gray-200/60 bg-white/80 backdrop-blur-md dark:border-gray-800/60 dark:bg-surface-dark/80">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:pl-[300px] lg:pr-8">
        {/* Sol: Menü butonu sadece mobile */}
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-accent hover:text-white dark:border-gray-700 dark:bg-surface-dark dark:text-gray-300 lg:hidden"
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Sağ: Bildirim + Kullanıcı + Logout */}
        <div className="ml-auto flex items-center gap-4">
          {/* Bildirim */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenNotif(!openNotif)}
              className="group relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition dark:border-gray-700 dark:bg-surface-dark dark:text-gray-300 hover:bg-accent"
            >
              <Bell className="h-5 w-5 transition group-hover:text-white" />
              <span className="absolute -top-1.5 -right-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-sm">
                3
              </span>
            </button>

            {/* Dropdown */}
            {openNotif && (
              <div className="absolute right-0 mt-3 w-72 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-lg dark:border-gray-700 dark:bg-surface-dark">
                <p className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                  Bildirimler
                </p>
                <ul className="space-y-2">
                  <li className="rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Yeni proje eklendi 🎉
                  </li>
                  <li className="rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                    2 içerik onay bekliyor
                  </li>
                  <li className="rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                    Rapor hazırlandı 📊
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Kullanıcı */}
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

          {/* Logout */}
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="hidden gap-2 lg:inline-flex"
          >
            <LogOut className="h-4 w-4" /> Çıkış Yap
          </Button>
        </div>
      </div>

      {/* Mobil User Info */}
      <div className="flex items-center justify-between border-t border-gray-200/70 px-4 py-3 dark:border-gray-800/70 lg:hidden">
        <div className="flex items-center gap-3">
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
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="gap-2 text-gray-500 hover:text-accent"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
