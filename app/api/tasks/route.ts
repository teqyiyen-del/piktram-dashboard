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

  const query = supabase
    .from('tasks')
    .select('*')
    .order('due_date', { ascending: true })

  if (profile?.role !== 'admin') {
    query.eq('user_id', session.user.id)
  }

  const { data, error } = await query

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

  const payload = {
    title: body.title,
    description: body.description,
    status: (body.status as Database['public']['Tables']['tasks']['Row']['status']) ?? 'todo',
    priority: (body.priority as Database['public']['Tables']['tasks']['Row']['priority']) ?? 'medium',
    due_date: body.due_date,
    project_id: body.project_id,
    attachment_url: body.attachment_url ?? null,
    user_id: session.user.id
  }

  const { data, error } = await supabase.from('tasks').insert(payload).select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
