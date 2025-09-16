'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
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
  const [feedback, setFeedback] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const updateProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email })
      })
      const data = await response.json()
      if (!response.ok) {
        setFeedback(data.error ?? 'Profil güncellenemedi')
        toast({ title: 'Profil kaydedilemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }
      setFeedback('Profil bilgileri başarıyla güncellendi.')
      toast({ title: 'Profil güncellendi', description: 'Bilgileriniz başarıyla kaydedildi.', variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profil güncellenemedi.'
      setFeedback(message)
      toast({ title: 'Profil kaydedilemedi', description: message, variant: 'error' })
    }
  }

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
      const data = await response.json()
      if (!response.ok) {
        setFeedback(data.error ?? 'Bildirim tercihleri kaydedilemedi')
        toast({ title: 'Tercihler kaydedilemedi', description: data.error ?? 'Bir hata oluştu.', variant: 'error' })
        return
      }
      setFeedback('Bildirim tercihleri güncellendi.')
      toast({ title: 'Tercihler güncellendi', description: 'Bildirim ayarlarınız kaydedildi.', variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bildirim tercihleri kaydedilemedi.'
      setFeedback(message)
      toast({ title: 'Tercihler kaydedilemedi', description: message, variant: 'error' })
    }
  }

  const handleThemeChange = async (nextTheme: 'light' | 'dark') => {
    const previousTheme = theme
    setTheme(nextTheme)
    try {
      const response = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: nextTheme })
      })
      if (!response.ok) {
        setFeedback('Tema güncellenemedi')
        toast({ title: 'Tema uygulanamadı', description: 'Lütfen tekrar deneyin.', variant: 'error' })
        setTheme(previousTheme)
        return
      }
      setFeedback(`Tema ${nextTheme === 'dark' ? 'koyu' : 'açık'} moda alındı.`)
      toast({
        title: 'Tema güncellendi',
        description: `Arayüz ${nextTheme === 'dark' ? 'koyu' : 'açık'} moda taşındı.`,
        variant: 'success'
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tema güncellenemedi.'
      setFeedback(message)
      toast({ title: 'Tema uygulanamadı', description: message, variant: 'error' })
      setTheme(previousTheme)
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Ayarlar</h1>
        <p className="mt-2 text-sm text-gray-500">Profil bilgilerinizi ve çalışma alışkanlıklarınızı yönetin.</p>
      </div>

      {feedback && <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{feedback}</div>}

      <section className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
          <p className="text-sm text-gray-500">Adınızı ve iletişim bilgilerinizi güncelleyin.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Ad Soyad</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Örn. Elif Aksoy" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <Button className="mt-6" onClick={updateProfile}>
          Profili Kaydet
        </Button>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Bildirimler</h2>
          <p className="text-sm text-gray-500">Takipte kalmak için tercih ettiğiniz bildirimleri seçin.</p>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between rounded-2xl border border-gray-200 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">E-posta Bildirimleri</p>
              <p className="text-xs text-gray-500">Önemli gelişmelerde e-posta almak için etkinleştirin.</p>
            </div>
            <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-gray-200 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Anlık Bildirimler</p>
              <p className="text-xs text-gray-500">Görev güncellemelerinde anında bildirim alın.</p>
            </div>
            <input type="checkbox" checked={pushNotifications} onChange={(e) => setPushNotifications(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-gray-200 p-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Haftalık Özet</p>
              <p className="text-xs text-gray-500">Her pazartesi haftalık rapor alın.</p>
            </div>
            <input type="checkbox" checked={weeklySummary} onChange={(e) => setWeeklySummary(e.target.checked)} />
          </label>
        </div>
        <Button className="mt-6" variant="secondary" onClick={updateNotifications}>
          Tercihleri Kaydet
        </Button>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Görünüm</h2>
          <p className="text-sm text-gray-500">Arayüz temasını seçerek çalışma alanınızı kişiselleştirin.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleThemeChange('light')}
            className={`flex h-28 w-40 flex-col justify-between rounded-2xl border p-4 text-left transition ${
              theme === 'light' ? 'border-accent shadow-lg' : 'border-gray-200'
            }`}
          >
            <span className="text-sm font-semibold text-gray-900">Açık Tema</span>
            <span className="text-xs text-gray-500">Modern ve ferah görünüm</span>
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`flex h-28 w-40 flex-col justify-between rounded-2xl border p-4 text-left transition ${
              theme === 'dark' ? 'border-accent shadow-lg' : 'border-gray-200'
            }`}
          >
            <span className="text-sm font-semibold text-gray-900">Koyu Tema</span>
            <span className="text-xs text-gray-500">Göz yormayan gece modu</span>
          </button>
        </div>
      </section>
    </div>
  )
}
