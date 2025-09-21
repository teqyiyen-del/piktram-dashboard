import './globals.css'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/supabase-types'
import SupabaseProvider from '@/components/providers/supabase-provider'
import RootClient from '@/components/providers/root-client'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Piktram Dashboard',
  description: 'Müşteri yönetim paneli',
}

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // login yoksa redirect
    return (
      <html lang="tr" className={inter.className}>
        <body>
          <p>Oturum bulunamadı, giriş yapmanız gerekiyor.</p>
        </body>
      </html>
    )
  }

  // tema bilgisi
  let initialTheme: 'light' | 'dark' = 'light'

  const { data: profile } = await supabase
    .from('profiles')
    .select('theme')
    .eq('id', session.user.id)
    .maybeSingle()

  if (profile?.theme && (profile.theme === 'light' || profile.theme === 'dark')) {
    initialTheme = profile.theme
  }

  return (
    <html lang="tr" className={inter.className} suppressHydrationWarning>
      <body className="bg-muted dark:bg-background-dark">
        <SupabaseProvider session={session}>
          <RootClient initialTheme={initialTheme}>{children}</RootClient>
        </SupabaseProvider>
      </body>
    </html>
  )
}
