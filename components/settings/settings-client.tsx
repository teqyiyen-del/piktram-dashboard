'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/components/providers/theme-provider'
import { useToast } from '@/components/providers/toast-provider'

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

  // ✅ Profil güncelleme
  const updateProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email })
      })

      if (!response.ok) {
        const data = await response.json()
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
  }

  // ✅ Bildirim tercihleri
  const updateNotifications = async () => {
    try {
      const response = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          weekly_summary: weeklySummary
        })
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: 'Tercihler kaydedilemedi',
          description: data.error ?? 'Bir hata oluştu.',
          variant: 'error'
        })
        return
      }

      toast({
        title: 'Tercihler güncellendi',
        description: 'Bildirim ayarlarınız kaydedildi.',
        variant: 'success'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bildirim tercihleri kaydedilemedi.'
      toast({ title: 'Tercihler kaydedilemedi', description: message, variant: 'error' })
    }
  }

  // ✅ Tema değiştirme
  const handleThemeChange = async (nextTheme: 'light' | 'dark') => {
    setTheme(nextTheme) // localStorage + html.class update

    try {
      const response = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: nextTheme })
      })

      if (!response.ok) {
        throw new Error('API kaydedilemedi')
      }

      toast({
        title: 'Tema güncellendi',
        description: `Arayüz ${nextTheme === 'dark' ? 'koyu' : 'açık'} moda taşındı.`,
        variant: 'success'
      })
    } catch {
      toast({
        title: 'Tema güncellendi (lokal)',
        description: `Arayüz ${nextTheme === 'dark' ? 'koyu' : 'açık'} moda taşındı fakat API’ye kaydedilemedi.`,
        variant: 'warning'
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-surface p-8 shadow-sm transition-colors duration-300 dark:bg-surface-dark">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Ayarlar</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Profil bilgilerinizi ve çalışma alışkanlıklarınızı yönetin.
        </p>
      </div>

      {/* Profile Section */}
      <section className="rounded-3xl border border-gray-200 bg-surface p-6 transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Profil</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ad Soyad</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent focus:ring-accent dark:border-gray-600"
              placeholder="Örn. Elif Aksoy"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-accent focus:ring-accent dark:border-gray-600"
            />
          </div>
        </div>
        <Button className="mt-6" onClick={updateProfile}>Profili Kaydet</Button>
      </section>

      {/* Notifications Section */}
      <section className="rounded-3xl border border-gray-200 bg-surface p-6 transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Bildirimler</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900 dark:text-white">E-posta Bildirimleri</span>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900 dark:text-white">Anlık Bildirimler</span>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900 dark:text-white">Haftalık Özet</span>
            <Switch checked={weeklySummary} onCheckedChange={setWeeklySummary} />
          </div>
        </div>
        <Button className="mt-6" variant="secondary" onClick={updateNotifications}>Tercihleri Kaydet</Button>
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
    </div>
  )
}
