import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  const body = await request.json()
  const updates: Database['public']['Tables']['events']['Update'] = {}

  if ('title' in body) updates.title = body.title
  if ('description' in body) updates.description = body.description ?? null
  if ('event_date' in body) updates.event_date = body.event_date
  if ('event_type' in body) updates.event_type = body.event_type
  if ('related' in body) updates.related = body.related ?? null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 })
  }

  let query = supabase.from('events').update(updates).eq('id', params.id)

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error: updateError } = await query.select('*').single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  let query = supabase.from('events').delete().eq('id', params.id)

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { error: deleteError } = await query

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
