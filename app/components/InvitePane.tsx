import { useState } from "react";
import type { Profile } from "../utils/types";

type InvitePanePropsTypes = {
  displayName: string;
  partyId: string;
  partyMembers: Profile[];
  supabase: any;
  close: () => void;
}

export default function InvitePane({ displayName, partyId, partyMembers, supabase, close }: InvitePanePropsTypes) {
  
  const [username, setUsername] = useState('');

  const handleInviteUser = async () => {
    console.log("Inviting user: ", username);
    if (partyMembers.some((member) => member.display_name === username)) {
      console.log("User already in party");
      setUsername('');
      return;
    }

    const { error } = await supabase.from('invites').insert([
      { sender_display_name: displayName, receiver_display_name: username, party_id: partyId }
    ]);

    if (error) {
      console.log("Error inviting user: ", error.message);
    }

    setUsername('');
  }

	return (
	    <div className="absolute flex flex-col items-center w-44 h-32 top-2 left-48 rounded shadow-lg bg-white">
        <div className="flex w-full justify-between items-center p-2">
          <p className="font-light text-lg px-2">Invite</p>
          <button onClick={close}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
	      <input 
          value={username} 
          placeholder="username" 
          className="w-10/12 h-8 px-2 my-1 border-2 border-black rounded text-black outline-none" 
          onChange={(e) => setUsername(e.target.value)} 
        />
	      <button className="w-10/12 h-8 my-1 bg-black text-white rounded" onClick={handleInviteUser}>Invite</button>
		</div>
	)
}
