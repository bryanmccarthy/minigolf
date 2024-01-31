import { useEffect, useState } from "react";
import type { Party } from "../utils/types";

export default function useParty(supabase: any, userId: string) {
  const [party, setParty] = useState<Party | null>(null);

  useEffect(() => {
    const fetchParty= async () => {
      const { data } = await supabase.from("parties").select().contains("members", [userId]);

      if (data) {
        setParty(data[0]); // A user can only exist in one party
      }
    }

    fetchParty();
  }, [])

  return party;
}