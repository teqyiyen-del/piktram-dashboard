'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { formatDate } from '@/lib/utils'
import { TASK_STATUS_LABELS, TaskStatus } from '@/lib/types'

type UserRecord = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  created_at: string
}

type ProjectRecord = {
  id: string
  title: string
  description: string | null
  progress: number
  due_date: string | null
  user_id: string
  created_at: string
}

type TaskRecord = {
  id: string
  title: string
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  user_id: string
  attachment_url: string | null
  created_at: string
}

type GoalRecord = {
  id: string
  title: string
  description: string | null
  is_completed: boolean
  user_id: string
  created_at: string
}

type RevisionRecord = {
  id: string
  task_id: string
  description: string
  created_at: string
  user_id: string
  task_title: string
  author?: {
    full_name: string | null
    email: string | null
  } | null
}

type InvoiceRecord = {
  id: string
  user_id: string
  title: string
  amount: number
  currency: string
  status: string
  due_date: string | null
  created_at: string
}

interface AdminDashboardProps {
  users: UserRecord[]
  projects: ProjectRecord[]
  tasks: TaskRecord[]
  goals: GoalRecord[]
  revisions: RevisionRecord[]
  invoices: InvoiceRecord[]
  ownerMap: Record<string, { full_name: string | null; email: string | null }>
  stats: { users: number; projects: number; tasks: number }
  pagination: {
    projectsPage: number
    projectsTotalPages: number
    tasksPage: number
    tasksTotalPages: number
  }
}

const statusLabels: Record<TaskRecord['status'], string> = TASK_STATUS_LABELS

const priorityLabels: Record<TaskRecord['priority'], string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek'
}

export default function AdminDashboard({
  users,
  projects,
  tasks,
  goals,
  revisions,
  invoices,
  ownerMap,
  stats,
  pagination
}: AdminDashboardProps) {
  const [selectedUser, setSelectedUser] = useState<'all' | string>('all')

  const filteredProjects = useMemo(
    () => (selectedUser === 'all' ? projects : projects.filter((p) => p.user_id === selectedUser)),
    [projects, selectedUser]
  )

  const filteredTasks = useMemo(
    () => (selectedUser === 'all' ? tasks : tasks.filter((t) => t.user_id === selectedUser)),
    [tasks, selectedUser]
  )

  const filteredGoals = useMemo(
    () => (selectedUser === 'all' ? goals : goals.filter((g) => g.user_id === selectedUser)),
    [goals, selectedUser]
  )

  const filteredInvoices = useMemo(
    () => (selectedUser === 'all' ? invoices : invoices.filter((i) => i.user_id === selectedUser)),
    [invoices, selectedUser]
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="rounded-3xl bg-surface p-8 shadow-sm transition-colors dark:bg-surface-dark">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Admin Paneli</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Müşterilere ait tüm verileri yönetin.
        </p>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Müşteri Seç</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="ml-3 rounded-lg border px-3 py-2 text-sm dark:bg-surface-dark dark:text-white"
          >
            <option value="all">Tümü</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name ?? u.email}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Stats */}
      <section className="grid gap-6 md:grid-cols-4">
        <StatTile title="Kullanıcılar" value={stats.users} description="Aktif hesap sayısı" />
        <StatTile title="Projeler" value={filteredProjects.length} description="Seçilen müşteriye ait" />
        <StatTile title="Görevler" value={filteredTasks.length} description="Seçilen müşteriye ait" />
        <StatTile title="Hedefler" value={filteredGoals.length} description="Seçilen müşteriye ait" />
      </section>

      {/* Projects */}
      <EntitySection title="Projeler" data={filteredProjects} render={(project) => {
        const owner = ownerMap[project.user_id]
        return (
          <article key={project.id} className="rounded-2xl border p-4 dark:border-gray-700">
            <div className="flex justify-between">
              <h3 className="text-sm font-semibold">{project.title}</h3>
              <span className="text-xs text-gray-500">{formatDate(project.due_date)}</span>
            </div>
            <p className="text-xs text-gray-400">{project.description}</p>
            <p className="text-xs text-gray-500">Sorumlu: {owner?.full_name ?? 'Bilinmiyor'}</p>
          </article>
        )
      }} />

      {/* Tasks */}
      <EntitySection title="Görevler" data={filteredTasks} render={(task) => {
        const owner = ownerMap[task.user_id]
        return (
          <article key={task.id} className="rounded-2xl border p-4 dark:border-gray-700">
            <div className="flex justify-between">
              <h3 className="text-sm font-semibold">{task.title}</h3>
              <span className="text-xs">{statusLabels[task.status]}</span>
            </div>
            <p className="text-xs text-gray-400">Öncelik: {priorityLabels[task.priority]}</p>
            <p className="text-xs">{owner?.full_name ?? 'Bilinmiyor'}</p>
          </article>
        )
      }} />

      {/* Goals */}
      <EntitySection title="Hedefler" data={filteredGoals} render={(goal) => (
        <article key={goal.id} className="rounded-2xl border p-4 dark:border-gray-700">
          <h3 className="text-sm font-semibold">{goal.title}</h3>
          <p className="text-xs text-gray-400">{goal.description}</p>
          <p className={`text-xs font-medium ${goal.is_completed ? 'text-emerald-600' : 'text-gray-500'}`}>
            {goal.is_completed ? 'Tamamlandı' : 'Devam Ediyor'}
          </p>
        </article>
      )} />

      {/* Revisions */}
      <EntitySection title="Son Revizyonlar" data={revisions} render={(rev) => (
        <article key={rev.id} className="rounded-2xl border p-4 dark:border-gray-700">
          <div className="flex justify-between">
            <h3 className="text-sm font-semibold">{rev.task_title}</h3>
            <span className="text-xs text-gray-500">{formatDate(rev.created_at)}</span>
          </div>
          <p className="text-xs text-gray-400">{rev.author?.full_name ?? rev.author?.email}</p>
          <p className="text-sm">{rev.description}</p>
        </article>
      )} />

      {/* Invoices */}
      <EntitySection title="Faturalar" data={filteredInvoices} render={(inv) => (
        <article key={inv.id} className="rounded-2xl border p-4 dark:border-gray-700">
          <div className="flex justify-between">
            <h3 className="text-sm font-semibold">{inv.title}</h3>
            <span className="text-xs text-gray-500">{inv.currency} {inv.amount}</span>
          </div>
          <p className={`text-xs font-medium ${inv.status === 'paid' ? 'text-emerald-600' : 'text-red-500'}`}>
            {inv.status === 'paid' ? 'Ödendi' : 'Beklemede'}
          </p>
          <p className="text-xs text-gray-500">Son Tarih: {formatDate(inv.due_date)}</p>
        </article>
      )} />
    </div>
  )
}

function StatTile({ title, value, description }: { title: string; value: number; description: string }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-surface-dark">
      <p className="text-xs font-semibold uppercase text-gray-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  )
}

function EntitySection<T>({ title, data, render }: { title: string; data: T[]; render: (item: T) => JSX.Element }) {
  return (
    <section className="rounded-3xl border bg-surface p-6 dark:border-gray-700 dark:bg-surface-dark">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz kayıt yok.</p>
        ) : (
          data.map(render)
        )}
      </div>
    </section>
  )
}
