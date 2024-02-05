import { useState } from "react";
import InvitePane from "../components/InvitePane";

export default function NewLobby() {
  const [showInvitePane, setShowInvitePane] = useState(false);
  const [showPartyMemberEdit, setShowPartyMemberEdit] = useState(false);

  const handleToggleInvitePane = () => {
    setShowInvitePane(!showInvitePane);
    // Make sure conflicting panes are closed
    setShowPartyMemberEdit(false);
  }

	return (
		<>
			<div className="flex flex-col bg-flex flex-col bg-gradient-to-b from-blue-300 to-blue-200 h-[calc(100dvh)]">
				<div className="relative flex">
					{ !showInvitePane &&
						<InvitePane close={handleToggleInvitePane} />
					}
				</div>
			</div>
		</>
	)
}
