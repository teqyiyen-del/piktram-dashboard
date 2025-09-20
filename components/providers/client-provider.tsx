'use client'

import { ReactNode } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import type { Database } from '@/lib/supabase-types'
import { NotificationProvider } from '@/components/providers/notification-provider'

export default function ClientProvider({ children }: { children: ReactNode }) {
  const supabaseClient = createClientComponentClient<Database>()

  return (
    <SessionContextProvider supabaseClient={supabaseClient} initialSession={null}>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </SessionContextProvider>
  )
}
