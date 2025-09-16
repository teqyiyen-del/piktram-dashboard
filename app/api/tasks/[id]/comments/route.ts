import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { createRevision } from '../../helpers'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, profiles(full_name, email)')
    .eq('task_id', params.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const comments = (data ?? []).map((comment) => ({
    id: comment.id,
    task_id: params.id,
    user_id: comment.user_id,
    content: comment.content,
    created_at: comment.created_at,
    author: {
      full_name:
        (comment.profiles as { full_name: string | null } | null)?.full_name ??
        (comment.user_id === session.user.id
          ? ((session.user.user_metadata?.full_name as string | null) ?? null)
          : null),
      email:
        (comment.profiles as { email: string | null } | null)?.email ??
        (comment.user_id === session.user.id ? session.user.email ?? null : null)
    }
  }))

  return NextResponse.json(comments)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const body = await request.json()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
  }

  const content = typeof body.content === 'string' ? body.content.trim() : ''

  if (!content) {
    return NextResponse.json({ error: 'Yorum metni gerekli.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      task_id: params.id,
      user_id: session.user.id,
      content
    })
    .select('id, content, created_at, user_id, profiles(full_name, email)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const description = `Yorum eklendi: "${content.slice(0, 120)}${content.length > 120 ? '…' : ''}"`

  const revision = await createRevision(supabase, {
    taskId: params.id,
    userId: session.user.id,
    description,
    commentId: data.id
  })

  const commentResponse = {
    comment: {
      id: data.id,
      task_id: params.id,
      user_id: session.user.id,
      content: data.content,
      created_at: data.created_at,
      author: {
        full_name:
          (data.profiles as { full_name: string | null } | null)?.full_name ??
          (session.user.user_metadata?.full_name ?? null),
        email: (data.profiles as { email: string | null } | null)?.email ?? session.user.email ?? null
      }
    },
    revision: revision
  }

  return NextResponse.json(commentResponse, { status: 201 })
}
