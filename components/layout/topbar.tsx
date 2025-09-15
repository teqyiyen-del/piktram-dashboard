'use client'

import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, Search } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  fullName: string | null
  email: string
}

export default function Topbar({ fullName, email }: TopbarProps) {
  const supabase = useSupabaseClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-surface px-8 py-4 transition-colors duration-300 dark:border-gray-800 dark:bg-surface-dark">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-accent dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Ara..."
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full bg-gray-100 p-2 text-gray-500 transition hover:text-accent dark:bg-gray-800 dark:text-gray-300 dark:hover:text-accent">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 block h-2 w-2 rounded-full bg-accent"></span>
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
            {getInitials(fullName)}
          </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900 dark:text-white">{fullName ?? 'Takım Üyesi'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={handleLogout}
          className="gap-2 dark:border dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          <LogOut className="h-4 w-4" /> Çıkış Yap
        </Button>
      </div>
    </header>
  )
}
