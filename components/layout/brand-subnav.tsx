'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const subNavigation = [
  { label: 'Abonelik Yönetimi', href: '/marka-bilgilerim/abonelik-yonetimi' },
  { label: 'Bilgilerim', href: '/marka-bilgilerim/bilgilerim' }
]

export function BrandSubnav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-4 rounded-2xl bg-white p-2 shadow-sm dark:bg-surface-dark">
      {subNavigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 rounded-xl px-8 py-3 text-center text-sm font-semibold transition 
              ${isActive
                ? 'bg-accent text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
