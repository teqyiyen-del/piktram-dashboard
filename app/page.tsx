import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Eğer kullanıcı login olduysa dashboard'a, yoksa login sayfasına yönlendir
  redirect(session ? '/dashboard' : '/auth/login')
}
