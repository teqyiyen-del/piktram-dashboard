'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/sections/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Users, PlusCircle, Trash2, Pencil } from 'lucide-react'
import { useCustomer } from '@/components/providers/customer-provider'

type Client = {
  id: string
  full_name?: string | null
  email?: string | null
  role?: string | null
  company?: string | null
  created_at?: string | null
  tax_no?: string | null
  sector?: string | null
}

export default function ClientsPage() {
  const router = useRouter()
  const { setSelectedCustomer } = useCustomer()
  const [clients, setClients] = useState<Client[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: 'user',
    company: '',
    tax_no: '',
    sector: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data?.error ?? 'Müşteri listesi alınamadı')
        setClients([])
        return
      }
      setClients(Array.isArray(data) ? data : [])
    } catch (err) {
      setErrorMsg('Sunucuya bağlanılamıyor')
      setClients([])
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleSaveClient = async () => {
    if (!form.full_name || !form.email || !form.tax_no || !form.sector || !form.password) {
      setErrorMsg('Ad Soyad, E-posta, Vergi No, Sektör ve Şifre zorunludur')
      return
    }
    setLoading(true)
    setErrorMsg(null)

    try {
      const url = editingClient ? `/api/clients?id=${editingClient.id}` : '/api/clients'
      const method = editingClient ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data?.error ?? 'Kayıt eklenemedi')
        return
      }

      setIsModalOpen(false)
      setEditingClient(null)
      setForm({ full_name: '', email: '', role: 'user', company: '', tax_no: '', sector: '', password: '' })
      await fetchClients()
    } catch (err) {
      setErrorMsg('Kayıt sırasında hata oldu')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Bu müşteriyi silmek istediğine emin misin?')) return
    try {
      const res = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setErrorMsg(data?.error ?? 'Silinemedi')
        return
      }
      await fetchClients()
    } catch (err) {
      setErrorMsg('Silme sırasında hata')
    }
  }

  const handleSelectClient = (id: string) => {
    setSelectedCustomer(id)
    router.push(`/admin/projects?client=${id}`)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setForm({
      full_name: client.full_name ?? '',
      email: client.email ?? '',
      role: client.role ?? 'user',
      company: client.company ?? '',
      tax_no: client.tax_no ?? '',
      sector: client.sector ?? '',
      password: '' // şifreyi boş bırakıyoruz
    })
    setIsModalOpen(true)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      <header className="rounded-2xl p-6 flex items-center justify-between text-white shadow-sm" style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2"><Users className="h-6 w-6" /> Müşteriler</h1>
          <p className="mt-1 text-sm text-white/90">Tüm müşteri hesaplarını yönetin, yeni hesaplar açın veya düzenleyin.</p>
        </div>
        <Button onClick={() => { setIsModalOpen(true); setEditingClient(null); }} className="gap-2 bg-white text-[#FF5E4A] hover:bg-gray-100">
          <PlusCircle className="h-4 w-4" /> Yeni Müşteri Ekle
        </Button>
      </header>

      {errorMsg && <div className="text-sm text-red-500">{errorMsg}</div>}

      <Card title="Müşteri Listesi" description="Panelde kayıtlı tüm müşteri hesaplarını görüntüleyin." className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-gray-600">
              <tr>
                <th className="py-3">Ad Soyad</th>
                <th className="py-3">E-posta</th>
                <th className="py-3">Şirket</th>
                <th className="py-3">Vergi No</th>
                <th className="py-3">Sektör</th>
                <th className="py-3">Rol</th>
                <th className="py-3">Oluşturulma</th>
                <th className="py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clients.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-medium">{c.full_name ?? '—'}</td>
                  <td className="py-3 text-gray-500">{c.email ?? '—'}</td>
                  <td className="py-3">{c.company ?? '—'}</td>
                  <td className="py-3">{c.tax_no ?? '—'}</td>
                  <td className="py-3">{c.sector ?? '—'}</td>
                  <td className="py-3 capitalize">{c.role ?? '—'}</td>
                  <td className="py-3 text-xs text-gray-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</td>
                  <td className="py-3 flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleSelectClient(c.id)}>Seç</Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditClient(c)}><Pencil className="h-4 w-4" /> Düzenle</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClient(c.id)}><Trash2 className="h-4 w-4" /> Sil</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && <p className="text-sm text-gray-500 py-6 text-center">Henüz müşteri eklenmedi.</p>}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Ad Soyad</label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Müşteri adı" />
          </div>
          <div>
            <label className="text-sm font-medium">E-posta</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ornek@mail.com" />
          </div>
          <div>
            <label className="text-sm font-medium">Şirket</label>
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Şirket adı" />
          </div>
          <div>
            <label className="text-sm font-medium">Vergi No</label>
            <Input value={form.tax_no} onChange={(e) => setForm({ ...form, tax_no: e.target.value })} placeholder="1234567890" />
          </div>
          <div>
            <label className="text-sm font-medium">Sektör</label>
            <Input value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} placeholder="Örn: Teknoloji, Finans" />
          </div>
          <div>
            <label className="text-sm font-medium">Şifre</label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="******" />
          </div>
          <div>
            <label className="text-sm font-medium">Rol</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-md border px-3 py-2">
              <option value="user">User</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button onClick={handleSaveClient} className="w-full bg-[#FF5E4A] hover:bg-[#FA7C6B] text-white" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
