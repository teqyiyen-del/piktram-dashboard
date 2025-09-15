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

  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', session.user.id)

  const { data: projectsData } = await supabase
    .from('projects')
    .select('id, title')
    .eq('user_id', session.user.id)

  return <KanbanBoard initialTasks={tasksData ?? []} projects={projectsData ?? []} />
}
