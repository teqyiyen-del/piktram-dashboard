import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { KanbanBoard } from '@/components/tasks/kanban-board'

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

  const tasksQuery = supabase.from('tasks').select('*')
  const projectsQuery = supabase.from('projects').select('id, title')

  if (!isAdmin) {
    tasksQuery.eq('user_id', session.user.id)
    projectsQuery.eq('user_id', session.user.id)
  }

  const { data: tasksData } = await tasksQuery
  const { data: projectsData } = await projectsQuery

  return <KanbanBoard initialTasks={tasksData ?? []} projects={projectsData ?? []} />
}
