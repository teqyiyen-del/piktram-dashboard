import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase-types'
import { Card } from '@/components/sections/card'
import { ListItem } from '@/components/sections/list-item'
import { SectionHeader } from '@/components/layout/section-header'
import { formatDate } from '@/lib/utils'
import { Project } from '@/lib/types'

export default async function MusteriProjelerPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session) return null

  // Projeleri çek
  let { data: projectsData } = await supabase
    .from('projects')
    .select(
      'id, title, description, progress, due_date, user_id, client_id, type, is_completed'
    )
    .eq('client_id', session.user.id)
    .order('due_date', { ascending: true })

  if (!projectsData || projectsData.length === 0) {
    const fallback = await supabase
      .from('projects')
      .select(
        'id, title, description, progress, due_date, user_id, client_id, type, is_completed'
      )
      .eq('user_id', session.user.id)
      .order('due_date', { ascending: true })
    projectsData = fallback.data
  }

  const projects: Project[] = (projectsData ?? []) as Project[]

  const campaigns = projects.filter(
    (p) => p.type === 'reklam' && Number(p.progress) < 100
  )
  const normalProjects = projects.filter(
    (p) => p.type === 'proje' && Number(p.progress) < 100
  )
  const finishedProjects = projects.filter((p) => Number(p.progress) >= 100)

  const totalProjects = projects.length
  const activeProjects = projects.filter((p) => Number(p.progress) < 100).length
  const completedProjects = finishedProjects.length
  const upcomingDeadlines = projects.filter((p) => {
    if (!p.due_date) return false
    const due = new Date(p.due_date)
    const today = new Date()
    return due >= today && (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 21
  }).length

  return (
    <div className="space-y-10 px-layout-x py-layout-y">
      <SectionHeader
        title="Projelerim"
        subtitle="Kendi projelerinizin teslim tarihlerini ve durumlarını takip edin."
        badge="Müşteri Paneli"
        gradient
      />

      {/* Kampanyalar */}
      <Card title="Kampanyalar" description="Devam eden reklam işleriniz">
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Henüz aktif kampanya yok.
            </p>
          ) : (
            campaigns.map((campaign) => (
              <ListItem
                key={campaign.id}
                title={campaign.title}
                description={<span>{campaign.description ?? 'Açıklama eklenmedi.'}</span>}
                meta={
                  <div className="flex flex-col gap-1">
                    {campaign.due_date && <span>{formatDate(campaign.due_date)}</span>}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className={`h-full rounded-full ${
                          Number(campaign.progress) >= 100 ? 'bg-green-500' : 'bg-accent'
                        }`}
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                  </div>
                }
                compact
                rightSlot={<span className="pill">%{campaign.progress}</span>}
              />
            ))
          )}
        </div>
      </Card>

      {/* Projeler */}
      <Card title="Projelerim" description="Devam eden projeleriniz">
        <div className="space-y-4">
          {normalProjects.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Henüz proje bulunmuyor.
            </p>
          ) : (
            normalProjects.map((project) => (
              <ListItem
                key={project.id}
                title={project.title}
                description={<span>{project.description ?? 'Açıklama girilmedi.'}</span>}
                meta={
                  <div className="flex flex-col gap-1">
                    {project.due_date && <span>{formatDate(project.due_date)}</span>}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className={`h-full rounded-full ${
                          Number(project.progress) >= 100 ? 'bg-green-500' : 'bg-accent'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                }
                compact
                rightSlot={<span className="pill">%{project.progress}</span>}
              />
            ))
          )}
        </div>
      </Card>

      {/* Arşiv */}
      <Card title="Arşiv" description="Tamamlanmış proje ve kampanyalarınız">
        <div className="space-y-4">
          {finishedProjects.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Henüz tamamlanmış iş yok.
            </p>
          ) : (
            finishedProjects.map((item) => (
              <ListItem
                key={item.id}
                title={
                  <span className="flex items-center gap-2">
                    {item.title}
                    <span className="text-green-600">✔</span>
                  </span>
                }
                description={<span>{item.description ?? 'Açıklama yok.'}</span>}
                meta={
                  <div className="flex flex-col gap-1">
                    {item.due_date && <span>{formatDate(item.due_date)}</span>}
                    <span className="text-green-600 font-medium">Tamamlandı (%100)</span>
                  </div>
                }
                compact
                rightSlot={
                  <span className="pill bg-green-100 text-green-700 dark:bg-green-900/30">
                    {item.type === 'reklam' ? 'Tamamlanmış reklam' : 'Tamamlanmış proje'}
                  </span>
                }
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              />
            ))
          )}
        </div>
      </Card>

      {/* Durum Özeti */}
      <Card title="Durum Özeti" description="Projelerinizin genel durumu">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/90 p-4 text-sm shadow-sm dark:bg-surface-dark/80">
            <p className="text-xs font-semibold uppercase text-gray-500">Toplam Proje</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {totalProjects}
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-sm shadow-sm dark:bg-surface-dark/80">
            <p className="text-xs font-semibold uppercase text-gray-500">Aktif</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {activeProjects}
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-sm shadow-sm dark:bg-surface-dark/80">
            <p className="text-xs font-semibold uppercase text-gray-500">Tamamlanan</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {completedProjects}
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 text-sm shadow-sm dark:bg-surface-dark/80">
            <p className="text-xs font-semibold uppercase text-gray-500">Yaklaşan Teslim</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
              {upcomingDeadlines}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
