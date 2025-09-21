import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import AdminSidebar from '@/components/admin/admin-sidebar'
import { CustomerProvider } from '@/components/providers/customer-provider'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("❌ Session error:", sessionError)
  }

  if (!session) {
    console.warn("⚠️ Session yok, login sayfasına yönlendiriliyor.")
    redirect('/auth/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', session.user.id)
    .maybeSingle()

  if (profileError) {
    console.error("❌ Profile query error:", profileError.message)
  }

  console.log("🔑 Session user id:", session.user.id)
  console.log("👤 Profile found:", profile)

  const role = (profile?.role as 'admin' | 'user' | null) ?? 'user'

  // ✅ Admin değilse anasayfaya at
  if (role !== 'admin') {
    console.warn("⚠️ Kullanıcı admin değil, anasayfaya yönlendiriliyor.")
    redirect('/anasayfa')
  }

  return (
    <CustomerProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <AdminSidebar />

        {/* İçerik Alanı */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </CustomerProvider>
  )
}
