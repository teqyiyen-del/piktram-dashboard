import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
<<<<<<< HEAD
import { TASK_STATUS_LABELS, TaskStatus } from '@/lib/types'
=======
import { updateProjectProgress, createStatusRevision } from '../helpers'
import { TaskStatus } from '@/lib/types'
>>>>>>> codex-restore-ux

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const body = await request.json()

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

  const updates: Database['public']['Tables']['tasks']['Update'] = {}

  if ('title' in body) updates.title = body.title
  if ('description' in body) updates.description = body.description
  if ('status' in body) updates.status = body.status as Database['public']['Tables']['tasks']['Row']['status']
  if ('priority' in body) updates.priority = body.priority as Database['public']['Tables']['tasks']['Row']['priority']
  if ('due_date' in body) updates.due_date = body.due_date
  if ('project_id' in body) updates.project_id = body.project_id
  if ('attachment_url' in body) updates.attachment_url = body.attachment_url ?? null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 })
  }

  let previousTask: Database['public']['Tables']['tasks']['Row'] | null = null

  if ('status' in body) {
    let detailQuery = supabase.from('tasks').select('*').eq('id', params.id)

    if (profile?.role !== 'admin') {
      detailQuery = detailQuery.eq('user_id', session.user.id)
    }

    const { data: existing, error: existingError } = await detailQuery.single()

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 404 })
    }

    previousTask = existing
  }

  let query = supabase.from('tasks').update(updates).eq('id', params.id)

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error } = await query.select('*').single()
=======
  const { data: existingTask, error: existingError } = await supabase
    .from('tasks')
    .select('id, title, description, status, priority, due_date, project_id')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 404 })
  }

  const updatePayload: Database['public']['Tables']['tasks']['Update'] = {}

  if ('title' in body) updatePayload.title = body.title
  if ('description' in body) updatePayload.description = body.description
  if ('status' in body) updatePayload.status = body.status
  if ('priority' in body) updatePayload.priority = body.priority
  if ('due_date' in body) updatePayload.due_date = body.due_date ? body.due_date : null
  if ('project_id' in body) updatePayload.project_id = body.project_id || null

  const { data, error } = await supabase
    .from('tasks')
    .update(updatePayload)
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .select('*')
    .single()
>>>>>>> codex-restore-ux

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

<<<<<<< HEAD
  if (previousTask && updates.status && previousTask.status !== updates.status) {
    const fromLabel = TASK_STATUS_LABELS[previousTask.status as TaskStatus]
    const toLabel = TASK_STATUS_LABELS[updates.status as TaskStatus]
    await supabase.from('notifications').insert({
      title: 'Görev durumu güncellendi',
      description: `${previousTask.title} görevi ${fromLabel} → ${toLabel} olarak değişti`,
      type: 'task',
      user_id: session.user.id,
      meta: { task_id: previousTask.id, from: previousTask.status, to: updates.status }
    })
  }

=======
  if ('status' in body) {
    await createStatusRevision(supabase, {
      taskId: params.id,
      userId: session.user.id,
      fromStatus: existingTask.status as TaskStatus,
      toStatus: data.status as TaskStatus
    })
  }

  if ('project_id' in body && body.project_id !== existingTask.project_id) {
    await updateProjectProgress(supabase, existingTask.project_id, session.user.id)
    await updateProjectProgress(supabase, body.project_id ?? null, session.user.id)
  } else if ('status' in body && (existingTask.project_id || data.project_id)) {
    await updateProjectProgress(supabase, data.project_id ?? existingTask.project_id, session.user.id)
  }

>>>>>>> codex-restore-ux
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

<<<<<<< HEAD
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  let query = supabase.from('tasks').delete().eq('id', params.id)

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { error } = await query
=======
  const { data: existingTask } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  const { error } = await supabase.from('tasks').delete().eq('id', params.id).eq('user_id', session.user.id)
>>>>>>> codex-restore-ux

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

<<<<<<< HEAD
=======
  if (existingTask?.project_id) {
    await updateProjectProgress(supabase, existingTask.project_id, session.user.id)
  }

>>>>>>> codex-restore-ux
  return NextResponse.json({ success: true })
}
