'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  CalendarDays,
  FolderKanban,
  GitBranch,
  Home,
  Megaphone,
  ShieldCheck,
  Target,
  Building2,
  X,
  Settings2
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SidebarProps = {
  role?: 'admin' | 'user'
}

const baseNavigation = [
  { name: 'Anasayfa', href: '/anasayfa', icon: Home },
  { name: 'Duyurular', href: '/duyurular', icon: Megaphone },
  { name: 'Projeler', href: '/projeler', icon: FolderKanban },
  { name: 'İş Akışı', href: '/is-akisi', icon: GitBranch },
  { name: 'Ajanda', href: '/ajanda', icon: CalendarDays },
  { name: 'Hedefler', href: '/hedefler', icon: Target },
  { name: 'Marka Bilgilerim', href: '/marka-bilgilerim', icon: Building2 },
  { name: 'İçerik Kütüphanesi', href: '/icerik-kutuphanesi', icon: BookOpen },
  { name: 'Raporlar', href: '/raporlar', icon: BarChart3 },
  { name: 'Toplantı Planlama', href: '/toplanti-planlama', icon: CalendarClock },
  { name: 'Ayarlar', href: '/ayarlar', icon: Settings2 }
]

export default function Sidebar({ role = 'user' }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navigation =
    role === 'admin'
      ? [...baseNavigation, { name: 'Admin Paneli', href: '/admin', icon: ShieldCheck }]
      : baseNavigation

  const renderNav = (onItemClick?: () => void) => (
    <nav className="flex flex-1 flex-col gap-1">
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-accent text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
            )}
          >
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                isActive
                  ? 'bg-white/20 text-white'
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
  )

  return (
    <>
      {/* Desktop Sidebar (her zaman en üst katman, Topbar’ın üstünde) */}
      <aside className="fixed top-0 left-0 z-50 hidden h-screen w-[280px] shrink-0 flex-col border-r border-gray-200/70 bg-gradient-to-b from-white via-white to-[#FFF5F3] px-6 py-6 shadow-xl transition-colors duration-300 dark:border-gray-800/70 dark:from-[#171717] dark:via-[#171717] dark:to-[#151515] lg:flex">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white shadow-sm">
            P
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Piktram</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Planlarınıza odaklanın</p>
          </div>
        </div>

        {renderNav()}

        {/* Footer */}
        <div className="mt-auto rounded-xl bg-white/80 p-4 text-xs text-gray-600 shadow-sm backdrop-blur dark:bg-surface-dark/80 dark:text-gray-300">
          <p className="font-semibold text-gray-900 dark:text-white">Pro ipucu</p>
          <p className="mt-1 leading-relaxed">
            Panonuzu kişiselleştirerek ekibinizin odağını artırabilirsiniz.
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className={cn('fixed inset-0 z-50 flex lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div
          className={cn('absolute inset-0 bg-gray-900/50 transition-opacity', open ? 'opacity-100' : 'opacity-0')}
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            'relative flex h-full w-72 flex-col border-r border-gray-200/70 bg-gradient-to-b from-white via-white to-[#FFF5F3] px-6 py-8 shadow-lg transition-transform duration-300 dark:border-gray-800/70 dark:from-[#171717] dark:via-[#171717] dark:to-[#151515]',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-500 shadow-sm transition hover:text-accent dark:bg-surface-dark/80 dark:text-gray-300"
            aria-label="Menüyü kapat"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white shadow-sm">
              P
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Piktram</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Kontrol merkeziniz</p>
            </div>
          </div>

          {renderNav(() => setOpen(false))}
        </aside>
      </div>
    </>
  )
}
