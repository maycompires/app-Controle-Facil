export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          description: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          description?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          description?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      weekly_budgets: {
        Row: {
          id: string
          user_id: string
          amount: number
          week_start: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          week_start: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          week_start?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Expense = Database["public"]["Tables"]["expenses"]["Row"]
export type WeeklyBudget = Database["public"]["Tables"]["weekly_budgets"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
