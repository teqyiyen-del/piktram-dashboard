import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  let body: Partial<Database['public']['Tables']['profiles']['Update']>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON gövdesi' }, { status: 400 })
  }

  // Sadece izin verilen alanları ayıkla
  const updatePayload: Database['public']['Tables']['profiles']['Update'] = {}
  if (typeof body.email_notifications === 'boolean') {
    updatePayload.email_notifications = body.email_notifications
  }
  if (typeof body.push_notifications === 'boolean') {
    updatePayload.push_notifications = body.push_notifications
  }
  if (typeof body.weekly_summary === 'boolean') {
    updatePayload.weekly_summary = body.weekly_summary
  }
  if (body.theme && (body.theme === 'light' || body.theme === 'dark')) {
    updatePayload.theme = body.theme
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json(
      { error: 'Güncellenecek geçerli alan belirtilmedi.' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', session.user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, profile: data })
}
