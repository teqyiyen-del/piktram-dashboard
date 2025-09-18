import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'

// PUT: Rapor güncelle
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  const body = await request.json()
  const updates: Database['public']['Tables']['reports']['Update'] = {}

  if ('title' in body) updates.title = body.title
  if ('period' in body) updates.period = body.period
  if ('period_label' in body) updates.period_label = body.period_label ?? null
  if ('followers' in body) updates.followers = body.followers
  if ('likes' in body) updates.likes = body.likes
  if ('posts' in body) updates.posts = body.posts
  if ('engagement_rate' in body) updates.engagement_rate = body.engagement_rate ?? null
  if ('summary' in body) updates.summary = body.summary ?? null
  if ('file_url' in body) updates.file_url = body.file_url ?? null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 })
  }

  let query = supabase.from('reports').update(updates).eq('id', params.id)

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error: updateError } = await query.select('*').single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE: Rapor sil
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  let query = supabase.from('reports').delete().eq('id', params.id)

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { error: deleteError } = await query
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
