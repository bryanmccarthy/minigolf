import type { Message, Profile } from "../utils/types";

type PartyMessagesBoxPropsTypes = {
  partyMessages: Message[];
  profile: Profile | null;
  messagesBoxRef: React.MutableRefObject<HTMLDivElement | null>;
}

export default function PartyMessagesBox({ partyMessages, profile, messagesBoxRef }: PartyMessagesBoxPropsTypes) {
  return (
    <div className="flex flex-col overflow-y-scroll shadow-inner px-1 bg-neutral-50 bg-opacity-20 rounded-t h-64 border-neutral-100 w-80">
      { partyMessages.map((message: Message, idx: number) => (
          message.sender_id === profile?.id ?
          <div key={idx} className="flex flex-col p-1 mx-1">
            <div className="ml-auto bg-orange-200 shadow w-fit min-w-6 max-w-56 min-h-8 rounded-lg rounded-br-sm p-1">{ message.content }</div>
            <div className="ml-auto text-xs font-thin text-neutral-600">{ new Date(message.created_at).toLocaleString('en-US', { day: "2-digit", month: "short", hour: 'numeric', minute: 'numeric', hour12: true }) }</div>
          </div>
        :
          <div key={idx} className="flex flex-col p-1 mx-1">
            <div className="bg-neutral-100 shadow-lg w-fit min-w-6 max-w-56 min-h-8 rounded-lg rounded-bl-sm p-1">{ message.content }</div>
            <div className="flex gap-1">
              <div className="text-xs font-thin text-neutral-600">{ message.sender_display_name }</div>
              <div className="text-xs font-thin text-neutral-600">•</div>
              <div className="text-xs font-thin text-neutral-600">{ new Date(message.created_at).toLocaleString('en-US', { day: "2-digit", month: "short", hour: 'numeric', minute: 'numeric', hour12: true }) }</div>
            </div>
          </div>
        ))
      }
      <div ref={messagesBoxRef}></div>
    </div>
  )
}