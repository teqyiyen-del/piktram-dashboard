'use client'

import { Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement)

interface WeeklyChartProps {
  data: { label: string; value: number }[]
}

interface ProgressChartProps {
  completed: number
  remaining: number
}

export function WeeklyCompletionChart({ data }: WeeklyChartProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Haftalık Görev Tamamlama</h3>
      <div className="mt-4">
        <Bar
          data={{
            labels: data.map((item) => item.label),
            datasets: [
              {
                label: 'Tamamlanan Görevler',
                data: data.map((item) => item.value),
                backgroundColor: '#FF6B35',
                borderRadius: 12
              }
            ]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#9CA3AF' }
              },
              y: {
                grid: { color: 'rgba(148, 163, 184, 0.15)' },
                ticks: { stepSize: 1, color: '#9CA3AF' }
              }
            }
          }}
        />
      </div>
    </div>
  )
}

export function ProjectProgressDonut({ completed, remaining }: ProgressChartProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm transition-colors duration-300 dark:border-gray-700 dark:bg-surface-dark">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proje İlerleme Durumu</h3>
      <div className="mt-4">
        <Doughnut
          data={{
            labels: ['Tamamlanan', 'Devam Eden'],
            datasets: [
              {
                data: [completed, remaining],
                backgroundColor: ['#FF6B35', '#E5E7EB'],
                borderWidth: 0
              }
            ]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  color: '#9CA3AF'
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
}
