// app/(admin)/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Database } from '@/lib/supabase-types'

export default async function AdminHomePage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/') // admin değilse ana sayfaya at
  }

  // küçük sayılar: toplam user, proje, task
  const [usersRes, projectsRes, tasksRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('tasks').select('id', { count: 'exact', head: true })
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600">Hoş geldin {profile.full_name ?? 'Admin'} 👋</p>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Toplam Kullanıcı" value={usersRes.count ?? 0} />
        <StatCard title="Toplam Proje" value={projectsRes.count ?? 0} />
        <StatCard title="Toplam Görev" value={tasksRes.count ?? 0} />
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  )
}
