import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'

// GET: Toplantıları listele
export async function GET() {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  let query = supabase.from('meetings').select('*').order('preferred_date', { ascending: true })

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error: fetchError } = await query
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// POST: Yeni toplantı talebi
export async function POST(request: Request) {
  const { error, session, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  const body = await request.json()

  const payload: Database['public']['Tables']['meetings']['Insert'] = {
    title: body.title,
    agenda: body.agenda ?? null,
    preferred_date: body.preferred_date ?? null,
    meeting_url: body.meeting_url ?? null,
    status: body.status ?? 'beklemede',
    user_id: session.user.id
  }

  const { data, error: insertError } = await supabase.from('meetings').insert(payload).select('*').single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Kullanıcıya bildirim
  await supabase.from('notifications').insert({
    title: 'Toplantı talebiniz alındı',
    description: `${data.title} için talebiniz kaydedildi.`,
    type: 'meeting',
    user_id: session.user.id,
    meta: { meeting_id: data.id }
  })

  return NextResponse.json(data, { status: 201 })
}
