'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

interface ReportChartPoint {
  label: string
  followers: number
  likes: number
  posts: number
}

interface WeeklyReportsChartProps {
  data: ReportChartPoint[]
}

interface MonthlyReportsChartProps {
  data: ReportChartPoint[]
}

const followersColor = '#FF5E4A'
const likesColor = '#6366F1'
const postsColor = '#34D399'

export function WeeklyReportsChart({ data }: WeeklyReportsChartProps) {
  return (
    <Bar
      data={{
        labels: data.map((item) => item.label),
        datasets: [
          {
            label: 'Takipçi Artışı',
            data: data.map((item) => item.followers),
            backgroundColor: followersColor,
            borderRadius: 12,
            maxBarThickness: 36
          },
          {
            label: 'Beğeni',
            data: data.map((item) => item.likes),
            backgroundColor: likesColor,
            borderRadius: 12,
            maxBarThickness: 36
          },
          {
            label: 'Paylaşılan İçerik',
            data: data.map((item) => item.posts),
            backgroundColor: postsColor,
            borderRadius: 12,
            maxBarThickness: 36
          }
        ]
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            stacked: false
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148, 163, 184, 0.2)' }
          }
        }
      }}
    />
  )
}

export function MonthlyReportsChart({ data }: MonthlyReportsChartProps) {
  return (
    <Line
      data={{
        labels: data.map((item) => item.label),
        datasets: [
          {
            label: 'Takipçi',
            data: data.map((item) => item.followers),
            borderColor: followersColor,
            backgroundColor: `${followersColor}33`,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Beğeni',
            data: data.map((item) => item.likes),
            borderColor: likesColor,
            backgroundColor: `${likesColor}33`,
            tension: 0.4,
            fill: true
          },
          {
            label: 'İçerik',
            data: data.map((item) => item.posts),
            borderColor: postsColor,
            backgroundColor: `${postsColor}33`,
            tension: 0.4,
            fill: true
          }
        ]
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148, 163, 184, 0.2)' }
          }
        }
      }}
    />
  )
}
