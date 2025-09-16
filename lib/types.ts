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

export type Task = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
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

export type WorkflowStatus = 'yapiliyor' | 'onay_surecinde' | 'revize' | 'onaylandi' | 'paylasildi'

export type WorkflowItem = {
  id: string
  title: string
  brand: string
  owner?: string
  deadline?: string | null
  status: WorkflowStatus
}

export type AgendaEventType = 'icerik' | 'toplanti' | 'odeme' | 'rapor'

export type AgendaEvent = {
  id: string
  title: string
  description?: string
  date: string
  type: AgendaEventType
  related?: string
}
