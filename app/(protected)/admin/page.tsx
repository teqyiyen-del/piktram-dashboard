import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/admin-dashboard'
import { Database } from '@/lib/supabase-types'

const PAGE_SIZE = 6

type AdminPageProps = {
  searchParams?: { projectsPage?: string; tasksPage?: string }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const projectsPage = Math.max(1, Number(searchParams?.projectsPage ?? '1'))
  const tasksPage = Math.max(1, Number(searchParams?.tasksPage ?? '1'))

  const projectsRangeStart = (projectsPage - 1) * PAGE_SIZE
  const tasksRangeStart = (tasksPage - 1) * PAGE_SIZE

  const [usersResponse, projectsResponse, tasksResponse, userCountResponse] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('projects')
      .select('id, title, description, progress, due_date, user_id, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(projectsRangeStart, projectsRangeStart + PAGE_SIZE - 1),
    supabase
      .from('tasks')
      .select('id, title, status, priority, due_date, user_id, attachment_url, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(tasksRangeStart, tasksRangeStart + PAGE_SIZE - 1),
    supabase.from('profiles').select('id', { count: 'exact', head: true })
  ])

  const users = usersResponse.data ?? []
  const projects = projectsResponse.data ?? []
  const tasks = tasksResponse.data ?? []
  const projectCount = projectsResponse.count ?? 0
  const taskCount = tasksResponse.count ?? 0
  const userCount = userCountResponse.count ?? users.length

  const ownerMap = Object.fromEntries(users.map((user) => [user.id, { full_name: user.full_name, email: user.email }]))

  return (
    <AdminDashboard
      users={users}
      projects={projects}
      tasks={tasks}
      ownerMap={ownerMap}
      stats={{ users: userCount, projects: projectCount, tasks: taskCount }}
      pagination={{
        projectsPage,
        projectsTotalPages: Math.max(1, Math.ceil(projectCount / PAGE_SIZE)),
        tasksPage,
        tasksTotalPages: Math.max(1, Math.ceil(taskCount / PAGE_SIZE))
      }}
    />
  )
}
