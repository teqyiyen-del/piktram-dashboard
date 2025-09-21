// /lib/types.ts

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
  created_at?: string
  data?: Record<string, any>
  // Admin müşteri yönetimi için:
  company?: string | null
  tax_no?: string | null
  sector?: string | null
}

export type Project = {
  id: string
  title: string
  description: string | null
  progress: number
  due_date: string | null
  user_id: string
  created_at?: string
  status?: string
  // Dashboard & müşteri sayfasında kullandıklarımız:
  type?: 'proje' | 'reklam' | null
  is_completed?: boolean | null
  client_id?: string | null
}

export type TaskStatus =
  | 'yapiliyor'
  | 'onay_surecinde'
  | 'revize'
  | 'onaylandi'
  | 'paylasildi'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'revision'
  | 'approved'
  | 'published'
  | 'tamamlandi'

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  yapiliyor: 'Yapılıyor',
  onay_surecinde: 'Onay Sürecinde',
  revize: 'Revize',
  onaylandi: 'Onaylandı',
  paylasildi: 'Paylaşıldı',
  todo: 'Yapılacak',
  in_progress: 'Devam Ediyor',
  in_review: 'İncelemede',
  revision: 'Revizyon',
  approved: 'Onaylandı',
  published: 'Yayınlandı',
  tamamlandi: 'Tamamlandı',
}

export const TASK_STATUS_ORDER: TaskStatus[] = [
  'todo',
  'in_progress',
  'in_review',
  'revision',
  'approved',
  'published',
  'tamamlandi',
]

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  project_id: string | null
  user_id: string
  // müşteri filtreleri için:
  client_id?: string | null
  // dosya alanları:
  file_url?: string | null
  attachment_url?: string | null
  mimetype?: string | null
  size?: number | null
  created_at?: string
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
  file_url?: string | null
  description?: string | null
  created_at?: string
}

export type AgendaEventType = 'icerik' | 'toplanti' | 'odeme' | 'rapor'

// Eski 'Event' tablon için (ileride meeting/payment/report bağlayınca kullanacağız)
export type Event = {
  id: string
  title: string
  description: string | null
  event_date: string
  event_type: AgendaEventType
  related: string | null
  user_id: string
  created_at?: string
}

// AJANDA İÇİN KULLANACAĞIMIZ TİP (şimdilik task’lerden besleniyor)
// Not: 'date' yerine due_date kullanıyoruz ki task ile birebir uyumlu olsun
export type AgendaEvent = {
  id: string
  title: string
  description?: string | null
  due_date: string           // 👈 task.due_date ile aynı
  type: 'task' | 'event'     // şimdilik 'task' kullanıyoruz
  related?: string | null
  created_at?: string
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

export type SubscriptionStatus = 'aktif' | 'beklemede' | 'iptal'

export type Subscription = {
  id: string
  plan_name: string
  price: number
  currency: string
  renewal_date: string | null
  status: SubscriptionStatus
  user_id: string
  created_at: string
}

export type FileCategory = 'invoice' | 'contract' | 'logo' | 'post' | 'reel' | 'visual'

export type StoredFile = {
  id: string
  name: string
  bucket: string
  path: string
  url: string | null
  category: FileCategory
  description: string | null
  user_id: string
  created_at: string
  mimetype?: string | null
  size?: number | null
}

export type MeetingStatus = 'beklemede' | 'onaylandi' | 'planlandi'

export type Meeting = {
  id: string
  title: string
  agenda: string | null
  preferred_date: string | null
  meeting_url: string | null
  status: MeetingStatus
  user_id: string
  created_at: string
}

export type NotificationType = 'task' | 'report' | 'invoice' | 'meeting' | 'general'

export type Notification = {
  id: string
  title: string
  description: string | null
  type: NotificationType
  created_at: string
  read_at: string | null
  user_id: string
}

export type Comment = {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  file_url?: string | null
  author?: {
    full_name: string | null
    email: string | null
  }
}

export type Revision = {
  id: string
  task_id: string
  user_id: string
  comment_id: string | null
  description: string
  created_at: string
  author?: {
    full_name: string | null
    email: string | null
  }
}

export type Goal = {
  id: string
  title: string
  description: string | null
  is_completed: boolean
  user_id: string
  created_at?: string
  due_date?: string | null
  progress?: number | null
}
