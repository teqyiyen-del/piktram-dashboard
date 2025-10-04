import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'

// GET: Dosyaları listele
export async function GET(request: Request) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  let query = supabase.from('files').select('*').order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category as Database['public']['Tables']['files']['Row']['category'])
  }

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error: fetchError } = await query
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// POST: Dosya ekle
export async function POST(request: Request) {
  const { error, session, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  const body = await request.formData()
  const file = body.get('file') as File
  const category = body.get('category') as string
  const description = body.get('description') as string | null

  if (!file || !category) {
    return NextResponse.json({ error: 'Dosya ve kategori gerekli' }, { status: 400 })
  }

  // Supabase storage'a yükle
  const filePath = `${session.user.id}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('content-library')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: publicUrl } = supabase.storage.from('content-library').getPublicUrl(filePath)

  // DB kaydı
  const { data, error: insertError } = await supabase
    .from('files')
    .insert({
      name: file.name,
      category: category as Database['public']['Tables']['files']['Row']['category'],
      description,
      url: publicUrl.publicUrl,
      user_id: session.user.id
    })
    .select('*')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
