import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'

// GET: Bildirimleri listele
export async function GET() {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25)

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error: fetchError } = await query
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// PATCH: Bildirimleri okundu işaretle
export async function PATCH(request: Request) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  const body = await request.json()
  const ids = Array.isArray(body.ids) ? body.ids : []

  if (!ids.length) {
    return NextResponse.json({ success: true })
  }

  let query = supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .in('id', ids)

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { error: updateError } = await query
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
