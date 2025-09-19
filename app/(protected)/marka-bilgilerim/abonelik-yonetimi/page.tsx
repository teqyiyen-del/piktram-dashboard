import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { SubscriptionPanel } from '@/components/subscription/subscription-panel'
import type { StoredFile, Subscription } from '@/lib/types'

export default async function AbonelikYonetimiPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Session
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (!session) return null

  // Kullanıcı rolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()
  const isAdmin = profile?.role === 'admin'

  // Queries
  const subscriptionQuery = supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let invoicesQuery = supabase
    .from('files')
    .select('*')
    .eq('category', 'invoice')
    .order('created_at', { ascending: false })

  let contractsQuery = supabase
    .from('files')
    .select('*')
    .eq('category', 'contract')
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    invoicesQuery = invoicesQuery.eq('user_id', session.user.id)
    contractsQuery = contractsQuery.eq('user_id', session.user.id)
  }

  const [{ data: subscription }, { data: invoices }, { data: contracts }] =
    await Promise.all([subscriptionQuery, invoicesQuery, contractsQuery])

  return (
    <SubscriptionPanel
      subscription={(subscription ?? null) as Subscription | null}
      invoices={(invoices ?? []) as StoredFile[]}
      contracts={(contracts ?? []) as StoredFile[]}
    />
  )
}
