import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { SectionHeader } from '@/components/layout/section-header'
import type { Profile } from '@/lib/types'
import { SettingsClient } from '@/components/settings/settings-client' // ✅ doğru path

export default async function SettingsPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  if (sessionError) {
    return <div>Session alınamadı: {sessionError.message}</div>
  }

  if (!session) {
    return <div>Giriş yapmanız gerekiyor</div>
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    console.error('Profil alınamadı:', profileError.message)
  }

  const mergedProfile: Profile = {
    id: session.user.id,
    full_name:
      profile?.full_name ??
      (session.user.user_metadata as Record<string, string | undefined>)?.full_name ??
      '',
    email: profile?.email ?? session.user.email ?? '',
    avatar_url: profile?.avatar_url ?? null,
    theme: (profile?.theme as 'light' | 'dark' | null) ?? 'light',
    email_notifications: profile?.email_notifications ?? true,
    push_notifications: profile?.push_notifications ?? false,
    weekly_summary: profile?.weekly_summary ?? true,
    role: (profile?.role as 'admin' | 'user' | null) ?? 'user'
  }

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Ayarlar"
        subtitle="Profil bilgilerinizi ve tercihlerinizi yönetin."
        badge="Kişisel Alan"
        gradient
      />
      <SettingsClient profile={mergedProfile} />
    </div>
  )
}
