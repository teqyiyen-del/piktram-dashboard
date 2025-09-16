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

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', session.user.id)
    .order('due_date', { ascending: true })

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
    status: body.status ?? 'todo',
    priority: body.priority ?? 'medium',
    due_date: body.due_date ? body.due_date : null,
    project_id: body.project_id || null,
    user_id: session.user.id
  }

  const { data, error } = await supabase.from('tasks').insert(payload).select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await updateProjectProgress(supabase, body.project_id ?? null, session.user.id)

  return NextResponse.json(data, { status: 201 })
}
