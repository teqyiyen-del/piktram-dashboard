<<<<<<< HEAD
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
=======
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { AdminPanel } from '@/components/admin/admin-panel'
import { AccessDenied } from '@/components/admin/access-denied'
import { normalizeStatus } from '@/lib/task-status'
import { TaskStatus, Task, Project, Goal } from '@/lib/types'

export default async function AdminPage() {
>>>>>>> codex-restore-ux
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
<<<<<<< HEAD
    redirect('/auth/login')
=======
    redirect('/login')
>>>>>>> codex-restore-ux
  }

  const { data: profile } = await supabase
    .from('profiles')
<<<<<<< HEAD
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/anasayfa')
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
=======
    .select('role, full_name')
    .eq('id', session.user.id)
    .single()

  const role = (profile?.role as 'admin' | 'user' | null) ?? 'user'
  const displayName =
    profile?.full_name ??
    (session.user.user_metadata?.full_name as string | undefined) ??
    session.user.email ??
    'Kullanıcı'

  if (role !== 'admin') {
    return <AccessDenied fullName={displayName} />
  }

  const [tasksResult, projectsResult, goalsResult, revisionsResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, title, description, status, priority, due_date, project_id, user_id, created_at')
      .eq('user_id', session.user.id),
    supabase
      .from('projects')
      .select('id, title, description, progress, due_date, user_id, created_at')
      .eq('user_id', session.user.id),
    supabase
      .from('goals')
      .select('id, title, description, is_completed, user_id, created_at')
      .eq('user_id', session.user.id),
    supabase
      .from('revisions')
      .select('id, task_id, description, created_at, user_id, tasks(title), profiles(full_name, email)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
  ])

  const tasks: Task[] = (tasksResult.data ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: normalizeStatus(task.status as TaskStatus),
    priority: (task.priority as Task['priority']) ?? 'medium',
    due_date: task.due_date,
    project_id: task.project_id,
    user_id: task.user_id,
    created_at: task.created_at
  }))

  const projects: Project[] = (projectsResult.data ?? []).map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    progress: project.progress ?? 0,
    due_date: project.due_date,
    user_id: project.user_id,
    created_at: project.created_at
  }))

  const goals: Goal[] = (goalsResult.data ?? []).map((goal) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    is_completed: goal.is_completed,
    user_id: goal.user_id,
    created_at: goal.created_at
  }))

  const revisions = (revisionsResult.data ?? []).map((revision) => ({
    id: revision.id,
    task_id: revision.task_id,
    description: revision.description,
    created_at: revision.created_at,
    user_id: revision.user_id,
    task_title: (revision.tasks as { title: string } | null)?.title ?? 'Görev',
    author: {
      full_name: (revision.profiles as { full_name: string | null } | null)?.full_name ?? null,
      email: (revision.profiles as { email: string | null } | null)?.email ?? null
    }
  }))

  return <AdminPanel tasks={tasks} projects={projects} goals={goals} revisions={revisions} />
>>>>>>> codex-restore-ux
}
