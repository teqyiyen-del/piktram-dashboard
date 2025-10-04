import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { AgendaClient } from '@/components/agenda/agenda-client'
import type { Event as CalendarEvent } from '@/lib/types'

export default async function AjandaPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  // Sadece onaylanmış görevleri al
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, description, due_date, user_id, status')
    .eq('status', 'approved')
    .order('due_date', { ascending: true })

  // Taskleri CalendarEvent formatına map’le
  const eventsData: CalendarEvent[] = (tasks ?? []).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    event_date: task.due_date,
    event_type: 'task',
    related: task.status,
  }))

  return (
    <AgendaClient
      initialEvents={eventsData}
    />
  )
}
