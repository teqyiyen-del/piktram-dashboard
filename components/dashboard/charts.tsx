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
    <div className="w-full h-full">
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
          maintainAspectRatio: false,
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#6B7280' } // gri daha okunabilir
            },
            y: {
              grid: { color: '#F3F4F6' },
              ticks: { stepSize: 1, color: '#6B7280' }
            }
          }
        }}
      />
    </div>
  )
}

export function ProjectProgressDonut({ completed, remaining }: ProgressChartProps) {
  return (
    <div className="w-full h-full">
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
          maintainAspectRatio: false,
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                color: '#6B7280'
              }
            }
          }
        }}
      />
    </div>
  )
}
