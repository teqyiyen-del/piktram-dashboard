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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Haftalık Görev Tamamlama</h3>
      <div className="mt-4">
        <Bar
          data={{
            labels: data.map((item) => item.label),
            datasets: [
              {
                label: 'Tamamlanan Görevler',
                data: data.map((item) => item.value),
                backgroundColor: '#FF5E4A',
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
                grid: { display: false }
              },
              y: {
                grid: { color: '#f1f1f1' },
                ticks: { stepSize: 1 }
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
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Proje İlerleme Durumu</h3>
      <div className="mt-4">
        <Doughnut
          data={{
            labels: ['Tamamlanan', 'Devam Eden'],
            datasets: [
              {
                data: [completed, remaining],
                backgroundColor: ['#FF5E4A', '#E5E7EB'],
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
                  usePointStyle: true
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
}
