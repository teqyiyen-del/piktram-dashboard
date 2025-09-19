import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { MeetingPlanner } from '@/components/meetings/meeting-planner'
import { SectionHeader } from '@/components/layout/section-header'
import type { Meeting } from '@/lib/types'

export default async function ToplantiPlanlamaPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  let meetingsQuery = supabase
    .from('meetings')
    .select('*')
    .order('preferred_date', { ascending: true })

  if (!isAdmin) {
    meetingsQuery = meetingsQuery.eq('user_id', session.user.id)
  }

  const { data: meetingsData } = await meetingsQuery
  const calUrl = process.env.NEXT_PUBLIC_CALCOM_URL ?? null

  return (
    <div className="space-y-10">
      {/* Gradient Header */}
      <SectionHeader
        title="Toplantı Planlama"
        subtitle="Müşteri toplantılarınızı organize edin, yaklaşan görüşmeleri takip edin."
        badge="Ajanda"
        gradient
      />

      {/* Meeting Planner */}
      <MeetingPlanner
        initialMeetings={(meetingsData ?? []) as unknown as Meeting[]}
        calUrl={calUrl}
      />
    </div>
  )
}
