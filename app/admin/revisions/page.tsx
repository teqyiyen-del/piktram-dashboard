'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { formatDateTime } from '@/lib/utils'

export default function RevisionsPage() {
  const supabase = createClientComponentClient<Database>()
  const [revisions, setRevisions] = useState<any[]>([])

  useEffect(() => {
    fetchRevisions()
  }, [])

  async function fetchRevisions() {
    const { data, error } = await supabase
      .from('revisions')
      .select('id, description, created_at, tasks(id, title, status), profiles(full_name, email, company)')
      .order('created_at', { ascending: false })

    if (error) console.error('Revizyonlar alınamadı:', error.message)
    setRevisions(data || [])
  }

  const activeRevisions = revisions.filter(
    (rev) => rev.tasks?.status === 'revize' || rev.tasks?.status === 'in_review'
  )
  const pastRevisions = revisions.filter(
    (rev) =>
      rev.tasks?.status === 'approved' ||
      rev.tasks?.status === 'published' ||
      rev.tasks?.status === 'onaylandi' ||
      rev.tasks?.status === 'paylasildi'
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
