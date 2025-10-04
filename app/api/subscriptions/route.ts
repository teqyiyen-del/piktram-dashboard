import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'

export async function GET() {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  let query = supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data: subscription, error: fetchError } = await query.single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  return NextResponse.json(subscription ?? null)
}
