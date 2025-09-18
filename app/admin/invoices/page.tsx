'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDate } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Client = {
  id: string
  full_name: string | null
  email: string | null
  company: string | null
}

export default function InvoicesPage() {
  const supabase = createClientComponentClient<Database>()
  const [invoices, setInvoices] = useState<any[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  // form state
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [currency, setCurrency] = useState('TRY')
  const [dueDate, setDueDate] = useState('')
  const [invoiceClient, setInvoiceClient] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchClients()
    fetchInvoices()
  }, [])

  async function fetchClients() {
    const { data } = await supabase.from('profiles').select('id, full_name, email, company')
    setClients(data || [])
  }

  async function fetchInvoices(clientId?: string | null) {
    let query = supabase
      .from('invoices')
      .select('id, title, amount, currency, status, due_date, created_at, profiles(full_name, email, company)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('user_id', clientId)

    const { data } = await query
    setInvoices(data || [])
  }

  async function createInvoice() {
    if (!title.trim() || !amount || !invoiceClient) {
      alert('Başlık, tutar ve müşteri seçimi zorunlu.')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('invoices').insert({
      title,
      amount,
      currency,
      status: 'pending',
      due_date: dueDate || new Date().toISOString(),
      user_id: invoiceClient
    })

    setLoading(false)

    if (error) {
      alert('Fatura eklenemedi: ' + error.message)
    } else {
      resetForm()
      fetchInvoices(selectedClient)
    }
  }

  function resetForm() {
    setTitle('')
    setAmount('')
    setCurrency('TRY')
    setDueDate('')
    setInvoiceClient(null)
    setShowModal(false)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      {/* Header */}
      <header
        className="rounded-2xl p-6 flex items-center justify-between text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Faturalar</h1>
          <p className="mt-1 text-sm text-white/90">
            Müşterilerinize ait faturaları görüntüleyin ve yönetin.
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="gap-2 bg-white text-[#FF5E4A] hover:bg-gray-100"
        >
          <PlusCircle className="h-4 w-4" />
          Yeni Fatura
        </Button>
      </header>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={selectedClient ?? ''}
          onChange={(e) => {
            setSelectedClient(e.target.value || null)
            fetchInvoices(e.target.value || null)
          }}
          className="w-64 rounded-md border px-2 py-1"
        >
          <option value="">Tüm Müşteriler</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name ?? c.email} {c.company ? `- ${c.company}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Liste */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
            <tr>
              <th className="px-4 py-2">Başlık</th>
              <th className="px-4 py-2">Tutar</th>
              <th className="px-4 py-2">Durum</th>
              <th className="px-4 py-2">Müşteri</th>
              <th className="px-4 py-2">Son Tarih</th>
              <th className="px-4 py-2">Oluşturma</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Henüz fatura yok.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-2">{inv.title}</td>
                  <td className="px-4 py-2">
                    {inv.amount} {inv.currency}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        inv.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {inv.status === 'paid' ? 'Ödendi' : 'Beklemede'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {inv.profiles?.full_name ?? inv.profiles?.email ?? 'Bilinmiyor'}
                    {inv.profiles?.company ? ` (${inv.profiles.company})` : ''}
                  </td>
                  <td className="px-4 py-2">{formatDate(inv.due_date)}</td>
                  <td className="px-4 py-2">{formatDate(inv.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Yeni Fatura Ekle</h2>
            <div className="mt-4 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Başlık"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Tutar"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <select
                value={invoiceClient ?? ''}
                onChange={(e) => setInvoiceClient(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Müşteri seçin</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name ?? c.email} {c.company ? `- ${c.company}` : ''}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  İptal
                </Button>
                <Button
                  onClick={createInvoice}
                  disabled={loading}
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
