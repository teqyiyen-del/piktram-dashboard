import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import DashboardShell from '@/components/layout/dashboard-shell'
import { Database } from '@/lib/supabase-types'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, theme, role')
    .eq('id', session.user.id)
    .single()

  const metadata = session.user.user_metadata as Record<string, string | undefined>

  return (
    <DashboardShell
      user={{
        full_name: profile?.full_name ?? metadata?.full_name ?? session.user.email!,
        email: profile?.email ?? session.user.email!,
        role: (profile?.role as 'admin' | 'user' | null) ?? 'user'
      }}
    >
      {children}
    </DashboardShell>
  )
}
