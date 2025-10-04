import Link from 'next/link'
import { Project, Task, Goal } from '@/lib/types'
import { COMPLETED_STATUSES, TASK_STATUS_ORDER, getStatusLabel } from '@/lib/task-status'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'

type RevisionActivity = {
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

interface AdminPanelProps {
  tasks: Task[]
  projects: Project[]
  goals: Goal[]
  revisions: RevisionActivity[]
  invoices: InvoiceRecord[]
}

export function AdminPanel({ tasks, projects, goals, revisions, invoices }: AdminPanelProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => COMPLETED_STATUSES.includes(task.status)).length
  const reviewTasks = tasks.filter((task) => task.status === 'in_review' as any).length
  const revisionTasks = tasks.filter((task) => task.status === 'revision' as any).length
  const activeProjects = projects.filter((project) => project.progress < 100).length
  const completedGoals = goals.filter((goal) => goal.is_completed).length
  const goalCompletionRate =
    goals.length === 0 ? 0 : Math.round((completedGoals / goals.length) * 100)
  const averageProjectProgress =
    projects.length === 0
      ? 0
      : Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)

  const statusBreakdown = TASK_STATUS_ORDER.map((status) => ({
    status,
    count: tasks.filter((task) => task.status === status).length
  }))

  const upcomingTasks = tasks
    .filter((task) => task.due_date)
    .sort(
      (a, b) =>
        new Date(a.due_date ?? '').getTime() -
        new Date(b.due_date ?? '').getTime()
    )
    .slice(0, 5)

  const latestRevisions = revisions.slice(0, 8)
  const latestInvoices = invoices.slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Yönetim Paneli</h1>
        <p className="mt-2 text-sm text-gray-500">
          Görev, proje, hedef, revizyon ve faturalar için genel özet.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam Görev" value={totalTasks} description="Tüm durumlar" />
        <StatCard label="Tamamlanan" value={completedTasks} description="Teslim edilen görevler" />
        <StatCard
          label="İnceleme / Revize"
          value={reviewTasks + revisionTasks}
          description="Onay bekleyen görevler"
        />
        <StatCard label="Aktif Proje" value={activeProjects} description="%100 tamamlanmamış" />
      </div>

      {/* Status breakdown + Goals */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Statuses */}
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Durum Dağılımı</h2>
              <p className="text-sm text-gray-500">Görevlerin mevcut aşamalara göre dağılımı.</p>
            </div>
            <Link href="/tasks" className="text-sm font-medium text-accent hover:underline">
              Görevleri Yönet
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {statusBreakdown.map(({ status, count }) => (
              <div key={status} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    {getStatusLabel(status)}
                  </span>
                  <Badge color={count > 0 ? 'orange' : 'gray'}>{count} görev</Badge>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {count === 0
                    ? 'Bu aşamada görev bulunmuyor.'
                    : 'Güncel olarak bu aşamada bekleyen görevler.'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Hedef İlerlemesi</h2>
          <p className="text-sm text-gray-500">
            Tamamlanan {completedGoals} / {goals.length} hedef
          </p>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-accent"
              style={{ width: `${goalCompletionRate}%` }}
            ></div>
          </div>
          <p className="text-sm font-semibold text-accent">%{goalCompletionRate}</p>
          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Proje Ortalama İlerlemesi</p>
            <p className="mt-1 text-2xl font-bold text-accent">%{averageProjectProgress}</p>
          </div>
        </div>
      </div>

      {/* Upcoming tasks + Projects */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tasks */}
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Yaklaşan Görevler</h2>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-gray-500">Yaklaşan görev bulunmuyor.</p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-gray-900">{task.title}</span>
                    <Badge color="gray">{formatDate(task.due_date)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{task.description ?? 'Açıklama yok.'}</p>
                  <p className="mt-2 text-xs text-accent">Durum: {getStatusLabel(task.status)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Projeler</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-500">Henüz proje yok.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="space-y-2 rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{project.title}</p>
                    <span className="text-xs text-gray-500">Teslim: {formatDate(project.due_date)}</span>
                  </div>
                  <p className="text-xs text-gray-500">{project.description ?? 'Açıklama yok.'}</p>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-accent"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs font-semibold text-accent">%{project.progress}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revisions */}
      <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Son Revizyonlar</h2>
        {latestRevisions.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz revizyon kaydı yok.</p>
        ) : (
          <div className="space-y-3">
            {latestRevisions.map((rev) => (
              <div key={rev.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold text-gray-900">{rev.task_title}</span>
                  <span>{formatDateTime(rev.created_at)}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {rev.author?.full_name ?? rev.author?.email ?? 'Kullanıcı'}
                </p>
                <p className="mt-2 text-sm text-gray-700">{rev.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Faturalar</h2>
        {latestInvoices.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz fatura kaydı yok.</p>
        ) : (
          <div className="space-y-3">
            {latestInvoices.map((inv) => (
              <div key={inv.id} className="rounded-2xl border border-gray-200 p-4">
                <div className="flex justify-between">
                  <p className="text-sm font-semibold">{inv.title}</p>
                  <span className="text-xs text-gray-500">{inv.currency} {inv.amount}</span>
                </div>
                <p className={`text-xs font-medium ${inv.status === 'paid' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {inv.status === 'paid' ? 'Ödendi' : 'Beklemede'}
                </p>
                <p className="text-xs text-gray-500">Son Tarih: {formatDate(inv.due_date)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
