import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { KanbanBoard } from '@/components/tasks/kanban-board'
<<<<<<< HEAD
import { Task } from '@/lib/types'
=======
import { RevisionFeed } from '@/components/tasks/revision-feed'
>>>>>>> codex-restore-ux

export default async function TasksPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

<<<<<<< HEAD
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const tasksQuery = supabase.from('tasks').select('*')
  const projectsQuery = supabase.from('projects').select('id, title')

  if (!isAdmin) {
    tasksQuery.eq('user_id', session.user.id)
    projectsQuery.eq('user_id', session.user.id)
  }

  const { data: tasksData } = await tasksQuery
  const { data: projectsData } = await projectsQuery

  const tasks = (tasksData ?? []) as unknown as Task[]
  const projectOptions = (projectsData ?? []).map((project) => ({ id: project.id, title: project.title }))

  return <KanbanBoard initialTasks={tasks} projects={projectOptions} />
=======
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', session.user.id)

  const { data: projectsData } = await supabase
    .from('projects')
    .select('id, title')
    .eq('user_id', session.user.id)

  const { data: revisionsData } = await supabase
    .from('revisions')
    .select('id, task_id, description, created_at, user_id, tasks(title), profiles(full_name, email)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  const revisions = (revisionsData ?? []).map((revision) => ({
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

  return (
    <div className="space-y-6">
      <KanbanBoard initialTasks={tasksData ?? []} projects={projectsData ?? []} />
      <RevisionFeed initialRevisions={revisions} />
    </div>
  )
>>>>>>> codex-restore-ux
}
