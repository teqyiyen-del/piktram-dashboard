import './globals.css'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import SupabaseProvider from '@/components/providers/supabase-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Piktram - Proje ve Görev Yönetimi',
  description: 'Piktram ile ekiplerinizin projelerini, görevlerini ve iletişimini tek bir yerden yönetin.'
}

type RootLayoutProps = {
  children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  let initialTheme: 'light' | 'dark' = 'light'

  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('theme')
      .eq('id', session.user.id)
      .single()

    if (profile?.theme === 'dark') {
      initialTheme = 'dark'
    }
  }

  return (
    <html lang="tr">
      <body className={`${inter.className} bg-muted dark:bg-background-dark`}>
        <SupabaseProvider session={session}>
          <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
