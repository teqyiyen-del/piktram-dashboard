export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          theme: 'light' | 'dark' | null
          email_notifications: boolean | null
          push_notifications: boolean | null
          weekly_summary: boolean | null
          created_at: string
          role: 'admin' | 'user' | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          theme?: 'light' | 'dark' | null
          email_notifications?: boolean | null
          push_notifications?: boolean | null
          weekly_summary?: boolean | null
          role?: 'admin' | 'user' | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          progress: number
          due_date: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          progress?: number
          due_date?: string | null
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'in_review' | 'revision' | 'approved' | 'published' | 'done'
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          project_id: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'in_review' | 'revision' | 'approved' | 'published' | 'done'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          project_id?: string | null
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['comments']['Insert']>
      }
      revisions: {
        Row: {
          id: string
          task_id: string
          user_id: string
          comment_id: string | null
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          comment_id?: string | null
          description: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['revisions']['Insert']>
      }
      goals: {
        Row: {
          id: string
          title: string
          description: string | null
          is_completed: boolean
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          is_completed?: boolean
          user_id: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['goals']['Insert']>
      }
    }
  }
}
