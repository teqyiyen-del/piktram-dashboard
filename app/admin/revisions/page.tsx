'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDateTime } from '@/lib/utils'

type Client = {
  id: string
  full_name: string | null
  email: string | null
  company: string | null
}

export default function RevisionsPage() {
  const supabase = createClientComponentClient<Database>()
  const [revisions, setRevisions] = useState<any[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
    fetchRevisions()
  }, [])

  async function fetchClients() {
    const { data } = await supabase.from('profiles').select('id, full_name, email, company')
    setClients(data || [])
  }

  async function fetchRevisions(clientId?: string | null) {
    let query = supabase
      .from('revisions')
      .select('id, description, created_at, tasks(id, title, status), profiles(full_name, email, company)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('user_id', clientId)

    const { data } = await query
    setRevisions(data || [])
  }

  const activeRevisions = revisions.filter(
    (rev) => rev.tasks?.status === 'revize' || rev.tasks?.status === 'in_review'
  )
  const pastRevisions = revisions.filter(
    (rev) => rev.tasks?.status === 'approved' || rev.tasks?.status === 'published' || rev.tasks?.status === 'onaylandi' || rev.tasks?.status === 'paylasildi'
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 pb-12">
      {/* Header */}
      <header
        className="rounded-2xl p-6 flex items-center justify-between text-white shadow-sm"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            Revizyonlar
          </h1>
          <p className="mt-1 text-sm text-white/90">
            Müşterilere ait revizyonları görüntüleyin.
          </p>
        </div>
        <select
          value={selectedClient ?? ''}
          onChange={(e) => {
            setSelectedClient(e.target.value || null)
            fetchRevisions(e.target.value || null)
          }}
          className="rounded-lg border px-3 py-2 text-sm text-gray-900"
        >
          <option value="">Tüm Müşteriler</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name ?? c.email} {c.company ? `- ${c.company}` : ''}
            </option>
          ))}
        </select>
      </header>

      {/* Aktif Revizyonlar */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Aktif Revizyonlar</h2>
        {activeRevisions.length === 0 ? (
          <p className="text-sm text-gray-500">Aktif revizyon bulunmuyor.</p>
        ) : (
          <div className="space-y-3">
            {activeRevisions.map((rev) => (
              <div
                key={rev.id}
                className="rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="font-semibold text-gray-900">
                    {rev.tasks?.title ?? 'Görev'}
                  </span>
                  <span>{formatDateTime(rev.created_at)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-700">{rev.description}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Müşteri: {rev.profiles?.full_name ?? rev.profiles?.email}{' '}
                  {rev.profiles?.company ? `(${rev.profiles.company})` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Geçmiş Revizyonlar */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Geçmiş Revizyonlar</h2>
        {pastRevisions.length === 0 ? (
          <p className="text-sm text-gray-500">Geçmiş revizyon bulunmuyor.</p>
        ) : (
          <div className="space-y-3">
            {pastRevisions.map((rev) => (
              <div
                key={rev.id}
                className="rounded-lg border bg-gray-50 p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="font-semibold text-gray-900">
                    {rev.tasks?.title ?? 'Görev'}
                  </span>
                  <span>{formatDateTime(rev.created_at)}</span>
                </div>
                <p className="mt-1 text-sm text-gray-700">{rev.description}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Müşteri: {rev.profiles?.full_name ?? rev.profiles?.email}{' '}
                  {rev.profiles?.company ? `(${rev.profiles.company})` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
