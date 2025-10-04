// app/api/admin/clients/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  // Sadece adminler görebilir
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Bu işlem için yönetici olmanız gerekir' },
      { status: 403 }
    )
  }

  // Query parametreleri oku
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('client')

  // Base query
  let query = supabase
    .from('profiles')
    .select('id, full_name, email, company, role')
    .order('created_at', { ascending: false })

  // Client filtresi uygula
  if (clientId) {
    query = query.eq('id', clientId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
