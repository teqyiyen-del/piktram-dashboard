export type Profile = {
  id: string
  full_name: string | null
  email: string
  avatar_url?: string | null
  theme?: 'light' | 'dark'
  email_notifications?: boolean
  push_notifications?: boolean
  weekly_summary?: boolean
  role?: 'user' | 'admin'
}

export type Project = {
  id: string
  title: string
  description: string | null
  progress: number
  due_date: string | null
  user_id: string
}

export type TaskStatus = 'yapiliyor' | 'onay_surecinde' | 'revize' | 'onaylandi' | 'paylasildi'

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  yapiliyor: 'Yapılıyor',
  onay_surecinde: 'Onay Sürecinde',
  revize: 'Revize',
  onaylandi: 'Onaylandı',
  paylasildi: 'Paylaşıldı'
}

export const TASK_STATUS_ORDER: TaskStatus[] = ['yapiliyor', 'onay_surecinde', 'revize', 'onaylandi', 'paylasildi']

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  project_id: string | null
  user_id: string
  attachment_url: string | null
}

export type AnnouncementCategory = 'genel' | 'guncelleme' | 'hatirlatma' | 'kampanya'

export type Announcement = {
  id: string
  title: string
  description: string
  date: string
  category: AnnouncementCategory
  highlighted?: boolean
}

export type Campaign = {
  id: string
  title: string
  description: string | null
  due_date: string | null
  progress: number
  owner: string
}

export type WorkflowStatus = TaskStatus

export type WorkflowItem = {
  id: string
  title: string
  brand?: string | null
  owner?: string | null
  deadline?: string | null
  status: WorkflowStatus
  priority?: Task['priority']
  attachment_url?: string | null
  description?: string | null
}

export type AgendaEventType = 'icerik' | 'toplanti' | 'odeme' | 'rapor'

export type Event = {
  id: string
  title: string
  description: string | null
  event_date: string
  event_type: AgendaEventType
  related: string | null
  user_id: string
}

export type AgendaEvent = {
  id: string
  title: string
  description?: string | null
  date: string
  type: AgendaEventType
  related?: string | null
}

export type ReportPeriod = 'weekly' | 'monthly'

export type Report = {
  id: string
  title: string
  period: ReportPeriod
  period_label: string | null
  followers: number
  likes: number
  posts: number
  engagement_rate: number | null
  summary: string | null
  file_url: string | null
  created_at: string
  user_id: string
}
