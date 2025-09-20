'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/sections/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Users, PlusCircle } from 'lucide-react'

type Client = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', role: 'müşteri' })
  const [loading, setLoading] = useState(false)

  // ✅ API'den verileri çek
  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) throw new Error('Veri alınamadı')
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Müşteri listesi alınamadı:', err)
      setClients([])
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  // ✅ Yeni müşteri ekle
  const handleAddClient = async () => {
    if (!form.full_name || !form.email) return
    setLoading(true)

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Kayıt eklenemedi')
      }

      await fetchClients()
      setIsModalOpen(false)
      setForm({ full_name: '', email: '', role: 'müşteri' })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      {/* Header */}
      <header
        className="rounded-2xl p-6 flex items-center justify-between text-white shadow-sm"
        style={{ background: "linear-gradient(to right, #FF5E4A, #FA7C6B)" }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Müşteriler
          </h1>
          <p className="mt-1 text-sm text-white/90">
            Tüm müşteri hesaplarını yönetin, yeni hesaplar açın veya düzenleyin.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 bg-white text-[#FF5E4A] hover:bg-gray-100"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni Müşteri Ekle
        </Button>
      </header>

      {/* Client List */}
      <Card
        title="Müşteri Listesi"
        description="Panelde kayıtlı tüm müşteri hesaplarını görüntüleyin."
        className="overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-gray-600">
              <tr>
                <th className="py-3">Ad Soyad</th>
                <th className="py-3">E-posta</th>
                <th className="py-3">Rol</th>
                <th className="py-3">Oluşturulma</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(clients ?? []).map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 font-medium">{client.full_name}</td>
                  <td className="py-3 text-gray-500">{client.email}</td>
                  <td className="py-3 capitalize">{client.role}</td>
                  <td className="py-3 text-xs text-gray-400">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && (
            <p className="text-sm text-gray-500 py-6 text-center">
              Henüz müşteri eklenmedi.
            </p>
          )}
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Müşteri Ekle"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Ad Soyad</label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Müşteri adı"
            />
          </div>
          <div>
            <label className="text-sm font-medium">E-posta</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ornek@mail.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Rol</label>
            <Select
              value={form.role}
              onValueChange={(val) => setForm({ ...form, role: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rol seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="müşteri">Müşteri</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAddClient}
            className="w-full bg-[#FF5E4A] hover:bg-[#FA7C6B] text-white"
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
