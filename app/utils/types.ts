import type { Session, SupabaseClient } from "@supabase/supabase-js";

export type OutletContext = {
  supabase: SupabaseClient;
  session: Session;
};

export type Party = {
  id: string;
  members: string[];
  course: string; // TODO: actually add course in supabase 
  leader: string;
  createdAt: string;
  updatedAt: string;
};
