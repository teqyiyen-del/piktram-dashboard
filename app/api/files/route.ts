import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  let query = supabase.from('files').select('*').order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category as Database['public']['Tables']['files']['Row']['category'])
  }

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
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

  const payload: Database['public']['Tables']['files']['Insert'] = {
    name: body.name,
    bucket: body.bucket,
    path: body.path,
    url: body.url ?? null,
    category: body.category as Database['public']['Tables']['files']['Row']['category'],
    description: body.description ?? null,
    user_id: session.user.id
  }

  const { data, error } = await supabase.from('files').insert(payload).select('*').single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data.category === 'invoice') {
    await supabase.from('notifications').insert({
      title: 'Yeni fatura yüklendi',
      description: `${data.name} hazır.`,
      type: 'invoice',
      user_id: session.user.id,
      meta: { file_id: data.id }
    })
  }

  return NextResponse.json(data, { status: 201 })
}
