// app/(admin)/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/admin-dashboard'
import type { Database } from '@/lib/supabase-types'

export default async function AdminPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Session kontrolü
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Kullanıcı bilgisi (mevcut admin)
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle()

  if (!currentUser) {
    redirect('/login')
  }
  if (currentUser.role !== 'admin') {
    redirect('/')
  }

  // --- Tüm verileri paralel çek ---
  const [
    { data: usersData },
    { data: projectsData },
    { data: tasksData },
    { data: goalsData },
    { data: revisionsData },
    { data: invoicesData },
  ] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('projects').select('*'),
    supabase.from('tasks').select('*'),
    supabase.from('goals').select('*'),
    supabase.from('revisions').select('*'),
    supabase.from('invoices').select('*'),
  ])

  const users = usersData ?? []
  const projects = projectsData ?? []
  const tasks = tasksData ?? []
  const goals = goalsData ?? []
  const revisions = revisionsData ?? []
  const invoices = invoicesData ?? []

  // Kullanıcı eşleme (ownerMap)
  const ownerMap = Object.fromEntries(
    users.map((u: any) => [
      u.id,
      { full_name: u.full_name ?? '', email: u.email ?? '' },
    ])
  )

  return (
    <div className="p-6">
      <AdminDashboard
        currentUser={currentUser}
        users={users}
        projects={projects}
        tasks={tasks}
        goals={goals}
        revisions={revisions}
        invoices={invoices}
        ownerMap={ownerMap}
      />
    </div>
  )
}
