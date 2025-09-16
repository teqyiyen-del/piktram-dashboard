'use client'

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
<<<<<<< HEAD
import { LogOut, Menu, Search } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
=======
import { Bell, LogOut, Search } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
>>>>>>> codex-restore-ux

interface TopbarProps {
  fullName: string | null
  email: string
<<<<<<< HEAD
  role: 'admin' | 'user'
  onMenuClick: () => void
}

export default function Topbar({ fullName, email, onMenuClick }: TopbarProps) {
=======
}

export default function Topbar({ fullName, email }: TopbarProps) {
>>>>>>> codex-restore-ux
  const supabase = useSupabaseClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  return (
<<<<<<< HEAD
    <header className="border-b border-gray-200/70 bg-white/70 px-6 py-5 shadow-sm backdrop-blur transition-colors duration-300 dark:border-gray-800/70 dark:bg-surface-dark/80">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:text-accent dark:border-gray-700 dark:bg-surface-dark dark:text-gray-300 dark:hover:text-accent lg:hidden"
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative w-full max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-full border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Ara..."
            />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <NotificationDropdown />
          <div className="hidden min-w-[200px] items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-900 lg:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
              {getInitials(fullName)}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-gray-900 dark:text-white">{fullName ?? 'Takım Üyesi'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleLogout} className="hidden gap-2 lg:inline-flex">
            <LogOut className="h-4 w-4" /> Çıkış Yap
          </Button>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
          {getInitials(fullName)}
        </div>
        <div className="text-sm">
          <p className="font-semibold text-gray-900 dark:text-white">{fullName ?? 'Takım Üyesi'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        <span className="pill whitespace-nowrap border border-transparent text-gray-500">
          Menüyü kullanarak bölümler arasında gezinin
        </span>
      </nav>
=======
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-accent" placeholder="Ara..." />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full bg-gray-100 p-2 text-gray-500 transition hover:text-accent">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 block h-2 w-2 rounded-full bg-accent"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
            {getInitials(fullName)}
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">{fullName ?? 'Takım Üyesi'}</p>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" /> Çıkış Yap
        </Button>
      </div>
>>>>>>> codex-restore-ux
    </header>
  )
}
