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
  Settings,
  BookOpen,
  UserCircle2,
  ChevronDown
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { useCustomer } from '@/components/providers/customer-provider'

type Client = {
  id: string
  full_name: string | null
  email: string | null
  company: string | null
}

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/clients', label: 'Müşteriler', icon: Users },
  { href: '/admin/projects', label: 'Projeler', icon: FolderKanban },
  { href: '/admin/tasks', label: 'Görevler', icon: CheckSquare },
  { href: '/admin/goals', label: 'Hedefler', icon: Target },
  { href: '/admin/revisions', label: 'Revizyonlar', icon: RefreshCcw },
  { href: '/admin/invoices', label: 'Faturalar', icon: FileText },
  { href: '/admin/announcements', label: 'Duyurular', icon: Megaphone },
  { href: '/admin/content-library', label: 'İçerik Kütüphanesi', icon: BookOpen }
]

const settingsLink = { href: '/admin/settings', label: 'Ayarlar', icon: Settings }

export default function AdminSidebar() {
  const pathname = usePathname()
  const supabase = createClientComponentClient<Database>()

  // ✅ Provider yoksa fallback ekle
  let customerCtx
  try {
    customerCtx = useCustomer()
  } catch {
    customerCtx = { selectedCustomer: null, setSelectedCustomer: () => {} }
  }

  const { selectedCustomer, setSelectedCustomer } = customerCtx
  const [clients, setClients] = useState<Client[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchClients = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, company')
      setClients(data || [])
    }
    fetchClients()
  }, [supabase])

  const activeCustomer = clients.find((c) => c.id === selectedCustomer)

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 text-lg font-bold tracking-tight text-accent">
        Piktram Admin
      </div>

      {/* Global müşteri seçici */}
      <div className="px-3 mb-4 relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          <span className="flex items-center gap-2 truncate">
            <UserCircle2 className="h-4 w-4 shrink-0" />
            {activeCustomer
              ? activeCustomer.full_name || activeCustomer.email
              : selectedCustomer === null
              ? 'Tüm Müşteriler'
              : 'Müşteri Seç'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
            {/* Tüm müşteriler seçeneği */}
            <button
              onClick={() => {
                setSelectedCustomer(null)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                selectedCustomer === null ? 'bg-accent/10 text-accent' : ''
              }`}
            >
              🌍 Tüm Müşteriler
            </button>

            {/* Tek tek müşteriler */}
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCustomer(c.id)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  selectedCustomer === c.id ? 'bg-accent/10 text-accent' : ''
                }`}
              >
                {c.full_name ?? c.email} {c.company ? `- ${c.company}` : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {adminLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(href)
                ? 'bg-accent/10 text-accent'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}

        {/* Settings */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link
            href={settingsLink.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(settingsLink.href)
                ? 'bg-accent/10 text-accent'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <Settings className="h-4 w-4" />
            {settingsLink.label}
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
        © {new Date().getFullYear()} Piktram
      </div>
    </aside>
  )
}
