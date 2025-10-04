'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { WeeklyCompletionChart, ProjectProgressDonut } from '@/components/dashboard/charts'
import { Card } from '@/components/sections/card'
import { FolderKanban, Users, FileText, Megaphone } from 'lucide-react'

type UserRecord = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  created_at: string | null
}
type ProjectRecord = {
  id: string
  title: string
  description: string | null
  progress: number
  due_date: string | null
  user_id: string
  created_at: string | null
}
type TaskRecord = {
  id: string
  title: string
  status: string // DB’de karışık geldigi için string tuttuk
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  user_id: string
  attachment_url: string | null
  created_at: string | null
}
type GoalRecord = { id: string; title: string; description: string | null; is_completed: boolean; user_id: string; created_at: string | null }
type InvoiceRecord = { id: string; user_id: string; title: string; amount: number; currency: string; status: string; due_date: string | null; created_at: string | null }
type AnnouncementRecord = { id: string; title: string; content: string; created_at: string | null }

interface AdminDashboardProps {
  currentUser: UserRecord
  users: UserRecord[]
  projects: ProjectRecord[]
  tasks: TaskRecord[]
  goals: GoalRecord[]
  invoices: InvoiceRecord[]
  announcements: AnnouncementRecord[]
}

/** ---------- Status helpers (TR + EN karışık geldiklerine göre) ---------- */
const norm = (s: unknown) => String(s ?? '').toLowerCase()

const TODO = ['todo'] as const
const INPROGRESS = ['in_progress', 'yapiliyor'] as const
const COMPLETED = ['tamamlandi', 'onaylandi', 'approved', 'published', 'done'] as const

const inSet = (s: unknown, set: readonly string[]) => set.includes(norm(s))

export default function AdminDashboard({
  currentUser,
  users = [],
  projects = [],
  tasks = [],
  goals = [],
  invoices = [],
  announcements = [],
}: AdminDashboardProps) {
  const router = useRouter()

  // Son 5 müşteri (created_at varsa ona göre sırala, yoksa id/alfabe fallback)
  const recentClients = useMemo(() => {
    const sorted = [...users].sort((a, b) => {
      const ad = a.created_at ? new Date(a.created_at).getTime() : 0
      const bd = b.created_at ? new Date(b.created_at).getTime() : 0
      if (ad === bd) return (a.full_name ?? a.email ?? '').localeCompare(b.full_name ?? b.email ?? '')
      return bd - ad
    })
    return sorted.slice(0, 5)
  }, [users])

  const recentProjects = useMemo(() => projects.slice(-5).reverse(), [projects])
  const recentInvoices = useMemo(() => invoices.slice(-5).reverse(), [invoices])
  const recentAnnouncements = useMemo(() => announcements.slice(-5).reverse(), [announcements])

  // Bugünkü yapılacak görevler (yalnızca TODO, max 5)
  const todayTodos = useMemo(
    () => tasks.filter((t) => inSet(t.status, TODO)).slice(0, 5),
    [tasks]
  )

  // Bekleyen görev = TODO + IN_PROGRESS (eşdeğerleriyle)
  const pendingTasksCount = useMemo(
    () => tasks.filter((t) => inSet(t.status, TODO) || inSet(t.status, INPROGRESS)).length,
    [tasks]
  )

  // Aktif kullanıcı: role !== 'inactive' (yoksa hepsi aktif say)
  const activeUsersCount = useMemo(
    () => users.filter((u) => (u.role ? norm(u.role) !== 'inactive' : true)).length,
    [users]
  )

  // Donut: tamamlanan vs kalan
  const completedCount = useMemo(
    () => tasks.filter((t) => inSet(t.status, COMPLETED)).length,
    [tasks]
  )
  const remainingCount = tasks.length - completedCount

  return (
    <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
      {/* Header */}
      <header
        className="rounded-2xl p-6 text-white mb-12 shadow-lg"
        style={{ background: 'linear-gradient(to right, #FF5E4A, #FA7C6B)' }}
      >
        <h1 className="text-xl md:text-2xl font-semibold">
          Hoş geldin, {currentUser?.full_name ?? 'Admin'} 👋
        </h1>
        <p className="mt-1 text-sm text-white/90">Genel görünümü takip et, ajandanı planla ve işlerini yönet.</p>
      </header>

      {/* Stat kutular */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <StatMini value={pendingTasksCount} label="Bekleyen Görev" />
        <StatMini value={projects.length} label="Aktif Proje" />
        <StatMini value={activeUsersCount} label="Aktif Kullanıcı" />
        <StatMini value={goals.length} label="Hedef" />
      </section>

      {/* Bugünkü Görevler (sadece TODO, max 5, tıklayınca ilgili müşterinin görevlerine gider) */}
      <section className="mb-12">
        <Card title="Bugünkü Görevler" description="Tamamlanması gereken yapılacak görevler" className="min-h-[220px]">
          <ul className="space-y-3">
            {todayTodos.length > 0 ? (
              todayTodos.map((t) => (
                <li
                  key={t.id}
                  className="flex justify-between items-center text-sm cursor-pointer hover:text-[#FF5E4A]"
                  onClick={() => router.push(`/admin/tasks?user=${t.user_id}`)}
                >
                  <span>{t.title}</span>
                  <span className="text-xs text-gray-400">{t.due_date ? formatDate(t.due_date) : '—'}</span>
                </li>
              ))
            ) : (
              <EmptyState icon={<FolderKanban className="h-5 w-5 text-gray-400" />} text="Bugün yapılacak görev yok." />
            )}
          </ul>
        </Card>
      </section>

      {/* Alt Grid (Projeler, Yeni Müşteriler, Faturalar) */}
      <section className="grid gap-8 lg:grid-cols-3 mb-12">
        <Card title="Projeler" description="Son 5 proje" className="h-[300px] flex flex-col">
          <ul className="space-y-3 overflow-y-auto pr-2 flex-1">
            {recentProjects.length > 0 ? (
              recentProjects.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span>{p.title}</span>
                  <span className="text-xs text-gray-400">{p.due_date ? formatDate(p.due_date) : '—'}</span>
                </li>
              ))
            ) : (
              <EmptyState icon={<FolderKanban className="h-5 w-5 text-gray-400" />} text="Henüz proje yok." />
            )}
          </ul>
        </Card>

        <Card title="Yeni Müşteriler" description="Son eklenen 5 müşteri" className="h-[300px] flex flex-col">
          <ul className="space-y-3 overflow-y-auto pr-2 flex-1">
            {recentClients.length > 0 ? (
              recentClients.map((c) => (
                <li key={c.id} className="flex justify-between text-sm">
                  <span>{c.full_name ?? c.email}</span>
                  <span className="text-xs text-gray-400">{c.created_at ? formatDate(c.created_at) : '—'}</span>
                </li>
              ))
            ) : (
              <EmptyState icon={<Users className="h-5 w-5 text-gray-400" />} text="Henüz müşteri yok." />
            )}
          </ul>
        </Card>

        <Card title="Faturalar" description="Son 5 fatura" className="h-[300px] flex flex-col">
          <ul className="space-y-3 overflow-y-auto pr-2 flex-1">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((inv) => (
                <li key={inv.id} className="flex justify-between text-sm">
                  <span>{inv.title}</span>
                  <span className={`text-xs ${norm(inv.status) === 'paid' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {norm(inv.status) === 'paid' ? 'Ödendi' : 'Bekliyor'}
                  </span>
                </li>
              ))
            ) : (
              <EmptyState icon={<FileText className="h-5 w-5 text-gray-400" />} text="Henüz fatura yok." />
            )}
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
            <ProjectProgressDonut completed={completedCount} remaining={remainingCount} />
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
