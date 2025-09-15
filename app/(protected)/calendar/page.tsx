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

  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', session.user.id)

  const { data: projectsData } = await supabase
    .from('projects')
    .select('id, title')
    .eq('user_id', session.user.id)

  return <CalendarClient initialTasks={tasksData ?? []} projects={projectsData ?? []} />
}
