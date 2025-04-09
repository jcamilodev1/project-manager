export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          role_id: number
          full_name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          role_id: number
          full_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          role_id?: number
          full_name?: string | null
        }
      }
      roles: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          client_id: string
          manager_id: string | null
          designer_id: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          client_id: string
          manager_id?: string | null
          designer_id?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          client_id?: string
          manager_id?: string | null
          designer_id?: string | null
          status?: string
        }
      }
      project_files: {
        Row: {
          id: string
          name: string
          size: number
          path: string
          url: string
          type: string
          projectId: string
          createdAt: string
        }
        Insert: {
          id: string
          name: string
          size: number
          path: string
          url: string
          type: string
          projectId: string
          createdAt: string
        }
        Update: {
          id?: string
          name?: string
          size?: number
          path?: string
          url?: string
          type?: string
          projectId?: string
          createdAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 