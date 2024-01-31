import { useEffect, useState } from "react";
import type { Party } from "../utils/types";

export default function useParty(supabase: any, partyId: string) {
  const [party, setParty] = useState<Party | null>(null);

  console.log("partyId: ", partyId);

  useEffect(() => {
    const fetchParty= async () => {
      const { data } = await supabase.from("parties").select().eq("id", partyId);
      
      if (data) {
        setParty(data[0]);
      }
    }

    fetchParty();
  }, [])

  return party;
}