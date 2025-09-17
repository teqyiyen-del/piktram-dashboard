import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { updateProjectProgress } from './helpers'

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

  let query = supabase.from('tasks').select('*').order('due_date', { ascending: true })

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', session.user.id)
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

  const payload: Database['public']['Tables']['tasks']['Insert'] = {
    title: body.title,
    description: body.description ?? null,
    status: body.status ?? 'todo',
    priority: body.priority ?? 'medium',
    due_date: body.due_date ?? null,
    project_id: body.project_id || null,
    attachment_url: body.attachment_url ?? null,
    user_id: session.user.id
  }

  const { data, error } = await supabase.from('tasks').insert(payload).select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data) {
    await supabase.from('notifications').insert({
      title: 'Yeni görev oluşturuldu',
      description: `${data.title} görevi panoya eklendi`,
      type: 'task',
      user_id: session.user.id,
      meta: { task_id: data.id }
    })

    await updateProjectProgress(supabase, data.project_id, session.user.id)
  }

  return NextResponse.json(data, { status: 201 })
}
