import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { COMPLETED_STATUSES, normalizeStatus } from '@/lib/task-status'
import { TaskStatus } from '@/lib/types'

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

  // Projeleri getir
  let query = supabase
    .from('projects')
    .select('*')
    .order('due_date', { ascending: true })

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data: projects, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const projectsWithProgress = [...(projects ?? [])]
  const projectIds = projectsWithProgress.map((p) => p.id)

  // Eğer projeler varsa görevlerden progress hesapla
  if (projectIds.length > 0) {
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('project_id, status')
      .in('project_id', projectIds)

    const grouped = new Map<string, { total: number; completed: number }>()

    tasksData?.forEach((task) => {
      if (!task.project_id) return
      const normalized = normalizeStatus(task.status as TaskStatus)
      const entry = grouped.get(task.project_id) ?? { total: 0, completed: 0 }
      entry.total += 1
      if (COMPLETED_STATUSES.includes(normalized)) {
        entry.completed += 1
      }
      grouped.set(task.project_id, entry)
    })

    // Progresleri güncelle
    await Promise.all(
      projectsWithProgress.map(async (project) => {
        const entry = grouped.get(project.id) ?? { total: 0, completed: 0 }
        const progress = entry.total === 0 ? 0 : Math.round((entry.completed / entry.total) * 100)

        if (project.progress !== progress) {
          await supabase
            .from('projects')
            .update({ progress })
            .eq('id', project.id)
            .eq('user_id', session.user.id)
        }
        project.progress = progress
      })
    )
  }

  return NextResponse.json(projectsWithProgress)
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

  const payload: Database['public']['Tables']['projects']['Insert'] = {
    title: body.title,
    description: body.description ?? null,
    progress: body.progress !== undefined ? Number(body.progress) : 0,
    due_date: body.due_date ?? null,
    user_id: session.user.id
  }

  const { data, error } = await supabase.from('projects').insert(payload).select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
