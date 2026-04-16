export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      flashcard_sets: {
        Row: {
          id: string
          user_id: string
          title: string
          flashcards: string
          source_type: string
          source_name: string
          difficulty_level: string
          card_format: string
          total_cards: number
          metadata: Json
          created_at: string
          updated_at: string
          status: string
          is_public: boolean
          share_id: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          flashcards: string
          source_type: string
          source_name: string
          difficulty_level: string
          card_format: string
          total_cards: number
          metadata?: Json
          created_at?: string
          updated_at?: string
          status?: string
          is_public?: boolean
          share_id?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          flashcards?: string
          source_type?: string
          source_name?: string
          difficulty_level?: string
          card_format?: string
          total_cards?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
          status?: string
          is_public?: boolean
          share_id?: string | null
          expires_at?: string | null
        }
      }
      quizzes_normalized: {
        Row: {
          id: string
          user_id: string
          title: string
          difficulty_level: string | null
          source_type: string
          source_name: string | null
          task_id: string | null
          is_public: boolean
          share_id: string | null
          expires_at: string | null
          metadata: Json
          settings: Json
          total_questions: number
          view_count: number
          completion_count: number
          validation_info: Json | null
          content_hash: string | null
          created_at: string
          updated_at: string
          file_hash: string | null
          include_explanations: boolean | null
          language: string | null
          question_type: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          difficulty_level?: string | null
          source_type: string
          source_name?: string | null
          task_id?: string | null
          is_public?: boolean
          share_id?: string | null
          expires_at?: string | null
          metadata?: Json
          settings?: Json
          total_questions?: number
          view_count?: number
          completion_count?: number
          validation_info?: Json | null
          content_hash?: string | null
          created_at?: string
          updated_at?: string
          file_hash?: string | null
          include_explanations?: boolean | null
          language?: string | null
          question_type?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          difficulty_level?: string | null
          source_type?: string
          source_name?: string | null
          task_id?: string | null
          is_public?: boolean
          share_id?: string | null
          expires_at?: string | null
          metadata?: Json
          settings?: Json
          total_questions?: number
          view_count?: number
          completion_count?: number
          validation_info?: Json | null
          content_hash?: string | null
          created_at?: string
          updated_at?: string
          file_hash?: string | null
          include_explanations?: boolean | null
          language?: string | null
          question_type?: string | null
        }
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question_text: string
          question_type: string
          position: number
          difficulty: string | null
          points: number
          time_limit: number | null
          settings: Json
          encrypted_data: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          question_text: string
          question_type: string
          position: number
          difficulty?: string | null
          points?: number
          time_limit?: number | null
          settings?: Json
          encrypted_data?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          question_text?: string
          question_type?: string
          position?: number
          difficulty?: string | null
          points?: number
          time_limit?: number | null
          settings?: Json
          encrypted_data?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      question_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          is_correct: boolean
          position: number
          explanation: string | null
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          option_text: string
          is_correct?: boolean
          position: number
          explanation?: string | null
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          option_text?: string
          is_correct?: boolean
          position?: number
          explanation?: string | null
          points?: number
          created_at?: string
        }
      }
      question_explanations: {
        Row: {
          id: string
          question_id: string
          explanation_text: string
          explanation_type: string
          encrypted_explanation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: string
          explanation_text: string
          explanation_type?: string
          encrypted_explanation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          explanation_text?: string
          explanation_type?: string
          encrypted_explanation?: string | null
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
