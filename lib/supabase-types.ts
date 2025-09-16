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
          role: 'user' | 'admin' | null
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
          role?: 'user' | 'admin' | null
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
          status: 'yapiliyor' | 'onay_surecinde' | 'revize' | 'onaylandi' | 'paylasildi'
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          project_id: string | null
          user_id: string
          created_at: string
          attachment_url: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'yapiliyor' | 'onay_surecinde' | 'revize' | 'onaylandi' | 'paylasildi'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          project_id?: string | null
          user_id: string
          attachment_url?: string | null
        }
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          event_type: 'icerik' | 'toplanti' | 'odeme' | 'rapor'
          related: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          event_type: 'icerik' | 'toplanti' | 'odeme' | 'rapor'
          related?: string | null
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      reports: {
        Row: {
          id: string
          title: string
          period: 'weekly' | 'monthly'
          period_label: string | null
          followers: number
          likes: number
          posts: number
          engagement_rate: number | null
          summary: string | null
          file_url: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          period: 'weekly' | 'monthly'
          period_label?: string | null
          followers: number
          likes: number
          posts: number
          engagement_rate?: number | null
          summary?: string | null
          file_url?: string | null
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['reports']['Insert']>
      }
    }
  }
}
