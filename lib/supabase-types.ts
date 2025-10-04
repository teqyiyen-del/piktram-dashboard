export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string              // örn: 'todo' | 'in_progress' | 'done'
          due_date: string | null
          priority: string | null
          file_url: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          due_date?: string | null
          priority?: string | null
          file_url?: string | null
          user_id: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['tasks']['Row']>
      }

      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string | null          // proje türü: kampanya, proje vs.
          progress: number | null
          is_completed: boolean | null
          due_date: string | null
          user_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Row']>
      }

      goals: {
        Row: {
          id: string
          title: string
          description: string | null
          due_date: string | null
          progress: number | null
          is_completed: boolean | null
          user_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['goals']['Row']>
      }

      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          company: string | null
          role: string | null
          tax_no: string | null        // ✅ eklendi
          sector: string | null        // ✅ eklendi
          created_at: string | null    // ✅ opsiyonel hale getirildi
        }
        Insert: {
          id?: string
          full_name?: string | null
          email?: string | null
          company?: string | null
          role?: string | null
          tax_no?: string | null
          sector?: string | null
          created_at?: string | null
        }
        Update: {
          full_name?: string | null
          email?: string | null
          company?: string | null
          role?: string | null
          tax_no?: string | null
          sector?: string | null
          created_at?: string | null
        }
      }

      invoices: {
        Row: {
          id: string
          user_id: string
          amount: number
          status: string               // örn: 'pending' | 'paid' | 'overdue'
          attachment_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['invoices']['Row']>
      }

      notifications: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          from_user: string | null
          type: 'announcement' | 'task_update' | 'revision'
          title: string
          description: string | null
          target_url: string | null
          read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          from_user?: string | null
          type: 'announcement' | 'task_update' | 'revision'
          title: string
          description?: string | null
          target_url?: string | null
          read?: boolean | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
      }
    }
  }
}
