import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { GoalsClient } from '@/components/goals/goals-client'

export const revalidate = 0 // ✅ her request’te fresh data çek

export default async function GoalsPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: goalsData, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false }) // ✅ en yeni hedef en üstte

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">Hedefler alınamadı: {error.message}</p>
      </div>
    )
  }

  return <GoalsClient initialGoals={goalsData ?? []} />
}
