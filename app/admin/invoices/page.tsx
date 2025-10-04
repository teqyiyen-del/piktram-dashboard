'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDate } from '@/lib/utils'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function InvoicesPage() {
  const supabase = createClientComponentClient<Database>()
  const [invoices, setInvoices] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)

  // form state
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [currency, setCurrency] = useState('TRY')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select(
        'id, title, amount, currency, status, due_date, created_at, profiles(full_name, email, company)'
      )
      .order('created_at', { ascending: false })

    if (error) console.error('Faturalar alınamadı:', error.message)
    setInvoices(data || [])
  }

  async function createInvoice() {
    if (!title.trim() || !amount) {
      alert('Başlık ve tutar zorunlu.')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('invoices').insert({
      title,
      amount,
      currency,
      status: 'pending',
      due_date: dueDate || new Date().toISOString(),
      user_id: null // ❗ burada sabit müşteri/oturum bilgisine göre değiştirebilirsin
    })

    setLoading(false)

    if (error) {
      alert('Fatura eklenemedi: ' + error.message)
    } else {
      resetForm()
      fetchInvoices()
    }
  }

  function resetForm() {
    setTitle('')
    setAmount('')
    setCurrency('TRY')
    setDueDate('')
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
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  İptal
                </Button>
                <Button onClick={createInvoice} disabled={loading}>
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
