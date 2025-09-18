'use client'

import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

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
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-[#FF5E4A]">
        Haftalık Görev Tamamlama
      </h3>
      {/* Chart container */}
      <div className="mt-4 w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[360px]">
        <Bar
          data={{
            labels: data.map((item) => item.label),
            datasets: [
              {
                label: 'Tamamlanan Görevler',
                data: data.map((item) => item.value),
                backgroundColor: '#FF5E4A',
                borderRadius: 10
              }
            ]
          }}
          options={{
            maintainAspectRatio: false, // responsive yükseklik için kritik
            responsive: true,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#FF5E4A' }
              },
              y: {
                grid: { color: '#FFE4DE' },
                ticks: { stepSize: 1, color: '#FF5E4A' }
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
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-[#FF5E4A]">
        Genel Proje İlerleme
      </h3>
      {/* Chart container */}
      <div className="mt-4 w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-[360px]">
        <Doughnut
          data={{
            labels: ['Tamamlanan', 'Devam Eden'],
            datasets: [
              {
                data: [completed, remaining],
                backgroundColor: ['#FF5E4A', '#FFE4DE'],
                borderWidth: 0
              }
            ]
          }}
          options={{
            maintainAspectRatio: false, // responsive yükseklik için kritik
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  color: '#FF5E4A'
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
}
