import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ENV MISSING: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
)

// ✅ Listeleme
export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const { data: me } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
    if (me?.role !== 'admin') return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, company, role, tax_no, sector, created_at')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 })
  }
}

// ✅ Yeni müşteri oluşturma
export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const { data: me } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
    if (me?.role !== 'admin') return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })

    const body = await req.json()
    if (!body.full_name || !body.email || !body.password || !body.tax_no || !body.sector) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }

    // 🔑 User oluştur (login için şifre ile)
    const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.full_name,
        role: body.role ?? 'user'
      }
    })

    if (userError || !newUser?.user) {
      return NextResponse.json({ error: userError?.message ?? 'Kullanıcı oluşturulamadı' }, { status: 500 })
    }

    // Profiles kaydı
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        full_name: body.full_name,
        email: body.email,
        company: body.company ?? null,
        role: body.role ?? 'user',
        tax_no: body.tax_no,
        sector: body.sector
      })
      .select()
      .maybeSingle()

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

    return NextResponse.json(profile, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 })
  }
}

// ✅ Düzenleme
export async function PUT(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const { data: me } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
    if (me?.role !== 'admin') return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID gerekli' }, { status: 400 })

    const body = await req.json()

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
.update({
  full_name: body.full_name,
  email: body.email,
  company: body.company ?? null,
  role: body.role ?? 'user',
  tax_no: body.tax_no,
  sector: body.sector
} as any)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(updated, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 })
  }
}

// ✅ Silme
export async function DELETE(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const { data: me } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
    if (me?.role !== 'admin') return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Müşteri ID gerekli' }, { status: 400 })

    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })

    await supabaseAdmin.from('profiles').delete().eq('id', id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 })
  }
}
