import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const body = await request.json()

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

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

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error } = await query.select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  let query = supabase.from('reports').delete().eq('id', params.id)

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
