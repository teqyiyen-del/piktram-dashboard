import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

export async function GET() {
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

  const reportsQuery = supabase.from('reports').select('*').order('created_at', { ascending: false })

  if (profile?.role !== 'admin') {
    reportsQuery.eq('user_id', session.user.id)
  }

  const { data, error } = await reportsQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const body = await request.json()

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const payload: Database['public']['Tables']['reports']['Insert'] = {
    title: body.title,
    period: body.period,
    period_label: body.period_label ?? null,
    followers: body.followers,
    likes: body.likes,
    posts: body.posts,
    engagement_rate: body.engagement_rate ?? null,
    summary: body.summary ?? null,
    file_url: body.file_url ?? null,
    user_id: session.user.id
  }

  const { data, error } = await supabase.from('reports').insert(payload).select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data) {
    await supabase.from('notifications').insert({
      title: 'Yeni rapor hazır',
      description: `${data.title} yayınlandı.`,
      type: 'report',
      user_id: session.user.id,
      meta: { report_id: data.id }
    })
  }

  return NextResponse.json(data, { status: 201 })
}
