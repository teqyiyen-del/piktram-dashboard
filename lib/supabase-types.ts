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
      subscriptions: {
        Row: {
          id: string
          plan_name: string
          price: number
          currency: string
          renewal_date: string | null
          status: 'aktif' | 'beklemede' | 'iptal'
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          plan_name: string
          price: number
          currency?: string
          renewal_date?: string | null
          status?: 'aktif' | 'beklemede' | 'iptal'
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      files: {
        Row: {
          id: string
          name: string
          bucket: string
          path: string
          url: string | null
          category: 'invoice' | 'contract' | 'logo' | 'post' | 'reel' | 'visual'
          description: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          bucket: string
          path: string
          url?: string | null
          category: 'invoice' | 'contract' | 'logo' | 'post' | 'reel' | 'visual'
          description?: string | null
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['files']['Insert']>
      }
      meetings: {
        Row: {
          id: string
          title: string
          agenda: string | null
          preferred_date: string | null
          meeting_url: string | null
          status: 'beklemede' | 'onaylandi' | 'planlandi'
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          agenda?: string | null
          preferred_date?: string | null
          meeting_url?: string | null
          status?: 'beklemede' | 'onaylandi' | 'planlandi'
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['meetings']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'task' | 'report' | 'invoice' | 'meeting' | 'general'
          created_at: string
          read_at: string | null
          user_id: string
          meta: Json | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'task' | 'report' | 'invoice' | 'meeting' | 'general'
          read_at?: string | null
          user_id: string
          meta?: Json | null
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
  }
}
