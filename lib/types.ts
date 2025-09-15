export type Profile = {
  id: string
  full_name: string | null
  email: string
  avatar_url?: string | null
  theme?: 'light' | 'dark'
  email_notifications?: boolean
  push_notifications?: boolean
  weekly_summary?: boolean
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
}
