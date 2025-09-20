'use client'

import { useState } from 'react'
import { Card } from '@/components/sections/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Cog, LogOut } from 'lucide-react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'

export default function AdminSettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [twoFA, setTwoFA] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState(true)

  const supabase = useSupabaseClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      {/* Gradient Header */}
      <header
        className="rounded-2xl p-6 text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Cog className="h-6 w-6" />
            Admin Ayarları
          </h1>
          <p className="mt-1 text-sm text-white/90">
            Sistem yapılandırmasını, kullanıcı yetkilerini ve güvenlik ayarlarını yönetin.
          </p>
        </div>
      </header>

      {/* Kullanıcı Yönetimi */}
      <Card
        title="Kullanıcı Yönetimi"
        description="Admin ekleyin, kaldırın veya yetkilerini düzenleyin."
      >
        <div className="flex items-center justify-between rounded-xl border p-4 dark:border-gray-700">
          <div>
            <p className="text-sm font-medium">Mevcut Adminler</p>
            <p className="text-xs text-gray-500">halil@piktram.com</p>
          </div>
          <Button size="sm" variant="outline">
            Yeni Admin Ekle
          </Button>
        </div>
      </Card>

      {/* Güvenlik */}
      <Card
        title="Güvenlik"
        description="Hesap güvenliğini artırmak için seçenekleri etkinleştirin."
      >
        <div className="flex items-center justify-between py-2">
          <span>İki Faktörlü Doğrulama (2FA)</span>
          <Switch checked={twoFA} onCheckedChange={setTwoFA} />
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Aktif Oturumları Gör</span>
          <Button size="sm" variant="outline">
            Görüntüle
          </Button>
        </div>
      </Card>

      {/* Bildirimler */}
      <Card
        title="Bildirimler"
        description="Admin bildirimlerini yönetin."
      >
        <div className="flex items-center justify-between py-2">
          <span>Sistem E-postaları</span>
          <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Kritik Hata Bildirimleri</span>
          <Switch />
        </div>
      </Card>

      {/* Tema */}
      <Card
        title="Tema"
        description="Panelin görünümünü kişiselleştirin."
      >
        <div className="flex items-center justify-between">
          <span>Koyu Tema</span>
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
        </div>
      </Card>

      {/* Logout */}
      <Card title="Hesap" description="Oturumunuzu kapatın.">
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Çıkış Yap
        </Button>
      </Card>
    </div>
  )
}
