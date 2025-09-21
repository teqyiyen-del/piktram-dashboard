import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'

// PUT: Proje güncelle
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  const body = await request.json()
  const updates: Database['public']['Tables']['projects']['Update'] = {}

  if ('title' in body) updates.title = body.title
  if ('description' in body) updates.description = body.description ?? null
  if ('progress' in body && body.progress !== undefined) {
    updates.progress = Number(body.progress)
  }
  if ('due_date' in body) updates.due_date = body.due_date ?? null
  if ('client_id' in body) updates.client_id = body.client_id ?? null // 🔑 müşteri bağlama/güncelleme
  if ('type' in body) updates.type = body.type ?? 'project'           // 🔑 proje/campaign seçimi

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Güncellenecek alan bulunamadı' }, { status: 400 })
  }

  let query = supabase.from('projects').update(updates).eq('id', params.id)

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error: updateError } = await query.select('*').single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE: Proje sil
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  let query = supabase.from('projects').delete().eq('id', params.id)

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { error: deleteError } = await query
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
