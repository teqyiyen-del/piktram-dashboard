import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { AgendaClient } from '@/components/agenda/agenda-client'
import type { Event as CalendarEvent } from '@/lib/types'

export default async function AjandaPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const eventsQuery = supabase.from('events').select('*').order('event_date', { ascending: true })

  if (!isAdmin) {
    eventsQuery.eq('user_id', session.user.id)
  }

  const { data: eventsData } = await eventsQuery

  return (
    <AgendaClient initialEvents={(eventsData ?? []) as CalendarEvent[]} hideHeader={false} />
  )
}
