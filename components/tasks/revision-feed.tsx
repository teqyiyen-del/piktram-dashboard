'use client'

import { useEffect, useState } from 'react'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/providers/toast-provider'

interface RevisionItem {
  id: string
  task_id: string
  description: string
  created_at: string
  user_id: string
  task_title: string
  author?: {
    full_name: string | null
    email: string | null
  } | null
}

interface RevisionFeedProps {
  initialRevisions: RevisionItem[]
}

function RevisionFeed({ initialRevisions }: RevisionFeedProps) {
  const [revisions, setRevisions] = useState<RevisionItem[]>(initialRevisions)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setRevisions(initialRevisions)
  }, [initialRevisions])

  const refresh = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/revisions')
      if (!response.ok) {
        const data = await response.json()
        toast({
          title: 'Revize geçmişi yüklenemedi',
          description: data.error ?? 'Bir hata oluştu.',
          variant: 'error'
        })
        return
      }
      const data = (await response.json()) as RevisionItem[]
      setRevisions(data)
    } catch (error) {
      toast({
        title: 'Revize geçmişi yüklenemedi',
        description: error instanceof Error ? error.message : 'Bir hata oluştu.',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revize Geçmişi</h3>
          <p className="text-sm text-gray-500">
            Tüm görevlerde yapılan yorum ve durum güncellemeleri.
          </p>
        </div>
        <Button variant="secondary" onClick={refresh} disabled={loading}>
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </Button>
      </div>
      {revisions.length === 0 ? (
        <p className="text-sm text-gray-500">Henüz revize kaydı bulunmuyor.</p>
      ) : (
        <div className="space-y-3">
          {revisions.map((revision) => (
            <div
              key={revision.id}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium text-gray-700">{revision.task_title}</span>
                <span>{formatDateTime(revision.created_at)}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {revision.author?.full_name ?? revision.author?.email ?? 'Bilinmeyen Kullanıcı'}
              </p>
              <p className="mt-2 text-sm text-gray-700">{revision.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RevisionFeed   // ✅ artık default export
