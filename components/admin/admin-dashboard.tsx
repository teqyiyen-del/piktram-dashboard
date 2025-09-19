// components/admin/admin-dashboard.tsx
'use client'

import { useMemo } from 'react'
import { formatDate } from '@/lib/utils'
import { TaskStatus } from '@/lib/types'
import { WeeklyCompletionChart, ProjectProgressDonut } from '@/components/dashboard/charts'
import { TodayTasks } from '@/components/dashboard/today-tasks'
import { Card } from '@/components/sections/card'
import { FolderKanban, Users, FileText } from 'lucide-react'

type UserRecord = { id: string; full_name: string | null; email: string | null; role: string | null; created_at: string }
type ProjectRecord = { id: string; title: string; description: string | null; progress: number; due_date: string | null; user_id: string; created_at: string }
type TaskRecord = { id: string; title: string; status: TaskStatus; priority: 'low' | 'medium' | 'high'; due_date: string | null; user_id: string; attachment_url: string | null; created_at: string }
type GoalRecord = { id: string; title: string; description: string | null; is_completed: boolean; user_id: string; created_at: string }
type InvoiceRecord = { id: string; user_id: string; title: string; amount: number; currency: string; status: string; due_date: string | null; created_at: string }

interface AdminDashboardProps {
  currentUser: UserRecord
  users: UserRecord[]
  projects: ProjectRecord[]
  tasks: TaskRecord[]
  goals: GoalRecord[]
  invoices: InvoiceRecord[]
}

export default function AdminDashboard({
  currentUser,
  users = [],
  projects = [],
  tasks = [],
  goals = [],
  invoices = [],
}: AdminDashboardProps) {
  const recentClients = useMemo(() => users.slice(-5).reverse(), [users])
  const recentProjects = useMemo(() => projects.slice(-5).reverse(), [projects])
  const recentInvoices = useMemo(() => invoices.slice(-5).reverse(), [invoices])

  return (
    <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
      {/* Header */}
      <header
        className="rounded-2xl p-6 text-white mb-12 shadow-lg"
        style={{ background: "linear-gradient(to right, #FF5E4A, #FA7C6B)" }}
      >
        <h1 className="text-xl md:text-2xl font-semibold">
          Hoş geldin, {currentUser?.full_name ?? 'Admin'} 👋
        </h1>
        <p className="mt-1 text-sm text-white/90">
          Onay bekleyen içeriklerini gözden geçir, ajandanı planla ve işlerini yönet.
        </p>
      </header>

      {/* Stat kutular */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <StatMini value={tasks.filter(t => t.status === 'pending').length} label="Bekleyen Görev" />
        <StatMini value={projects.length} label="Aktif Proje" />
        <StatMini value={users.length} label="Kullanıcı" />
        <StatMini value={goals.length} label="Hedef" />
      </section>

      {/* Bugünkü Görevler */}
      <section className="mb-12">
        <Card title="Bugünkü Görevler" description="Tamamlanması gereken görevler" className="min-h-[220px]">
          <TodayTasks role="admin" tasks={tasks} />
        </Card>
      </section>

      {/* Alt Grid (Projeler, Yeni Müşteriler, Faturalar) */}
      <section className="grid gap-8 lg:grid-cols-3 mb-12">
        <Card title="Projeler" description="Son 5 proje" className="h-[300px] flex flex-col">
          <ul className="space-y-3 overflow-y-auto pr-2 flex-1">
            {recentProjects.length > 0 ? recentProjects.map((p) => (
              <li key={p.id} className="flex justify-between text-sm">
                <span>{p.title}</span>
                <span className="text-xs text-gray-400">
                  {p.due_date ? formatDate(p.due_date) : '—'}
                </span>
              </li>
            )) : <EmptyState icon={<FolderKanban className="h-5 w-5 text-gray-400" />} text="Henüz proje yok." />}
          </ul>
        </Card>

        <Card title="Yeni Müşteriler" description="Son eklenen 5 müşteri" className="h-[300px] flex flex-col">
          <ul className="space-y-3 overflow-y-auto pr-2 flex-1">
            {recentClients.length > 0 ? recentClients.map((c) => (
              <li key={c.id} className="flex justify-between text-sm">
                <span>{c.full_name ?? c.email}</span>
                <span className="text-xs text-gray-400">
                  {c.created_at ? formatDate(c.created_at) : '—'}
                </span>
              </li>
            )) : <EmptyState icon={<Users className="h-5 w-5 text-gray-400" />} text="Henüz müşteri yok." />}
          </ul>
        </Card>

        <Card title="Faturalar" description="Son 5 fatura" className="h-[300px] flex flex-col">
          <ul className="space-y-3 overflow-y-auto pr-2 flex-1">
            {recentInvoices.length > 0 ? recentInvoices.map((inv) => (
              <li key={inv.id} className="flex justify-between text-sm">
                <span>{inv.title}</span>
                <span className={`text-xs ${inv.status === 'paid' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {inv.status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                </span>
              </li>
            )) : <EmptyState icon={<FileText className="h-5 w-5 text-gray-400" />} text="Henüz fatura yok." />}
          </ul>
        </Card>
      </section>

      {/* Chartlar */}
      <section className="grid gap-8 lg:grid-cols-2 mb-12">
        <Card title="Görev Tamamlama Oranı" description="Haftalık genel görünüm">
          <div className="h-72 w-full rounded-lg bg-white dark:bg-gray-900">
            <WeeklyCompletionChart data={tasks.map((t) => ({ label: t.title, value: 1 }))} />
          </div>
        </Card>

        <Card title="Proje İlerleme" description="Tamamlanan vs kalan görevler">
          <div className="h-72 w-full rounded-lg bg-white dark:bg-gray-900">
            <ProjectProgressDonut
              completed={tasks.filter((t) => t.status === 'done').length}
              remaining={tasks.filter((t) => t.status !== 'done').length}
            />
          </div>
        </Card>
      </section>
    </div>
  )
}

function StatMini({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-gradient-to-r from-[#FF5E4A] to-[#FA7C6B] p-4 text-center shadow-md hover:scale-105 transition-transform">
      <p className="text-lg md:text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/90">{label}</p>
    </div>
  )
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
      {icon}
      <p>{text}</p>
    </div>
  )
}
