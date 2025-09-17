import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { KanbanBoard } from '@/components/tasks/kanban-board'
import { RevisionFeed } from '@/components/tasks/revision-feed'
import { Task } from '@/lib/types'

export default async function TasksPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // --- Queries ---
  let tasksQuery = supabase.from('tasks').select('*')
  let projectsQuery = supabase.from('projects').select('id, title')
  let revisionsQuery = supabase
    .from('revisions')
    .select('id, task_id, description, created_at, user_id, tasks(title), profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    tasksQuery = tasksQuery.eq('user_id', session.user.id)
    projectsQuery = projectsQuery.eq('user_id', session.user.id)
    revisionsQuery = revisionsQuery.eq('user_id', session.user.id)
  }

  const [tasksRes, projectsRes, revisionsRes] = await Promise.all([
    tasksQuery,
    projectsQuery,
    revisionsQuery
  ])

  const tasks = (tasksRes.data ?? []) as Task[]
  const projects = (projectsRes.data ?? []).map((p) => ({ id: p.id, title: p.title }))

  const revisions = (revisionsRes.data ?? []).map((rev) => ({
    id: rev.id,
    task_id: rev.task_id,
    description: rev.description,
    created_at: rev.created_at,
    user_id: rev.user_id,
    task_title: (rev.tasks as { title: string } | null)?.title ?? 'Görev',
    author: {
      full_name: (rev.profiles as { full_name: string | null } | null)?.full_name ?? null,
      email: (rev.profiles as { email: string | null } | null)?.email ?? null
    }
  }))

  return (
    <div className="space-y-6">
      <KanbanBoard initialTasks={tasks} projects={projects} />
      <RevisionFeed initialRevisions={revisions} />
    </div>
  )
}
