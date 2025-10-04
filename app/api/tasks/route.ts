import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'
import { updateProjectProgress } from './helpers'

// ✅ GET - Tüm görevleri listele
export async function GET() {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  let query = supabase.from('tasks').select('*').order('due_date', { ascending: true })

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error: fetchError } = await query
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// ✅ POST - Yeni görev oluştur
export async function POST(request: Request) {
  const { error, session, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  const body = await request.json()

  const payload: Database['public']['Tables']['tasks']['Insert'] = {
    title: body.title,
    description: body.description ?? null,
    status: body.status ?? 'todo',
    priority: body.priority ?? 'medium',
    due_date: body.due_date ?? null,
    project_id: body.project_id || null,
    attachment_url: body.attachment_url ?? null,
    user_id: session.user.id,
  }

  const { data, error: insertError } = await supabase.from('tasks').insert(payload).select('*').single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  if (data) {
    await supabase.from('notifications').insert({
      title: 'Yeni görev oluşturuldu',
      description: `${data.title} görevi panoya eklendi`,
      type: 'task',
      user_id: session.user.id,
      meta: { task_id: data.id },
    })

    await updateProjectProgress(supabase, data.project_id, session.user.id)
  }

  return NextResponse.json(data, { status: 201 })
}
