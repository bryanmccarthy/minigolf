import type { Profile } from '../utils/types';

type PartyMemberEditPanePropsTypes = {
  handleClosePartyMemberEdit: () => void;
  handleMakeSelectedMemberLeader: () => void;
  handleKickUserFromParty: (id: string) => void;
  member: Profile | null;
}

export default function PartyMemberEditPane({ handleClosePartyMemberEdit, handleMakeSelectedMemberLeader, handleKickUserFromParty, member }: PartyMemberEditPanePropsTypes) {

  if (!member) {
    return null;
  }

  return (
    <div className="absolute flex flex-col justify-center items-center left-44 ml-2 top-0 w-40 h-32 rounded shadow-lg bg-white">
      <button className="ml-auto p-2" onClick={handleClosePartyMemberEdit}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
      <button className="w-10/12 h-8 my-1 bg-blue-500 hover:bg-blue-600 text-white rounded shadow" onClick={handleMakeSelectedMemberLeader}>
        make leader
      </button>
      <button className="w-10/12 h-8 my-1 bg-red-500 hover:bg-red-600 text-white rounded shadow" onClick={() => handleKickUserFromParty(member.id)}>
        kick
      </button>
    </div>
  )
}