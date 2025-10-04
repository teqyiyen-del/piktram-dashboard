'use client'

import { ReactNode, useEffect, useState } from 'react'
import { Inter } from 'next/font/google'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/supabase-types'
import SupabaseProvider from '@/components/providers/supabase-provider'
import RootClient from '@/components/providers/root-client'
import Sidebar from '@/components/layout/sidebar'
import Topbar from '@/components/layout/topbar'

const inter = Inter({ subsets: ['latin'] })

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient<Database>()
  const [user, setUser] = useState<{ full_name: string; email: string; role: string } | null>(null)
  const [initialTheme, setInitialTheme] = useState<'light' | 'dark'>('light')
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobil sidebar state

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = '/auth/login'
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, role, theme')
        .eq('id', session.user.id)
        .maybeSingle()

      const metadata = session.user.user_metadata as Record<string, string | undefined>
      const role = (profile?.role as 'admin' | 'user' | null) ?? 'user'
      const full_name =
        profile?.full_name ?? metadata?.full_name ?? session.user.email ?? 'Kullanıcı'
      const email = profile?.email ?? session.user.email ?? ''

      setUser({ full_name, email, role })

      if (profile?.theme && (profile.theme === 'light' || profile.theme === 'dark')) {
        setInitialTheme(profile.theme)
      }
    }

    loadUser()
  }, [supabase])

  if (!user) {
    return <p className="p-6">Yükleniyor...</p>
  }

  return (
    <SupabaseProvider>
      <RootClient initialTheme={initialTheme}>
        {/* Topbar */}
        <Topbar user={user} onMenuClick={() => setSidebarOpen(true)} />

        <div className={`${inter.className} flex`}>
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-[280px] shrink-0">
            <Sidebar role={user.role as 'admin' | 'user'} />
          </div>

          {/* Mobile sidebar */}
          <Sidebar
            role={user.role as 'admin' | 'user'}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* İçerik */}
          <main className="flex-1 pt-16 px-4 lg:px-8 bg-muted dark:bg-background-dark">
            {children}
          </main>
        </div>
      </RootClient>
    </SupabaseProvider>
  )
}
