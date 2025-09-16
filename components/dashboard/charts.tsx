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
<<<<<<< HEAD
    <div className="card-section">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Haftalık Görev Tamamlama</h3>
      <div className="mt-6">
=======
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Haftalık Görev Tamamlama</h3>
      <div className="mt-4">
>>>>>>> codex-restore-ux
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
<<<<<<< HEAD
                grid: { display: false },
                ticks: { color: '#9CA3AF' }
              },
              y: {
                grid: { color: 'rgba(148, 163, 184, 0.15)' },
                ticks: { stepSize: 1, color: '#9CA3AF' }
=======
                grid: { display: false }
              },
              y: {
                grid: { color: '#f1f1f1' },
                ticks: { stepSize: 1 }
>>>>>>> codex-restore-ux
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
<<<<<<< HEAD
    <div className="card-section">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proje İlerleme Durumu</h3>
      <div className="mt-6">
=======
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Proje İlerleme Durumu</h3>
      <div className="mt-4">
>>>>>>> codex-restore-ux
        <Doughnut
          data={{
            labels: ['Tamamlanan', 'Devam Eden'],
            datasets: [
              {
                data: [completed, remaining],
<<<<<<< HEAD
                backgroundColor: ['#FF5E4A', '#E9EBF0'],
=======
                backgroundColor: ['#FF5E4A', '#E5E7EB'],
>>>>>>> codex-restore-ux
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
<<<<<<< HEAD
                  usePointStyle: true,
                  color: '#9CA3AF'
=======
                  usePointStyle: true
>>>>>>> codex-restore-ux
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
}
