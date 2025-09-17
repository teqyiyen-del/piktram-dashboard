import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { TASK_STATUS_LABELS, TaskStatus } from '@/lib/types'
import { updateProjectProgress, createStatusRevision } from '../helpers'

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

  // Güncellenecek alanları hazırla
  const updates: Database['public']['Tables']['tasks']['Update'] = {}
  if ('title' in body) updates.title = body.title
  if ('description' in body) updates.description = body.description
  if ('status' in body) updates.status = body.status
  if ('priority' in body) updates.priority = body.priority
  if ('due_date' in body) updates.due_date = body.due_date ?? null
  if ('project_id' in body) updates.project_id = body.project_id || null
  if ('attachment_url' in body) updates.attachment_url = body.attachment_url ?? null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 })
  }

  // Önceki task durumu lazım olabilir
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

  // Update işlemi
  let query = supabase.from('tasks').update(updates).eq('id', params.id)
  if (profile?.role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error } = await query.select('*').single()
  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Görev bulunamadı' }, { status: 500 })
  }

  // Status değişmişse notification ve revision oluştur
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

    await createStatusRevision(supabase, {
      taskId: params.id,
      userId: session.user.id,
      fromStatus: previousTask.status as TaskStatus,
      toStatus: updates.status as TaskStatus
    })
  }

  // Proje progress güncelle
  if ('project_id' in body && previousTask?.project_id !== updates.project_id) {
    if (previousTask?.project_id) {
      await updateProjectProgress(supabase, previousTask.project_id, session.user.id)
    }
    if (updates.project_id) {
      await updateProjectProgress(supabase, updates.project_id, session.user.id)
    }
  } else if ('status' in body && (previousTask?.project_id || data.project_id)) {
    await updateProjectProgress(supabase, data.project_id ?? previousTask?.project_id, session.user.id)
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

  // Silinmeden önce project_id al
  let taskQuery = supabase.from('tasks').select('project_id').eq('id', params.id)
  if (profile?.role !== 'admin') {
    taskQuery = taskQuery.eq('user_id', session.user.id)
  }
  const { data: existingTask } = await taskQuery.single()

  // Silme işlemi
  let deleteQuery = supabase.from('tasks').delete().eq('id', params.id)
  if (profile?.role !== 'admin') {
    deleteQuery = deleteQuery.eq('user_id', session.user.id)
  }
  const { error } = await deleteQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Proje progress güncelle
  if (existingTask?.project_id) {
    await updateProjectProgress(supabase, existingTask.project_id, session.user.id)
  }

  return NextResponse.json({ success: true })
}
