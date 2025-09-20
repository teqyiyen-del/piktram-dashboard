import './globals.css'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import SupabaseProvider from '@/components/providers/supabase-provider'
import RootClient from '@/components/providers/root-client'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Piktram Dashboard',
  description: 'Müşteri yönetim paneli',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let initialTheme: 'light' | 'dark' = 'light'

  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('theme')
      .eq('id', session.user.id)
      .single()

    if (profile?.theme) {
      initialTheme = profile.theme as 'light' | 'dark'
    }
  }

  return (
    <html lang="tr" className={inter.className}>
      <body className="bg-muted dark:bg-background-dark">
        <SupabaseProvider session={session}>
          <RootClient initialTheme={initialTheme}>
            {children}
          </RootClient>
        </SupabaseProvider>
      </body>
    </html>
  )
}
