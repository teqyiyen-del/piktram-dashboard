import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const body = await request.json()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const updatePayload = {
    email_notifications: body.email_notifications,
    push_notifications: body.push_notifications,
    weekly_summary: body.weekly_summary,
    theme: body.theme
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', session.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
