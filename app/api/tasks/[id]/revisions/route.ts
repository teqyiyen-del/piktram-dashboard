import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('revisions')
    .select('id, description, created_at, user_id, comment_id, profiles(full_name, email)')
    .eq('task_id', params.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
      email: (revision.profiles as { email: string | null } | null)?.email ?? null
    }
  }))

  return NextResponse.json(revisions)
}
