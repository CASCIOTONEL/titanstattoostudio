export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_user_connections: {
        Row: {
          connection_key_ciphertext: string
          connector_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_key_ciphertext: string
          connector_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_key_ciphertext?: string
          connector_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          alergias: string | null
          cep: string | null
          cidade: string | null
          created_at: string
          documento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nascimento: string | null
          nome: string
          observacoes: string | null
          origem: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          alergias?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nascimento?: string | null
          nome: string
          observacoes?: string | null
          origem?: string | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          alergias?: string | null
          cep?: string | null
          cidade?: string | null
          created_at?: string
          documento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nascimento?: string | null
          nome?: string
          observacoes?: string | null
          origem?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      comissoes_pagas: {
        Row: {
          created_at: string
          id: string
          pagar_em: string
          pago_em: string
          periodo_fim: string
          periodo_inicio: string
          registrado_por: string | null
          tatuador: string
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          id?: string
          pagar_em: string
          pago_em?: string
          periodo_fim: string
          periodo_inicio: string
          registrado_por?: string | null
          tatuador: string
          updated_at?: string
          valor: number
        }
        Update: {
          created_at?: string
          id?: string
          pagar_em?: string
          pago_em?: string
          periodo_fim?: string
          periodo_inicio?: string
          registrado_por?: string | null
          tatuador?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          altura_cm: number
          aviso_em: string | null
          aviso_wa_id: string | null
          cor: string | null
          created_at: string
          disponibilidade: string | null
          email: string | null
          endereco: string | null
          id: string
          ideia: string
          largura_cm: number
          local_corpo: string
          nome: string
          observacoes: string | null
          referencias: string[]
          servico: string
          status: string
          tatuador: string | null
          tipo: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          altura_cm: number
          aviso_em?: string | null
          aviso_wa_id?: string | null
          cor?: string | null
          created_at?: string
          disponibilidade?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          ideia: string
          largura_cm: number
          local_corpo: string
          nome: string
          observacoes?: string | null
          referencias?: string[]
          servico: string
          status?: string
          tatuador?: string | null
          tipo?: string | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          altura_cm?: number
          aviso_em?: string | null
          aviso_wa_id?: string | null
          cor?: string | null
          created_at?: string
          disponibilidade?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          ideia?: string
          largura_cm?: number
          local_corpo?: string
          nome?: string
          observacoes?: string | null
          referencias?: string[]
          servico?: string
          status?: string
          tatuador?: string | null
          tipo?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          cliente_nome: string
          comissao_percentual: number
          created_at: string
          data: string
          forma: string
          id: string
          lead_id: string | null
          observacoes: string | null
          registrado_por: string | null
          tatuador: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          cliente_nome: string
          comissao_percentual?: number
          created_at?: string
          data?: string
          forma: string
          id?: string
          lead_id?: string | null
          observacoes?: string | null
          registrado_por?: string | null
          tatuador?: string | null
          tipo?: string
          updated_at?: string
          valor: number
        }
        Update: {
          cliente_nome?: string
          comissao_percentual?: number
          created_at?: string
          data?: string
          forma?: string
          id?: string
          lead_id?: string | null
          observacoes?: string | null
          registrado_por?: string | null
          tatuador?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          id: string
          nome: string | null
          tatuador: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          tatuador?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          tatuador?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_mensagens: {
        Row: {
          corpo: string | null
          created_at: string
          destinatario: string
          erro: Json | null
          id: string
          lead_id: string | null
          provider_id: string | null
          status: string
          status_em: string | null
          updated_at: string
        }
        Insert: {
          corpo?: string | null
          created_at?: string
          destinatario: string
          erro?: Json | null
          id?: string
          lead_id?: string | null
          provider_id?: string | null
          status?: string
          status_em?: string | null
          updated_at?: string
        }
        Update: {
          corpo?: string | null
          created_at?: string
          destinatario?: string
          erro?: Json | null
          id?: string
          lead_id?: string | null
          provider_id?: string | null
          status?: string
          status_em?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_mensagens_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_webhook_events: {
        Row: {
          delivery_id: string
          event: string
          id: string
          payload: Json
          processed_at: string | null
          processing_error: string | null
          received_at: string
        }
        Insert: {
          delivery_id: string
          event: string
          id?: string
          payload: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Update: {
          delivery_id?: string
          event?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "master" | "recepcao" | "financeiro" | "tatuador"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["master", "recepcao", "financeiro", "tatuador"],
    },
  },
} as const
