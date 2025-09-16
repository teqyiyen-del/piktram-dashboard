import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { updateProjectProgress, createStatusRevision } from '../helpers'
import { TaskStatus } from '@/lib/types'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const body = await request.json()

  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

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

  const { data: existingTask } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', params.id)
    .eq('user_id', session.user.id)
    .single()

  const { error } = await supabase.from('tasks').delete().eq('id', params.id).eq('user_id', session.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (existingTask?.project_id) {
    await updateProjectProgress(supabase, existingTask.project_id, session.user.id)
  }

  return NextResponse.json({ success: true })
}
