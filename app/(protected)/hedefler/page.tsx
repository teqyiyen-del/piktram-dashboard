'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { SectionHeader } from '@/components/layout/section-header'
import { formatDate } from '@/lib/utils'

export default function HedeflerPage() {
  const supabase = createClientComponentClient<Database>()
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [])

  async function fetchGoals() {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) console.error('Hedefler alınamadı:', error.message)
    setGoals(data || [])
    setLoading(false)
  }

  // %100 olanlar ayrı listeye düşsün
  const completedGoals = goals.filter((g) => g.is_completed || g.progress === 100)
  const activeGoals = goals.filter((g) => !(g.is_completed || g.progress === 100))

  return (
    <div className="space-y-10 px-layout-x py-layout-y">
      {/* Section Header */}
      <SectionHeader
        title="Hedeflerim"
        subtitle="Admin tarafından size özel tanımlanan yol haritası ve hedefler."
        badge="Performans"
        gradient
      />

      {/* Aktif Hedefler */}
      <Card title="Genel Yol Haritası" description="Admin tarafından belirlenen öncelikler">
        {loading ? (
          <p className="text-sm text-gray-500">Yükleniyor...</p>
        ) : activeGoals.length > 0 ? (
          <ul className="space-y-3">
            {activeGoals.map((g) => (
              <li
                key={g.id}
                className="rounded-lg border p-4 shadow-sm bg-white dark:bg-surface-dark"
              >
                <div className="flex justify-between">
                  <h3 className="font-semibold">{g.title}</h3>
                  <span className="text-xs text-gray-500">
                    {g.due_date ? formatDate(g.due_date) : 'Tarih yok'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {g.description ?? 'Açıklama yok'}
                </p>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${g.progress === 100 ? 'bg-green-500' : 'bg-accent'}`}
                      style={{ width: `${g.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{g.progress || 0}% tamamlandı</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Henüz aktif hedef yok.</p>
        )}
      </Card>

      {/* Ulaşılmış Hedefler */}
      <Card title="Ulaşılmış Hedefler" description="Tamamlanan hedefler burada listelenir.">
        {loading ? (
          <p className="text-sm text-gray-500">Yükleniyor...</p>
        ) : completedGoals.length > 0 ? (
          <ul className="space-y-3">
            {completedGoals.map((g) => (
              <li
                key={g.id}
                className="rounded-lg border p-4 shadow-sm bg-green-50 border-green-200 dark:bg-surface-dark"
              >
                <div className="flex justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    {g.title} <span className="text-green-600 text-xs">✔</span>
                  </h3>
                  <span className="text-xs text-gray-500">
                    {g.due_date ? formatDate(g.due_date) : 'Tarih yok'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {g.description ?? 'Açıklama yok'}
                </p>
                <p className="text-xs text-green-600 mt-2">Tamamlandı (%100)</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Henüz tamamlanmış hedef yok.</p>
        )}
      </Card>
    </div>
  )
}
