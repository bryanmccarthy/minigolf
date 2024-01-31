import { useEffect, useState } from "react";
import type { Profile } from "../utils/types";

export default function useProfile(supabase: any, userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile= async () => {
      const { data } = await supabase.from("profiles").select().eq("id", userId);

      if (data) {
        setProfile(data[0]);
      }
    }

    fetchProfile();
  }, [])

  return profile;
}