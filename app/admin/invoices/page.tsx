'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDate } from '@/lib/utils'

export default function InvoicesPage() {
  const supabase = createClientComponentClient<Database>()
  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {
    const { data } = await supabase
      .from('invoices')
      .select('id, title, amount, currency, status, due_date, created_at, profiles(full_name, email)')
      .order('created_at', { ascending: false })
    setInvoices(data || [])
  }

  async function createInvoice() {
    const title = prompt('Fatura başlığı girin:')
    const amount = Number(prompt('Tutar girin:'))
    const currency = prompt('Para birimi girin (ör. TRY, USD):') || 'TRY'
    const status = 'pending'

    if (!title || !amount) return

    const { error } = await supabase.from('invoices').insert({
      title,
      amount,
      currency,
      status,
      due_date: new Date().toISOString()
    })

    if (error) {
      alert('Fatura eklenemedi: ' + error.message)
    } else {
      fetchInvoices()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Faturalar</h1>
        <button
          onClick={createInvoice}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80"
        >
          + Fatura Ekle
        </button>
      </div>

      {/* Liste */}
      <div className="overflow-hidden rounded-lg border bg-white">
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
                  </td>
                  <td className="px-4 py-2">{formatDate(inv.due_date)}</td>
                  <td className="px-4 py-2">{formatDate(inv.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
