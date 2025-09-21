import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { createClient } from '@supabase/supabase-js'

// Service role client (sadece server tarafında!)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // admin işlemleri için
)

// ✅ GET - tüm müşteriler
export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle()

  if (me?.role !== 'admin') return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, company, role, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// ✅ POST - yeni müşteri ekle
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle()

  if (me?.role !== 'admin') return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })

  const body = await req.json()
  if (!body.full_name || !body.email) {
    return NextResponse.json({ error: 'Ad Soyad ve E-posta zorunlu' }, { status: 400 })
  }

  // Yeni user yarat (service key ile)
  const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: body.email,
    email_confirm: true,
    user_metadata: {
      full_name: body.full_name,
      company: body.company ?? null,
      role: body.role || 'user'
    }
  })

  if (userError) return NextResponse.json({ error: userError.message }, { status: 500 })

  // profiles trigger’ı işlemişse profiles’dan çek
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email, company, role, created_at')
    .eq('id', newUser.user?.id)
    .maybeSingle()

  return NextResponse.json(profile, { status: 201 })
}

// ✅ DELETE - müşteri sil
export async function DELETE(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle()

  if (me?.role !== 'admin') return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Müşteri ID gerekli' }, { status: 400 })

  const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
