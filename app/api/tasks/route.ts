import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
<<<<<<< HEAD
=======
import { updateProjectProgress } from './helpers'
>>>>>>> codex-restore-ux

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

<<<<<<< HEAD
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

=======
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', session.user.id)
    .order('due_date', { ascending: true })

>>>>>>> codex-restore-ux
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
<<<<<<< HEAD
    status: (body.status as Database['public']['Tables']['tasks']['Row']['status']) ?? 'yapiliyor',
    priority: (body.priority as Database['public']['Tables']['tasks']['Row']['priority']) ?? 'medium',
    due_date: body.due_date,
    project_id: body.project_id,
    attachment_url: body.attachment_url ?? null,
=======
    status: body.status ?? 'todo',
    priority: body.priority ?? 'medium',
    due_date: body.due_date ? body.due_date : null,
    project_id: body.project_id || null,
>>>>>>> codex-restore-ux
    user_id: session.user.id
  }

  const { data, error } = await supabase.from('tasks').insert(payload).select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

<<<<<<< HEAD
  if (data) {
    await supabase.from('notifications').insert({
      title: 'Yeni görev oluşturuldu',
      description: `${data.title} görevi panoya eklendi`,
      type: 'task',
      user_id: session.user.id,
      meta: { task_id: data.id }
    })
  }
=======
  await updateProjectProgress(supabase, body.project_id ?? null, session.user.id)
>>>>>>> codex-restore-ux

  return NextResponse.json(data, { status: 201 })
}
