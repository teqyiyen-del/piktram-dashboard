'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/supabase-types'

type ChartData = {
  label: string
  value: number
  color: string
}

export default function StatusChart() {
  const supabase = createClientComponentClient<Database>()
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Status normalizasyonu (kanban ile uyumlu)
  const normalizeStatus = (status: string): string => {
    switch (status) {
      case 'onay_surecinde':
      case 'in_review':
        return 'in_review'
      case 'yapiliyor':
      case 'in_progress':
        return 'in_progress'
      case 'revize':
      case 'revision':
        return 'revision'
      case 'onaylandi':
      case 'approved':
        return 'approved'
      case 'paylasildi':
      case 'published':
        return 'published'
      default:
        return status
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: workflows } = await supabase
        .from('workflows')
        .select('id, status')

      const normalized = (workflows ?? []).map((w) => normalizeStatus(w.status))

      const yapiliyorCount = normalized.filter((s) => s === 'in_progress').length
      const awaitingCount = normalized.filter((s) => s === 'in_review').length
      const revizeCount = normalized.filter((s) => s === 'revision').length
      const onaylandiCount = normalized.filter((s) => s === 'approved').length
      const paylasildiCount = normalized.filter((s) => s === 'published').length

      setData([
        { label: 'Yapılıyor', value: yapiliyorCount, color: '#3B82F6' },
        { label: 'Onay Sürecinde', value: awaitingCount, color: '#F97316' },
        { label: 'Revize', value: revizeCount, color: '#EF4444' },
        { label: 'Onaylandı', value: onaylandiCount, color: '#22C55E' },
        { label: 'Paylaşıldı', value: paylasildiCount, color: '#A855F7' },
      ])

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center text-sm text-gray-500">
        Yükleniyor...
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center text-sm text-gray-500">
        Henüz grafik verisi yok
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />

        <XAxis
          dataKey="label"
          tick={{ fill: '#6B7280', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          allowDecimals={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          formatter={(value: number) => [`${value} görev`, '']}
          labelStyle={{ fontWeight: '600', color: '#374151' }}
        />

        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={40}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
