import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import AdminSidebar from '@/components/admin/admin-sidebar'

export default async function AdminLayout({ children }: { children: ReactNode }) {
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

  const role = (profile?.role as 'admin' | 'user' | null) ?? 'user'

  // ✅ Admin değilse anasayfaya at
  if (role !== 'admin') redirect('/anasayfa')

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* İçerik Alanı */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
