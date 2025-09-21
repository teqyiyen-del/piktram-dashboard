'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  ChevronDown,
  Check
} from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
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
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

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
      try {
        const res = await fetch('/api/clients')
        if (!res.ok) throw new Error('API hatası')
        const data = await res.json()
        setClients(data)
      } catch (err) {
        console.error('❌ Müşteri listesi hatası:', err)
      }
    }
    fetchClients()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('selectedClient')
    if (saved) setSelectedCustomer(saved)
  }, [setSelectedCustomer])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const displayName = (c: Client | undefined) => {
    if (!c) return 'Tüm Müşteriler'
    return c.company || c.full_name || c.email || 'Müşteri'
  }

  const activeCustomer = clients.find((c) => c.id === selectedCustomer)

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname === href || pathname.startsWith(href + '/')
  }

  function handleSelectClient(clientId: string | null) {
    if (clientId) {
      setSelectedCustomer(clientId)
      localStorage.setItem('selectedClient', clientId)
      router.push(`${pathname}?client=${clientId}`)
    } else {
      setSelectedCustomer(null)
      localStorage.removeItem('selectedClient')
      router.push(pathname)
    }
    setIsOpen(false)
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200/50 bg-gradient-to-b from-white/95 to-gray-50/90 backdrop-blur-xl dark:from-gray-950/90 dark:to-gray-900/80 dark:border-gray-800/50">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 text-xl font-bold tracking-tight text-accent">
        Piktram Panel
      </div>

      {/* Global müşteri seçici */}
      <div className="px-4 mb-6 relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
        >
          <span className="flex items-center gap-2 truncate">
            <UserCircle2 className="h-4 w-4 shrink-0 text-accent" />
            {selectedCustomer ? displayName(activeCustomer) : 'Tüm Müşteriler'}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-2 left-0 right-0 rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
            <button
              onClick={() => handleSelectClient(null)}
              className={`flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                selectedCustomer === null
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Tüm Müşteriler
              {selectedCustomer === null && <Check className="h-4 w-4" />}
            </button>

            {clients.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">Hiç müşteri bulunamadı</div>
            )}
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectClient(c.id)}
                className={`flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedCustomer === c.id
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {displayName(c)}
                {selectedCustomer === c.id && <Check className="h-4 w-4" />}
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
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
              isActive(href)
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <Icon
              className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                isActive(href) ? 'text-white' : ''
              }`}
            />
            {label}
          </Link>
        ))}

        {/* Settings */}
        <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-800/50">
          <Link
            href={settingsLink.href}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
              isActive(settingsLink.href)
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            <Settings
              className={`h-4 w-4 transition-transform group-hover:rotate-12 ${
                isActive(settingsLink.href) ? 'text-white' : ''
              }`}
            />
            {settingsLink.label}
          </Link>
        </div>
      </nav>

      <div className="border-t border-gray-200/50 px-4 py-3 text-xs text-gray-500 dark:border-gray-800/50 dark:text-gray-400">
        © {new Date().getFullYear()}{' '}
        <span className="text-accent font-semibold">Piktram</span>
      </div>
    </aside>
  )
}
