// Hand-written database types matching supabase/migrations/.
// You can replace this with `supabase gen types typescript` output once you
// run the CLI against your project.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          city: string | null;
          country: string | null;
          whatsapp: string | null;
          show_contact: boolean;
          share_slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          city?: string | null;
          country?: string | null;
          whatsapp?: string | null;
          show_contact?: boolean;
          share_slug: string;
        };
        Update: {
          display_name?: string;
          city?: string | null;
          country?: string | null;
          whatsapp?: string | null;
          show_contact?: boolean;
          share_slug?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          abbr: string;
          display_name: string | null;
          sort_order: number;
        };
        Insert: { abbr: string; display_name?: string | null; sort_order?: number };
        Update: { display_name?: string | null; sort_order?: number };
        Relationships: [];
      };
      cards: {
        Row: {
          id: string;
          team_abbr: string;
          card_number: number;
          card_code: string;
        };
        Insert: { team_abbr: string; card_number: number };
        Update: { team_abbr?: string; card_number?: number };
        Relationships: [];
      };
      user_card_needs: {
        Row: {
          user_id: string;
          card_id: string;
          quantity_needed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          card_id: string;
          quantity_needed?: number;
        };
        Update: {
          quantity_needed?: number;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          sender_id: string;
          recipient_id: string;
          body: string;
          read_at?: string | null;
        };
        Update: {
          read_at?: string | null;
        };
        Relationships: [];
      };
      user_card_duplicates: {
        Row: {
          user_id: string;
          card_id: string;
          quantity_available: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          card_id: string;
          quantity_available?: number;
        };
        Update: {
          quantity_available?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      v_direct_card_matches: {
        Row: {
          seeker_user_id: string;
          owner_user_id: string;
          card_id: string;
          card_code: string;
          team_abbr: string;
          card_number: number;
          quantity_needed: number;
          quantity_available: number;
          possible_quantity: number;
        };
        Relationships: [];
      };
      v_user_match_summary: {
        Row: {
          seeker_user_id: string;
          owner_user_id: string;
          owner_display_name: string;
          city: string | null;
          country: string | null;
          whatsapp: string | null;
          share_slug: string;
          cards_owner_can_give: number;
          total_owner_can_give: number;
          cards_seeker_can_give: number;
          total_seeker_can_give: number;
          match_type: "MUTUAL" | "DIRECT" | "NONE";
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
