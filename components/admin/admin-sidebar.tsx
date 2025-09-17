// components/admin/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Target,
  RefreshCcw,
  FileText,
  Megaphone,
} from 'lucide-react'

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/clients', label: 'Müşteriler', icon: Users },
  { href: '/admin/projects', label: 'Projeler', icon: FolderKanban },
  { href: '/admin/tasks', label: 'Görevler', icon: CheckSquare },
  { href: '/admin/goals', label: 'Hedefler', icon: Target },
  { href: '/admin/revisions', label: 'Revizyonlar', icon: RefreshCcw },
  { href: '/admin/invoices', label: 'Faturalar', icon: FileText },
  { href: '/admin/announcements', label: 'Duyurular', icon: Megaphone },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Logo / Header */}
      <div className="flex h-16 items-center px-6 text-xl font-bold text-accent">
        Piktram Admin
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {adminLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
        © {new Date().getFullYear()} Piktram
      </div>
    </aside>
  )
}
