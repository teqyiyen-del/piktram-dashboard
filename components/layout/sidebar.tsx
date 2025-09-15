'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, ListTodo, CalendarDays, Settings, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type SidebarProps = {
  role: 'admin' | 'user'
}

const baseNavItems = [
  { name: 'Gösterge Paneli', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projeler', href: '/projects', icon: FolderKanban },
  { name: 'Görevler', href: '/tasks', icon: ListTodo },
  { name: 'Takvim', href: '/calendar', icon: CalendarDays },
  { name: 'Ayarlar', href: '/settings', icon: Settings }
]

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const navItems = role === 'admin'
    ? [...baseNavItems.slice(0, 4), { name: 'Admin Paneli', href: '/admin', icon: ShieldCheck }, baseNavItems[4]]
    : baseNavItems

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-surface px-4 py-6 transition-colors duration-300 dark:border-gray-800 dark:bg-surface-dark">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg font-bold text-white">P</div>
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Piktram</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Üretkenlik merkezi</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              )}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="mt-8 rounded-xl bg-gray-100 p-4 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
        <p className="font-semibold text-gray-900 dark:text-white">İpucu</p>
        <p>Piktram ile ekip işlerinizi tek yerden yönetin.</p>
      </div>
    </aside>
  )
}
