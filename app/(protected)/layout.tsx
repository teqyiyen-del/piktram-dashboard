import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase-types'
import ClientLayoutWrapper from '@/components/layout/sidebar-wrapper'
import ClientProvider from '@/components/providers/client-provider'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', session.user.id)
    .single()

  const metadata = session.user.user_metadata as Record<string, string | undefined>
  const role = (profile?.role as 'admin' | 'user' | null) ?? 'user'
  const fullName = profile?.full_name ?? metadata?.full_name ?? session.user.email!
  const email = profile?.email ?? session.user.email!

  return (
    <ClientProvider>
      <ClientLayoutWrapper
        user={{
          full_name: fullName,
          email,
          role,
        }}
      >
        <main className="min-h-screen w-full min-w-0 overflow-x-hidden lg:pl-[280px] pt-16">
          <div className="w-full max-w-full min-w-0 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </ClientLayoutWrapper>
    </ClientProvider>
  )
}
