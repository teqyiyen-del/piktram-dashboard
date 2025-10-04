// app/(admin)/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/admin-dashboard'
import type { Database } from '@/lib/supabase-types'

export default async function AdminPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // ---- Session ----
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error('Session error:', sessionError)
  }
  if (!session) redirect('/login')

  // ---- Current user ----
  const { data: currentUser, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', session.user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Profile fetch error:', profileError)
  }

  if (!currentUser) {
    console.error('No profile row found for user id:', session.user.id)
    redirect('/login')
  }

  if (currentUser.role !== 'admin') {
    console.warn('Access denied: not admin', currentUser)
    redirect('/')
  }

  // ---- Queries ----
  const usersQ = supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at, company')
  const projectsQ = supabase.from('projects').select('*')
  const tasksQ = supabase.from('tasks').select('*')
  const goalsQ = supabase.from('goals').select('*')
  const revisionsQ = supabase.from('revisions').select('*')
  const invoicesQ = supabase.from('invoices').select('*')
  const announcementsQ = supabase.from('announcements').select('*')

  // ---- Parallel fetch ----
  const [
    { data: usersData, error: usersError },
    { data: projectsData, error: projectsError },
    { data: tasksData, error: tasksError },
    { data: goalsData, error: goalsError },
    { data: revisionsData, error: revisionsError },
    { data: invoicesData, error: invoicesError },
    { data: announcementsData, error: announcementsError },
  ] = await Promise.all([
    usersQ,
    projectsQ,
    tasksQ,
    goalsQ,
    revisionsQ,
    invoicesQ,
    announcementsQ,
  ])

  // ---- Error logs ----
  if (usersError) console.error('Users error:', usersError)
  if (projectsError) console.error('Projects error:', projectsError)
  if (tasksError) console.error('Tasks error:', tasksError)
  if (goalsError) console.error('Goals error:', goalsError)
  if (revisionsError) console.error('Revisions error:', revisionsError)
  if (invoicesError) console.error('Invoices error:', invoicesError)
  if (announcementsError) console.error('Announcements error:', announcementsError)

  return (
    <div className="p-6">
      <AdminDashboard
        currentUser={currentUser}
        users={usersData ?? []}
        projects={projectsData ?? []}
        tasks={tasksData ?? []}
        goals={goalsData ?? []}
        invoices={invoicesData ?? []}
        announcements={announcementsData ?? []}
      />
    </div>
  )
}
