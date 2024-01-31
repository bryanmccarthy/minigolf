import type { Session, SupabaseClient } from "@supabase/supabase-js";

export type OutletContext = {
  supabase: SupabaseClient;
  session: Session;
};

export type Profile = {
  id: string;
  display_name: string;
  party_id: string;
}

export type Party = {
  id: string;
  leader: string;
  createdAt: string;
  updatedAt: string;
};
