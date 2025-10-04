import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  const body = await request.json()
  const updatePayload: Database['public']['Tables']['goals']['Update'] = {}

  if ('title' in body) updatePayload.title = body.title
  if ('description' in body) updatePayload.description = body.description
  if ('is_completed' in body) updatePayload.is_completed = body.is_completed

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: 'Boş update isteği' }, { status: 400 })
  }

  let query = supabase.from('goals').update(updatePayload).eq('id', params.id)

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error: updateError } = await query.select('*').maybeSingle()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  let query = supabase.from('goals').select('*').eq('id', params.id)
  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data: goalToDelete, error: fetchError } = await query.maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!goalToDelete) {
    return NextResponse.json({ error: 'Kayıt bulunamadı' }, { status: 404 })
  }

  let deleteQuery = supabase.from('goals').delete().eq('id', params.id)
  if (role !== 'admin') {
    deleteQuery = deleteQuery.eq('user_id', session.user.id)
  }

  const { error: deleteError } = await deleteQuery
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json(goalToDelete)
}
