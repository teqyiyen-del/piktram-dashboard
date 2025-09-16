export type Profile = {
  id: string
  full_name: string | null
  email: string
  avatar_url?: string | null
  theme?: 'light' | 'dark'
  email_notifications?: boolean
  push_notifications?: boolean
  weekly_summary?: boolean
  role?: 'admin' | 'user'
}

export type Project = {
  id: string
  title: string
  description: string | null
  progress: number
  due_date: string | null
  user_id: string
  created_at?: string
}

export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'revision'
  | 'approved'
  | 'published'
  | 'done'

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  project_id: string | null
  user_id: string
  created_at?: string
}

export type Comment = {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
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
}
