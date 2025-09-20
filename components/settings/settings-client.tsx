'use client'

import { useState, useCallback } from 'react'
import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/components/providers/theme-provider'
import { useToast } from '@/components/providers/toast-provider'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface SettingsClientProps {
  profile: Profile
}

export function SettingsClient({ profile }: SettingsClientProps) {
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [email, setEmail] = useState(profile.email)
  const [emailNotifications, setEmailNotifications] = useState(profile.email_notifications ?? true)
  const [pushNotifications, setPushNotifications] = useState(profile.push_notifications ?? false)
  const [weeklySummary, setWeeklySummary] = useState(profile.weekly_summary ?? true)

  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  const router = useRouter()

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  // ✅ Profil güncelleme
  const updateProfile = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        toast({
          title: 'Profil kaydedilemedi',
          description: data.error ?? 'Bir hata oluştu.',
          variant: 'error'
        })
        return
      }

      toast({
        title: 'Profil güncellendi',
        description: 'Bilgileriniz başarıyla kaydedildi.',
        variant: 'success'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profil güncellenemedi.'
      toast({ title: 'Profil kaydedilemedi', description: message, variant: 'error' })
    }
  }, [fullName, email, toast])

  // ✅ Bildirim toggle
  const handleNotificationChange = useCallback(
    async (field: 'email_notifications' | 'push_notifications' | 'weekly_summary', value: boolean) => {
      if (field === 'email_notifications') setEmailNotifications(value)
      if (field === 'push_notifications') setPushNotifications(value)
      if (field === 'weekly_summary') setWeeklySummary(value)

      try {
        await fetch('/api/profile/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value })
        })

        toast({
          title: 'Tercih kaydedildi',
          description: `${field} ${value ? 'açıldı' : 'kapandı'}.`,
          variant: 'success'
        })
      } catch {
        toast({
          title: 'Tercih kaydedilemedi',
          description: 'Bağlantı hatası.',
          variant: 'error'
        })
      }
    },
    [toast]
  )

  // ✅ Tema değiştirme
  const handleThemeChange = useCallback(
    async (nextTheme: 'light' | 'dark') => {
      setTheme(nextTheme)
      try {
        await fetch('/api/profile/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: nextTheme })
        })

        toast({
          title: 'Tema güncellendi',
          description: `Arayüz ${nextTheme === 'dark' ? 'koyu' : 'açık'} moda taşındı.`,
          variant: 'success'
        })
      } catch {
        toast({
          title: 'Tema kaydedilemedi',
          description: 'Yalnızca lokal olarak değiştirildi.',
          variant: 'warning'
        })
      }
    },
    [setTheme, toast]
  )

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <form
        onSubmit={updateProfile}
        className="rounded-3xl border border-gray-200 bg-surface p-6 dark:border-gray-700 dark:bg-surface-dark"
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Profil</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ad Soyad</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-accent dark:border-gray-600"
              placeholder="Örn. Elif Aksoy"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-accent dark:border-gray-600"
            />
          </div>
        </div>
        <Button type="submit" className="mt-6">
          Profili Kaydet
        </Button>
      </form>

      {/* Notifications Section */}
      <section className="rounded-3xl border border-gray-200 bg-surface p-6 dark:border-gray-700 dark:bg-surface-dark">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Bildirimler</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900 dark:text-white">E-posta Bildirimleri</span>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900 dark:text-white">Anlık Bildirimler</span>
            <Switch
              checked={pushNotifications}
              onCheckedChange={(checked) => handleNotificationChange('push_notifications', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900 dark:text-white">Haftalık Özet</span>
            <Switch
              checked={weeklySummary}
              onCheckedChange={(checked) => handleNotificationChange('weekly_summary', checked)}
            />
          </div>
        </div>
      </section>

      {/* Theme Section */}
      <section className="rounded-3xl border border-gray-200 bg-surface p-6 dark:border-gray-700 dark:bg-surface-dark">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Görünüm</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-900 dark:text-white">Koyu Tema</span>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => handleThemeChange(checked ? 'dark' : 'light')}
          />
        </div>
      </section>

      {/* Logout Section */}
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-700 dark:bg-red-950/30">
        <h2 className="mb-4 text-lg font-semibold text-red-700 dark:text-red-400">Hesap</h2>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Çıkış Yap
        </Button>
      </section>
    </div>
  )
}
