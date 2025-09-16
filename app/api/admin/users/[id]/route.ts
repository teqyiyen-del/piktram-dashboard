import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (currentProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Bu işlem için yönetici olmanız gerekir' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const role = body.role as Database['public']['Tables']['profiles']['Row']['role']

  if (role !== 'user' && role !== 'admin') {
    return NextResponse.json({ error: 'Geçersiz rol değeri' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', params.id)
    .select('id, role, full_name, email')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
