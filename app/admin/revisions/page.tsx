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
    const { data } = await supabase
      .from('revisions')
      .select(
        'id, description, created_at, tasks(title), profiles(full_name, email)'
      )
      .order('created_at', { ascending: false })
    setRevisions(data || [])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Revizyonlar</h1>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {revisions.length === 0 ? (
          <p className="text-sm text-gray-500">
            Henüz revizyon kaydı bulunmuyor.
          </p>
        ) : (
          revisions.map((rev) => (
            <div
              key={rev.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex justify-between text-xs text-gray-500">
                <span className="font-semibold text-gray-900">
                  {rev.tasks?.title ?? 'Görev'}
                </span>
                <span>{formatDateTime(rev.created_at)}</span>
              </div>
              <p className="mt-1 text-sm text-gray-700">{rev.description}</p>
              <p className="mt-1 text-xs text-gray-500">
                {rev.profiles?.full_name ??
                  rev.profiles?.email ??
                  'Bilinmeyen Kullanıcı'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
