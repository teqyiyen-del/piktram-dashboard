'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AccessDeniedProps {
  fullName: string
}

export function AccessDenied({ fullName }: AccessDeniedProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-red-100 bg-red-50 p-8 text-red-700 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide">Erişim Engellendi</p>
        <h2 className="mt-2 text-2xl font-semibold text-red-800">Merhaba {fullName}, bu alana erişimin yok.</h2>
        <p className="mt-3 text-sm text-red-600">
          Yönetim paneli sadece yönetici yetkisine sahip kullanıcılarla sınırlıdır. Görev ve projelerini görüntülemek için
          gösterge paneline dönebilirsin.
        </p>
      </div>
      <Link
        href="/dashboard"
        className={cn(
          'inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90'
        )}
      >
        Gösterge Paneline Dön
      </Link>
    </div>
  )
}
