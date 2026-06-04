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
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'user' | 'superadmin'
          status: 'pending' | 'active' | 'inactive' | 'cancelled'
          referral_code: string
          sponsor_id: string | null
          placement_parent_id: string | null
          leg: 'left' | 'right' | null
          placement_locked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'user' | 'superadmin'
          status?: 'pending' | 'active' | 'inactive' | 'cancelled'
          referral_code?: string
          sponsor_id?: string | null
          placement_parent_id?: string | null
          leg?: 'left' | 'right' | null
          placement_locked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'user' | 'superadmin'
          status?: 'pending' | 'active' | 'inactive' | 'cancelled'
          referral_code?: string
          sponsor_id?: string | null
          placement_parent_id?: string | null
          leg?: 'left' | 'right' | null
          placement_locked_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: 'active' | 'inactive' | 'cancelled'
          currency: 'USD' | 'COP'
          base_amount: number
          bookmaker_amount: number
          total_amount: number
          current_period_start: string
          current_period_end: string
          stripe_subscription_id: string | null
          bold_subscription_id: string | null
          crypto_payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'active' | 'inactive' | 'cancelled'
          currency?: 'USD' | 'COP'
          base_amount?: number
          bookmaker_amount?: number
          total_amount: number
          current_period_start?: string
          current_period_end?: string
          stripe_subscription_id?: string | null
          bold_subscription_id?: string | null
          crypto_payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'active' | 'inactive' | 'cancelled'
          currency?: 'USD' | 'COP'
          base_amount?: number
          bookmaker_amount?: number
          total_amount?: number
          current_period_start?: string
          current_period_end?: string
          stripe_subscription_id?: string | null
          bold_subscription_id?: string | null
          crypto_payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookmakers: {
        Row: {
          id: string
          name: string
          slug: string
          price: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          price?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          price?: number
          is_active?: boolean
          created_at?: string
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
      user_role: 'user' | 'superadmin'
      user_status: 'pending' | 'active' | 'inactive' | 'cancelled'
      subscription_status: 'active' | 'inactive' | 'cancelled'
      currency: 'USD' | 'COP'
    }
  }
}
