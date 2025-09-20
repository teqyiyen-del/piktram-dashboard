import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

// ✅ GET - Tüm müşterileri listele
export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

// ✅ POST - Yeni müşteri ekle
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const body = await req.json()

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      full_name: body.full_name,
      email: body.email,
      role: body.role || 'müşteri',
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
