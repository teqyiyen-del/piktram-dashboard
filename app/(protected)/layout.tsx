import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import ClientLayoutWrapper from '@/components/layout/sidebar-wrapper'

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
    <ClientLayoutWrapper
      user={{
        full_name: fullName,
        email,
        role,
      }}
    >
      {/* Sidebar + Topbar offsetleri sabit */}
      <main className="min-h-screen w-full lg:pl-[280px] pt-16">
        <div
          className="
            container mx-auto w-full
            px-4 sm:px-6 lg:px-8
            max-w-screen-2xl
            3xl:max-w-screen-3xl
            4xl:max-w-screen-4xl
            5xl:max-w-screen-5xl
          "
        >
          {children}
        </div>
      </main>
    </ClientLayoutWrapper>
  )
}
