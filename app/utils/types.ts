import type { Session, SupabaseClient } from "@supabase/supabase-js";

export type OutletContext = {
  supabase: SupabaseClient;
  session: Session;
};

export type Profile = {
  id: string;
  display_name: string;
  party_id: string;
  ball_x: number;
  ball_y: number;
};

export type Party = {
  id: string;
  leader: string;
  game_state: string;
  course: string;
};

export type Message = {
  id: string;
  party_id: string;
  sender_id: string;
  sender_display_name: string;
  content: string;
  created_at: string;
}

export type Invite = {
  id: string;
  sender_display_name: string;
  receiver_display_name: string;
  party_id: string;
}
