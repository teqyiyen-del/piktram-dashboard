'use client'

import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface StatusChartData {
  label: string
  value: number
  color?: string
}

interface StatusChartProps {
  data: StatusChartData[]
}

export function StatusChart({ data }: StatusChartProps) {
  const chartData = useMemo(() => {
    return {
      labels: data.map((item) => item.label),
      datasets: [
        {
          label: 'Görev Dağılımı',
          data: data.map((item) => item.value),
          backgroundColor: data.map((item) => item.color ?? '#FF5E4A'),
          borderRadius: 12,
          maxBarThickness: 32
        }
      ]
    }
  }, [data])

  return (
    <Bar
      data={chartData}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => items[0]?.label ?? '',
              label: (item) => `${item.parsed.y} görev`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9CA3AF' }
          },
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.2)' },
            ticks: {
              stepSize: 1,
              color: '#9CA3AF'
            }
          }
        }
      }}
    />
  )
}
