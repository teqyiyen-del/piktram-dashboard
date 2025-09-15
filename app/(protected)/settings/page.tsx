import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { SettingsClient } from '@/components/settings/settings-client'

export default async function SettingsPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const mergedProfile = {
    id: session.user.id,
    full_name: profile?.full_name ?? (session.user.user_metadata as Record<string, string | undefined>)?.full_name ?? '',
    email: profile?.email ?? session.user.email!,
    avatar_url: profile?.avatar_url ?? null,
    theme: (profile?.theme as 'light' | 'dark' | null) ?? 'light',
    email_notifications: profile?.email_notifications ?? true,
    push_notifications: profile?.push_notifications ?? false,
    weekly_summary: profile?.weekly_summary ?? true
  }

  return <SettingsClient profile={mergedProfile} />
}
