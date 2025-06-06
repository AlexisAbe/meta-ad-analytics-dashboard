export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ads_data: {
        Row: {
          ad_body: string | null
          ad_id: string
          audience_eu_total: number | null
          audience_fr_18_24_f: number | null
          audience_fr_18_24_h: number | null
          audience_fr_25_34_f: number | null
          audience_fr_25_34_h: number | null
          audience_fr_35_44_f: number | null
          audience_fr_35_44_h: number | null
          audience_fr_45_54_f: number | null
          audience_fr_45_54_h: number | null
          audience_fr_55_64_f: number | null
          audience_fr_55_64_h: number | null
          audience_fr_65_plus_f: number | null
          audience_fr_65_plus_h: number | null
          brand: string
          budget_estimated: number | null
          created_at: string | null
          creative_format: string | null
          days_active: number | null
          end_date: string | null
          id: string
          link_caption: string | null
          link_description: string | null
          link_title: string | null
          project_id: string | null
          snapshot_url: string | null
          start_date: string | null
          start_month: string | null
        }
        Insert: {
          ad_body?: string | null
          ad_id: string
          audience_eu_total?: number | null
          audience_fr_18_24_f?: number | null
          audience_fr_18_24_h?: number | null
          audience_fr_25_34_f?: number | null
          audience_fr_25_34_h?: number | null
          audience_fr_35_44_f?: number | null
          audience_fr_35_44_h?: number | null
          audience_fr_45_54_f?: number | null
          audience_fr_45_54_h?: number | null
          audience_fr_55_64_f?: number | null
          audience_fr_55_64_h?: number | null
          audience_fr_65_plus_f?: number | null
          audience_fr_65_plus_h?: number | null
          brand: string
          budget_estimated?: number | null
          created_at?: string | null
          creative_format?: string | null
          days_active?: number | null
          end_date?: string | null
          id?: string
          link_caption?: string | null
          link_description?: string | null
          link_title?: string | null
          project_id?: string | null
          snapshot_url?: string | null
          start_date?: string | null
          start_month?: string | null
        }
        Update: {
          ad_body?: string | null
          ad_id?: string
          audience_eu_total?: number | null
          audience_fr_18_24_f?: number | null
          audience_fr_18_24_h?: number | null
          audience_fr_25_34_f?: number | null
          audience_fr_25_34_h?: number | null
          audience_fr_35_44_f?: number | null
          audience_fr_35_44_h?: number | null
          audience_fr_45_54_f?: number | null
          audience_fr_45_54_h?: number | null
          audience_fr_55_64_f?: number | null
          audience_fr_55_64_h?: number | null
          audience_fr_65_plus_f?: number | null
          audience_fr_65_plus_h?: number | null
          brand?: string
          budget_estimated?: number | null
          created_at?: string | null
          creative_format?: string | null
          days_active?: number | null
          end_date?: string | null
          id?: string
          link_caption?: string | null
          link_description?: string | null
          link_title?: string | null
          project_id?: string | null
          snapshot_url?: string | null
          start_date?: string | null
          start_month?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "top_ads_monthly"
            referencedColumns: ["project_id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      ads_monthly: {
        Row: {
          ads_active_end_month: number | null
          brand: string | null
          budget_monthly: number | null
          month: string | null
          reach_monthly: number | null
          total_ads_started: number | null
        }
        Relationships: []
      }
      top_ads_monthly: {
        Row: {
          ad_id: string | null
          brand: string | null
          budget_estimated: number | null
          duration: number | null
          end_date: string | null
          link_title: string | null
          month: string | null
          project_id: string | null
          project_name: string | null
          rank_by_duration: number | null
          rank_by_reach: number | null
          reach: number | null
          start_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_top_ads_by_project: {
        Args: { p_project_id: string; p_limit?: number; p_metric?: string }
        Returns: {
          brand: string
          month: string
          ad_id: string
          link_title: string
          reach: number
          duration: number
          budget_estimated: number
          start_date: string
          end_date: string
          rank: number
          snapshot_url: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
