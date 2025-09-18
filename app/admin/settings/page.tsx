'use client'

import { useState } from 'react'
import { Card } from '@/components/sections/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectItem } from '@/components/ui/select'
import { Cog } from 'lucide-react'

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('Piktram Admin Paneli')
  const [defaultLang, setDefaultLang] = useState('tr')
  const [defaultTheme, setDefaultTheme] = useState<'light' | 'dark'>('light')
  const [twoFA, setTwoFA] = useState(false)
  const [emailAlerts, setEmailAlerts] = useState(true)

  return (
    <div className="space-y-10">
      {/* Sayfa başlığı */}
      <header className="rounded-3xl bg-surface p-8 shadow-sm dark:bg-surface-dark">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Cog className="h-6 w-6 text-accent" />
          Admin Ayarları
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Sistem yapılandırmasını, kullanıcı yetkilerini ve güvenlik ayarlarını yönetin.
        </p>
      </header>

      {/* Sistem Genel Ayarları */}
      <Card
        title="Sistem Genel Ayarları"
        description="Panelin genel yapılandırmasını buradan düzenleyin."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Site Adı</label>
            <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Varsayılan Dil</label>
            <Select value={defaultLang} onChange={(e) => setDefaultLang(e.target.value)}>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <Button>Kaydet</Button>
        </div>
      </Card>

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
          <Switch checked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} />
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
          <Switch checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
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
        <div className="flex gap-3">
          <Button
            variant={defaultTheme === 'light' ? 'default' : 'outline'}
            onClick={() => setDefaultTheme('light')}
          >
            Açık Tema
          </Button>
          <Button
            variant={defaultTheme === 'dark' ? 'default' : 'outline'}
            onClick={() => setDefaultTheme('dark')}
          >
            Koyu Tema
          </Button>
        </div>
      </Card>
    </div>
  )
}
