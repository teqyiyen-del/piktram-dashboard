import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { CalendarClient } from '@/components/calendar/calendar-client'

export default async function CalendarPage() {
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

  // tasks & projects query
  let tasksQuery = supabase.from('tasks').select('*')
  let projectsQuery = supabase.from('projects').select('id, title')

  if (!isAdmin) {
    tasksQuery = tasksQuery.eq('user_id', session.user.id)
    projectsQuery = projectsQuery.eq('user_id', session.user.id)
  }

  const [{ data: tasksData }, { data: projectsData }] = await Promise.all([
    tasksQuery,
    projectsQuery
  ])

  return <CalendarClient initialTasks={tasksData ?? []} projects={projectsData ?? []} />
}
