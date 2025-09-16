'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
<<<<<<< HEAD
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
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

type SidebarProps = {
  role?: 'admin' | 'user'
  open: boolean
  onClose: () => void
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
  { name: 'Toplantı Planlama', href: '/toplanti-planlama', icon: CalendarClock }
]

export default function Sidebar({ role = 'user', open, onClose }: SidebarProps) {
  const pathname = usePathname()
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
  )

  return (
    <>
      <aside className="relative hidden w-[280px] shrink-0 flex-col border-r border-gray-200/70 bg-gradient-to-b from-white via-white to-[#FFF5F3] px-6 py-8 shadow-[0_24px_40px_-28px_rgba(255,94,74,0.45)] transition-colors duration-300 dark:border-gray-800/70 dark:from-[#171717] dark:via-[#171717] dark:to-[#151515] lg:flex">
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
          <div className="rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur transition-colors duration-300 dark:bg-surface-dark/70">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Navigasyon</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tüm bölümler arasında hızlıca geçiş yapmak için menüyü kullanın.
            </p>
          </div>
        </div>
        {renderNav()}
        <div className="mt-12 rounded-3xl bg-white/80 p-5 text-sm text-gray-600 shadow-sm backdrop-blur transition-colors duration-300 dark:bg-surface-dark/80 dark:text-gray-300">
          <p className="font-semibold text-gray-900 dark:text-white">Pro ipucu</p>
          <p className="mt-1 text-xs leading-relaxed">
            Panonuzu kişiselleştirerek ekibinizin günlük odağını güçlendirebilirsiniz.
          </p>
        </div>
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-40 flex lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <div
          className={cn('absolute inset-0 bg-gray-900/50 transition-opacity', open ? 'opacity-100' : 'opacity-0')}
          aria-hidden="true"
          onClick={onClose}
        />
        <aside
          className={cn(
            'relative flex h-full w-72 flex-col border-r border-gray-200/70 bg-gradient-to-b from-white via-white to-[#FFF5F3] px-6 py-8 shadow-[0_24px_40px_-28px_rgba(255,94,74,0.45)] transition-transform duration-300 dark:border-gray-800/70 dark:from-[#171717] dark:via-[#171717] dark:to-[#151515]',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-500 shadow-sm transition hover:text-accent dark:bg-surface-dark/80 dark:text-gray-300"
            aria-label="Menüyü kapat"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mb-10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-lg font-bold text-white shadow-brand-sm">
                P
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">Piktram</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Kontrol merkeziniz</p>
              </div>
            </div>
          </div>
          {renderNav(onClose)}
        </aside>
      </div>
    </>
=======
import { LayoutDashboard, FolderKanban, ListTodo, CalendarDays, Settings, Target, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  name: string
  href: string
  icon: typeof LayoutDashboard
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { name: 'Gösterge Paneli', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projeler', href: '/projects', icon: FolderKanban },
  { name: 'Görevler', href: '/tasks', icon: ListTodo },
  { name: 'Hedefler', href: '/goals', icon: Target },
  { name: 'Takvim', href: '/calendar', icon: CalendarDays },
  { name: 'Ayarlar', href: '/settings', icon: Settings },
  { name: 'Yönetim', href: '/admin', icon: ShieldCheck, adminOnly: true }
]

interface SidebarProps {
  role: 'admin' | 'user'
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white px-4 py-6">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white text-lg font-bold">P</div>
        <div>
          <p className="text-lg font-semibold text-gray-900">Piktram</p>
          <p className="text-xs text-gray-500">Üretkenlik merkezi</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navItems
          .filter((item) => (item.adminOnly ? role === 'admin' : true))
          .map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-accent/10 text-accent' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="mt-8 rounded-xl bg-gray-100 p-4 text-sm text-gray-600">
        <p className="font-semibold text-gray-900">İpucu</p>
        <p>Piktram ile ekip işlerinizi tek yerden yönetin.</p>
      </div>
    </aside>
>>>>>>> codex-restore-ux
  )
}
