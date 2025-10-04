import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

export async function getSessionAndRole() {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return { error: 'Yetkisiz erişim', session: null, role: null, supabase }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Profil bulunamadı', session, role: null, supabase }
  }

  return { error: null, session, role: profile.role, supabase }
}
