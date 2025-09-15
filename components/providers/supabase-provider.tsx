'use client'

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { Session, SessionContextProvider } from '@supabase/auth-helpers-react'
import { ReactNode, useState } from 'react'
import { Database } from '@/lib/supabase-types'

type Props = {
  children: ReactNode
  session: Session | null
}

export default function SupabaseProvider({ children, session }: Props) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient<Database>())

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={session}>
      {children}
    </SessionContextProvider>
  )
}
