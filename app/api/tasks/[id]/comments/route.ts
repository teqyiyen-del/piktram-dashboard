import { NextResponse } from 'next/server'
import { Database } from '@/lib/supabase-types'
import { getSessionAndRole } from '@/lib/checkrole'
import { createRevision } from '../../helpers'

const BUCKET_NAME = 'task-comments'

function sanitizeFileName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // accentleri sil
    .replace(/[^a-zA-Z0-9._-]/g, '_') // özel karakterleri alt tire yap
}

// ✅ GET - Yorumları listele
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { error, session, role, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  let query = supabase
    .from('comments')
    .select(
      `
        id,
        content,
        file_url,
        created_at,
        user_id,
        profiles ( full_name, email )
      `
    )
    .eq('task_id', params.id)
    .order('created_at', { ascending: true })

  if (role !== 'admin') {
    query = query.eq('user_id', session.user.id)
  }

  const { data, error: fetchError } = await query
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const comments = (data || []).map((c) => ({
    id: c.id,
    content: c.content,
    file_url: c.file_url,
    created_at: c.created_at,
    user_id: c.user_id,
    author: {
      full_name: (c as any).profiles?.full_name ?? null,
      email: (c as any).profiles?.email ?? null,
    },
  }))

  return NextResponse.json(comments, { status: 200 })
}

// ✅ POST - Yorum ekle + Görevi Revizyon durumuna al
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { error, session, supabase } = await getSessionAndRole()
  if (error || !session) {
    return NextResponse.json({ error }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const content = (formData.get('content') as string)?.trim() ?? ''
    const file = formData.get('file') as File | null

    if (!content && !file) {
      return NextResponse.json({ error: 'Yorum metni veya dosya gerekli.' }, { status: 400 })
    }

    let fileUrl: string | null = null
    if (file) {
      const safeName = sanitizeFileName(file.name)
      const filePath = `${params.id}/${crypto.randomUUID()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        return NextResponse.json({ error: `Dosya yüklenemedi: ${uploadError.message}` }, { status: 500 })
      }

      const { data: signed, error: signedErr } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 60 * 60 * 24 * 7)

      if (signedErr) {
        return NextResponse.json({ error: `URL oluşturulamadı: ${signedErr.message}` }, { status: 500 })
      }

      fileUrl = signed?.signedUrl ?? null
    }

    // ✅ Yorum ekle
    const { data, error: insertError } = await supabase
      .from('comments')
      .insert({
        task_id: params.id,
        user_id: session.user.id,
        content,
        file_url: fileUrl,
      })
      .select(
        `
          id,
          content,
          file_url,
          created_at,
          user_id,
          profiles ( full_name, email )
        `
      )
      .single()

    if (insertError || !data) {
      return NextResponse.json({ error: insertError?.message ?? 'Insert failed' }, { status: 500 })
    }

    // ✅ Görev durumunu otomatik "revision" yap
    await supabase.from('tasks').update({ status: 'revision' }).eq('id', params.id)

    // ✅ Revizyon kaydı oluştur
    const description = `Yorum eklendi: "${content.slice(0, 120)}${content.length > 120 ? '…' : ''}"`
    const revision = await createRevision(supabase, {
      taskId: params.id,
      userId: session.user.id,
      description,
      commentId: data.id,
    })

    return NextResponse.json(
      {
        comment: {
          ...data,
          author: {
            full_name: (data as any).profiles?.full_name ?? null,
            email: (data as any).profiles?.email ?? null,
          },
        },
        revision,
      },
      { status: 201 }
    )
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Beklenmedik bir hata oluştu.' },
      { status: 500 }
    )
  }
}
