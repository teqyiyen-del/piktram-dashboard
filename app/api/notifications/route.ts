import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

// GET: Bildirimleri listele
export async function GET() {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error: error ?? 'Unauthorized' }, { status: 401 })
  }

  // notifications + notifications_read (LEFT JOIN)
  const { data, error: fetchError } = await supabase
    .from('notifications')
    .select(
      `
      id,
      title,
      description,
      type,
      target_url,
      created_at,
      user_id,
      reads:notifications_read(user_id, read_at)
    `
    )
    .or(`user_id.eq.${session.user.id},user_id.is.null`)
    .order('created_at', { ascending: false })
    .limit(25)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  // normalize: sadece currentUser’ın read_at değerini çek
  const normalized = (data ?? []).map((n: any) => ({
    ...n,
    read_at:
      n.reads?.find((r: any) => r.user_id === session.user.id)?.read_at ?? null,
  }))

  return NextResponse.json(normalized)
}

// PATCH: Bildirimleri okundu işaretle
export async function PATCH(request: Request) {
  const { error, session, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error: error ?? 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const ids: string[] = Array.isArray(body.ids) ? body.ids : []
  if (!ids.length) {
    return NextResponse.json({ success: true })
  }

  const { error: upsertError } = await supabase
    .from('notifications_read')
    .upsert(
      ids.map((id) => ({
        notification_id: id,
        user_id: session.user.id,
        read_at: new Date().toISOString(),
      })),
      { onConflict: 'notification_id,user_id' }
    )

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// POST: Yeni bildirim oluştur (sadece admin)
export async function POST(request: Request) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error: error ?? 'Unauthorized' }, { status: 401 })
  }
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, target_url, user_id, type } = body

  const { data, error: insertError } = await supabase
    .from('notifications')
    .insert([
      {
        title,
        description: description ?? null,
        target_url: target_url ?? null,
        user_id: user_id ?? null,
        type: type ?? 'announcement',
      },
    ])
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
