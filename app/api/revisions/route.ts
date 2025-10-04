import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'

export async function GET() {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  let query = supabase
    .from('revisions')
    .select('id, task_id, description, created_at, user_id, tasks(title), profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error: fetchError } = await query
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const revisions = (data ?? []).map((revision) => ({
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

  return NextResponse.json(revisions)
}
