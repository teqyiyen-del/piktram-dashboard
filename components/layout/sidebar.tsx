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
  const navItems =
    role === 'admin'
      ? [...baseNavItems.slice(0, 4), { name: 'Admin Paneli', href: '/admin', icon: ShieldCheck }, baseNavItems[4]]
      : baseNavItems

  return (
    <aside className="relative hidden w-[280px] shrink-0 flex-col border-r border-gray-200/70 bg-gradient-to-b from-white via-white to-[#FFF5F3] px-6 py-8 shadow-[0_24px_40px_-28px_rgba(255,94,74,0.45)] dark:border-gray-800/70 dark:from-[#171717] dark:via-[#171717] dark:to-[#151515] lg:flex">
      <div className="mb-10 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white shadow-brand-sm">
            P
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">Piktram</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Planlarınıza odaklanın</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-surface-dark/70">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Günün özeti</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Takımınızın hedeflerini tek yerden organize edin ve süreci hızlandırın.
          </p>
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
                'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-accent text-white shadow-brand-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-colors',
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-accent/10 group-hover:text-accent dark:bg-gray-800 dark:text-gray-300'
                )}
              >
                <Icon size={18} />
              </span>
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="mt-12 rounded-3xl bg-white/80 p-5 text-sm text-gray-600 shadow-sm backdrop-blur dark:bg-surface-dark/80 dark:text-gray-300">
        <p className="font-semibold text-gray-900 dark:text-white">Pro ipucu</p>
        <p className="mt-1 text-xs leading-relaxed">
          Görevlerinizdeki dosya eklerini yükleyerek tüm kaynakları tek panelde toplayın.
        </p>
      </div>
    </aside>
  )
}
