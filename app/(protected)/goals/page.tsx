import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { GoalsClient } from '@/components/goals/goals-client'

export default async function GoalsPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: goalsData } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true })

  return <GoalsClient initialGoals={goalsData ?? []} />
}
