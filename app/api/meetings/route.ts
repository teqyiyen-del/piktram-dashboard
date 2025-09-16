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

  let query = supabase.from('meetings').select('*').order('preferred_date', { ascending: true })

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
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

  const payload: Database['public']['Tables']['meetings']['Insert'] = {
    title: body.title,
    agenda: body.agenda ?? null,
    preferred_date: body.preferred_date ?? null,
    meeting_url: body.meeting_url ?? null,
    status: body.status ?? 'beklemede',
    user_id: session.user.id
  }

  const { data, error } = await supabase.from('meetings').insert(payload).select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('notifications').insert({
    title: 'Toplantı talebiniz alındı',
    description: `${data.title} için talebiniz kaydedildi.`,
    type: 'meeting',
    user_id: session.user.id,
    meta: { meeting_id: data.id }
  })

  return NextResponse.json(data, { status: 201 })
}
