import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  let query = supabase
    .from('revisions')
    .select('id, description, created_at, user_id, comment_id, profiles(full_name, email)')
    .eq('task_id', params.id)
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
    task_id: params.id,
    user_id: revision.user_id,
    comment_id: revision.comment_id,
    description: revision.description,
    created_at: revision.created_at,
    author: {
      full_name: (revision.profiles as { full_name: string | null } | null)?.full_name ?? null,
      email: (revision.profiles as { email: string | null } | null)?.email ?? null,
    },
  }))

  return NextResponse.json(revisions)
}
