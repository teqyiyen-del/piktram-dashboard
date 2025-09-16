import Link from 'next/link'
import { Project, Task, Goal } from '@/lib/types'
import { COMPLETED_STATUSES, TASK_STATUS_ORDER, getStatusLabel } from '@/lib/task-status'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

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

interface AdminPanelProps {
  tasks: Task[]
  projects: Project[]
  goals: Goal[]
  revisions: RevisionActivity[]
}

export function AdminPanel({ tasks, projects, goals, revisions }: AdminPanelProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => COMPLETED_STATUSES.includes(task.status)).length
  const reviewTasks = tasks.filter((task) => task.status === 'in_review').length
  const revisionTasks = tasks.filter((task) => task.status === 'revision').length
  const activeProjects = projects.filter((project) => project.progress < 100).length
  const completedGoals = goals.filter((goal) => goal.is_completed).length
  const goalCompletionRate = goals.length === 0 ? 0 : Math.round((completedGoals / goals.length) * 100)
  const averageProjectProgress = projects.length === 0
    ? 0
    : Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length)

  const statusBreakdown = TASK_STATUS_ORDER.map((status) => ({
    status,
    count: tasks.filter((task) => task.status === status).length
  }))

  const upcomingTasks = tasks
    .filter((task) => task.due_date)
    .sort((a, b) => new Date(a.due_date ?? '').getTime() - new Date(b.due_date ?? '').getTime())
    .slice(0, 5)

  const latestRevisions = revisions.slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Yönetim Paneli</h1>
        <p className="mt-2 text-sm text-gray-500">Görev, proje ve hedeflerinize ait en güncel özet.</p>
      </div>

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

      <div className="grid gap-6 xl:grid-cols-3">
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
                  <span className="text-sm font-semibold text-gray-900">{getStatusLabel(status)}</span>
                  <Badge color={count > 0 ? 'orange' : 'gray'}>{count} görev</Badge>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {count === 0 ? 'Bu aşamada görev bulunmuyor.' : 'Güncel olarak bu aşamada bekleyen görevler.'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Hedef İlerlemesi</h2>
          <p className="text-sm text-gray-500">Tamamlanan {completedGoals} / {goals.length} hedef</p>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${goalCompletionRate}%` }}></div>
          </div>
          <p className="text-sm font-semibold text-accent">%{goalCompletionRate}</p>
          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Proje Ortalama İlerlemesi</p>
            <p className="mt-1 text-2xl font-bold text-accent">%{averageProjectProgress}</p>
            <p className="text-xs text-gray-500">Tüm projelerin mevcut durumlarına göre ortalama.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Yaklaşan Görevler</h2>
              <p className="text-sm text-gray-500">Teslim tarihi yaklaşan en güncel görevler.</p>
            </div>
            <Link href="/calendar" className="text-sm font-medium text-accent hover:underline">
              Takvimde Gör
            </Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-gray-500">Yaklaşan görev bulunmuyor. Yeni görev ekleyerek plan oluşturun.</p>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-gray-900">{task.title}</span>
                    <Badge color="gray">{formatDate(task.due_date)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{task.description ?? 'Açıklama bulunmuyor.'}</p>
                  <p className="mt-2 text-xs text-accent">Durum: {getStatusLabel(task.status)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Projeler</h2>
              <p className="text-sm text-gray-500">Aktif projelerin genel görünümü.</p>
            </div>
            <Link href="/projects" className="text-sm font-medium text-accent hover:underline">
              Projeleri Aç
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-500">Henüz proje oluşturulmadı. Yeni bir proje ekleyin.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="space-y-2 rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{project.title}</p>
                    <span className="text-xs text-gray-500">Teslim: {formatDate(project.due_date)}</span>
                  </div>
                  <p className="text-xs text-gray-500">{project.description ?? 'Açıklama bulunmuyor.'}</p>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <p className="text-xs font-semibold text-accent">%{project.progress}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Son Revizyonlar</h2>
        {latestRevisions.length === 0 ? (
          <p className="text-sm text-gray-500">Henüz revizyon kaydı bulunmuyor.</p>
        ) : (
          <div className="space-y-3">
            {latestRevisions.map((revision) => (
              <div key={revision.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-semibold text-gray-900">{revision.task_title}</span>
                  <span>{formatDateTime(revision.created_at)}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {revision.author?.full_name ?? revision.author?.email ?? 'Kullanıcı'}
                </p>
                <p className="mt-2 text-sm text-gray-700">{revision.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-gray-900">{value}</p>
      <p className="mt-2 text-xs text-gray-500">{description}</p>
    </div>
  )
}
