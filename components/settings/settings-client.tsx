'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/providers/theme-provider'
<<<<<<< HEAD
=======
import { useToast } from '@/components/providers/toast-provider'
>>>>>>> codex-restore-ux

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
<<<<<<< HEAD
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success')
  const { theme, setTheme } = useTheme()
  const [savingTheme, setSavingTheme] = useState(false)

  const updateProfile = async () => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: fullName, email })
    })
    const data = await response.json()
    if (!response.ok) {
      setFeedbackType('error')
      setFeedback(data.error ?? 'Profil güncellenemedi')
      return
    }
    setFeedbackType('success')
    setFeedback('Profil bilgileri başarıyla güncellendi.')
  }

  const updateNotifications = async () => {
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
      setFeedbackType('error')
      setFeedback(data.error ?? 'Bildirim tercihleri kaydedilemedi')
      return
    }
    setFeedbackType('success')
    setFeedback('Bildirim tercihleri güncellendi.')
  }

  const handleThemeToggle = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    const previous = theme
    setTheme(nextTheme)
    setSavingTheme(true)
    const response = await fetch('/api/profile/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: nextTheme })
    })
    setSavingTheme(false)

    if (!response.ok) {
      setTheme(previous)
      setFeedbackType('error')
      setFeedback('Tema güncellenemedi')
    } else {
      setFeedbackType('success')
      setFeedback(`Tema ${nextTheme === 'dark' ? 'koyu' : 'açık'} moda alındı.`)
=======
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
>>>>>>> codex-restore-ux
    }
  }

  return (
    <div className="space-y-8">
<<<<<<< HEAD
      <div className="rounded-3xl bg-surface p-8 shadow-sm transition-colors duration-300 dark:bg-surface-dark">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Ayarlar</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Profil bilgilerinizi ve çalışma alışkanlıklarınızı yönetin.</p>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            feedbackType === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
          }`}
        >
          {feedback}
        </div>
      )}

      <section className="rounded-3xl border border-gray-200 bg-surface p-6 transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profil</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Adınızı ve iletişim bilgilerinizi güncelleyin.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ad Soyad</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Örn. Elif Aksoy" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
=======
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
>>>>>>> codex-restore-ux
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <Button className="mt-6" onClick={updateProfile}>
          Profili Kaydet
        </Button>
      </section>

<<<<<<< HEAD
      <section className="rounded-3xl border border-gray-200 bg-surface p-6 transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bildirimler</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Takipte kalmak için tercih ettiğiniz bildirimleri seçin.</p>
        </div>
        <div className="space-y-4">
          {[{
            label: 'E-posta Bildirimleri',
            description: 'Önemli gelişmelerde e-posta almak için etkinleştirin.',
            checked: emailNotifications,
            onChange: setEmailNotifications
          }, {
            label: 'Anlık Bildirimler',
            description: 'Görev güncellemelerinde anında bildirim alın.',
            checked: pushNotifications,
            onChange: setPushNotifications
          }, {
            label: 'Haftalık Özet',
            description: 'Her pazartesi haftalık rapor alın.',
            checked: weeklySummary,
            onChange: setWeeklySummary
          }].map((item) => (
            <label key={item.label} className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 transition-colors duration-300 dark:border-gray-700">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
              </div>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={(event) => item.onChange(event.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent"
              />
            </label>
          ))}
=======
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
>>>>>>> codex-restore-ux
        </div>
        <Button className="mt-6" variant="secondary" onClick={updateNotifications}>
          Tercihleri Kaydet
        </Button>
      </section>

<<<<<<< HEAD
      <section className="rounded-3xl border border-gray-200 bg-surface p-6 transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Görünüm</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Arayüz temasını seçerek çalışma alanınızı kişiselleştirin.</p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Tema Modu</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{theme === 'dark' ? 'Koyu modu kullanıyorsunuz.' : 'Aydınlık ve ferah tema aktif.'}</p>
          </div>
          <button
            type="button"
            onClick={handleThemeToggle}
            className={`relative inline-flex h-10 w-20 items-center rounded-full border px-2 transition-colors duration-300 ${
              theme === 'dark'
                ? 'border-accent bg-accent/20 text-accent'
                : 'border-gray-300 bg-gray-200 text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
            }`}
          >
            <span
              className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white text-xs font-semibold shadow transition ${
                theme === 'dark' ? 'translate-x-9 text-accent' : 'translate-x-0 text-gray-600'
              }`}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </span>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
              {savingTheme ? 'Kaydediliyor…' : theme === 'dark' ? 'Koyu' : 'Açık'}
            </span>
          </button>
        </div>
        {profile.role === 'admin' && (
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">Rolünüz: Yönetici. Tüm çalışma alanı verilerini görüntüleyebilirsiniz.</p>
        )}
=======
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
>>>>>>> codex-restore-ux
      </section>
    </div>
  )
}
