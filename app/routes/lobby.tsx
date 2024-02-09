import { useState, useEffect, useRef } from "react";
import { Link, useOutletContext, useNavigate } from "@remix-run/react";
import type { OutletContext, Profile, Party, Message } from "../utils/types";
import useProfile from "../hooks/useProfile";
import InvitePane from "../components/InvitePane";
import PartyMessagesBox from "~/components/PartyMessagesBox";
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js";

const courses = [
  "Practice",
  "Lazy Links",
  "Fairways"
];

export default function Lobby() {
  const navigate = useNavigate();
  const { session, supabase } = useOutletContext<OutletContext>();
  const profile = useProfile(supabase, session.user.id);
  const [party, setParty] = useState<Party | null>(null);
  const [partyMembers, setPartyMembers] = useState<Profile[]>([]);
  const [partyMessages, setPartyMessages] = useState<Message[]>([]);
  const [courseSelected, setCourseSelected] = useState('Practice');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInvitePane, setShowInvitePane] = useState(false);
  const [showUsernameSave, setShowUsernameSave] = useState(false);
  const [usernameEdit, setUsernameEdit] = useState("");
  const [showPartyMemberEdit, setShowPartyMemberEdit] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const messagesBoxRef = useRef<HTMLDivElement>(null);

  const handleToggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  }

  const handleToggleInvitePane = () => {
    setShowInvitePane(!showInvitePane);
    // Make sure conflicting panes are closed
    setShowPartyMemberEdit(false);
  }

  const handleOpenPartyMemberEdit = (member: Profile) => {
    setSelectedMember(member);
    setShowPartyMemberEdit(true);
    // Make sure conflicting panes are closed
    setShowInvitePane(false);
  }

  const handleClosePartyMemberEdit = () => {
    setShowPartyMemberEdit(false);
  }

  const handleShowCourseDropdown = () => {
    setShowCourseDropdown(!showCourseDropdown);
  }

  const handleCourseSelected = (course: string) => {
    setCourseSelected(course);
    setShowCourseDropdown(false);
  }

  const handleUsernameInputChange = (e: any) => {
    setUsernameEdit(e.target.value);
    if (e.target.value !== profile?.display_name) {
      setShowUsernameSave(true);
    } else {
      setShowUsernameSave(false);
    }
  }

  const handleUsernameSave = async () => {
    setShowUsernameSave(false);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: usernameEdit })
      .eq("id", session.user.id);

    if (error) {
      console.log("error: ", error); // TODO: handle error
    }
  }

  const handleMessageChange = (e: any) => {
    setMessage(e.target.value);
  }

  const handleSendMessage = async () => {
    console.log("sending message: ", message);

    const { error } = await supabase
      .from("messages")
      .insert([
        { party_id: profile?.party_id, sender_id: profile?.id, content: message }
      ]);

    if (error) {
      console.log("error: ", error); // TODO: handle error
    } else {
      setMessage("");
    }
  }

  const handleMakeSelectedMemberLeader = async () => {
    const { data, error } = await supabase
      .from("parties")
      .update({ leader: selectedMember?.id })
      .eq("id", profile?.party_id);

    if (error) {
      console.log("error: ", error); // TODO: handle error
    } else {
      console.log("made selected member leader");
      console.log("data: ", data);
      // TODO: update party state
    }
  }

  const handleKickUserFromParty = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ party_id: null })
      .eq("id", id);

    if (error) {
      console.log("error: ", error); // TODO: handle error
    } else {
      console.log("kicked user from party");
      setPartyMembers(partyMembers.filter((member: Profile) => member.id !== id));
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("error: ", error); // TODO: handle error
    } else {
      navigate("/");
    }
  }

  useEffect(() => {
    const fetchParty = async () => {
      const { data, error } = await supabase.from("parties").select().eq("id", profile?.party_id);
      if (data) {
        setParty(data[0]);
      } else {
        console.log("error: ", error); // TODO: handle error
      }
    }

    const fetchPartyMembers = async () => {
      const { data, error } = await supabase.from("profiles").select().eq("party_id", profile?.party_id);
      if (data) {
        const filteredData = data.filter((member: Profile) => member.id !== profile?.id);
        setPartyMembers(filteredData);
      } else {
        console.log("error: ", error); // TODO: handle error
      }
    }

    const fetchPartyMessages = async () => {
      const { data, error } = await supabase.from('messages').select().eq('party_id', profile?.party_id);
      if (data) {
        setPartyMessages(data);
      } else {
        console.log("error: ", error); // TODO: handle error
      }
    }

    if (profile) {
      fetchParty();
      fetchPartyMembers();
      fetchPartyMessages();
    }

    const messageChannel = supabase.channel('messages');

    messageChannel
      .on(
        'postgres_changes', 
        { event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `party_id=eq.${profile?.party_id}` 
        },
        (
          payload: RealtimePostgresInsertPayload<Message>
        ) => {
          setPartyMessages((prevMsgs: Message[]) => {
            const messages = [...prevMsgs];
            const msg = (({ id, party_id, sender_id, content, created_at }: Message) => ({
              id,
              party_id,
              sender_id,
              content,
              created_at
            }))(payload.new);

            messages.push(msg);

            return messages;
          })
        }
      )
      .subscribe()

      return () => {
        messageChannel && supabase.removeChannel(messageChannel)
      }

  }, [profile]);

  useEffect(() => {
    if (messagesBoxRef.current) {
      messagesBoxRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [partyMessages]);

  return (
    <>
      <div className="flex flex-col bg-gradient-to-b from-blue-300 to-blue-200 h-[calc(100dvh)]">
        <div className="relative flex">
          {/* Invite Pane */}
          { showInvitePane &&
            <InvitePane
              close={handleToggleInvitePane}
            />
          }
          <div className="flex flex-col gap-2 p-2 w-48">
            <div className="flex flex-col">
              <div className="flex items-end gap-1">
                <p className="text-2xl font-semibold text-black">Lobby</p>
                { party?.leader === profile?.id ?
                  <button className="pl-3" onClick={handleToggleInvitePane}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                      <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                    </svg>
                  </button>
                :
                  <div className="pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                      <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                    </svg>
                  </div>
                }
              </div>
              <div className="flex flex-col gap-2 py-2">
                <div className="flex items-center h-12 bg-slate-700 rounded shadow-lg">
                  <p className="w-40 text-white text-lg px-2 truncate">{ usernameEdit ? usernameEdit : profile?.display_name } (Me)</p>
                  { party?.leader === profile?.id &&
                    <div className="p-2 text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                      </svg>
                    </div>
                  }
                </div>
                { partyMembers.map((member: Profile, idx: number) => (
                  <div key={idx} className="relative flex items-center h-12 bg-white rounded shadow-lg">
                    <p className="w-40 text-black text-lg px-2 truncate">{ member.display_name }</p>
                    { party?.leader === member.id &&
                      <div className="p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                        </svg>
                      </div>
                    }
                    { party?.leader === profile?.id &&
                      <div className="p-2 cursor-pointer transform hover:scale-110" onClick={() => handleOpenPartyMemberEdit(member)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                        </svg>
                      </div>
                    }
                    { showPartyMemberEdit &&
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
                    }
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col pt-2">
              <p className="text-2xl font-semibold text-black py-2">
                Course
              </p>
              <div className="relative flex flex-col gap-2">
                <div className="flex items-center justify-between h-12 bg-white rounded shadow-lg cursor-pointer" onClick={handleShowCourseDropdown}>
                  <p className="text-black text-lg px-2 truncate">{courseSelected}</p>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                  </svg>
                </div>
                <Link to={`/${courseSelected}`} className="flex items-center justify-center bg-orange-200 rounded h-12 shadow-lg">
                  <p className="text-black text-xl font-semibold">Start</p>
                </Link>
                { showCourseDropdown &&
                  <div className="absolute flex flex-col top-0 right-0 w-full rounded shadow-lg bg-white">
                    <button className="ml-auto p-2" onClick={handleShowCourseDropdown}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="flex flex-col gap-2 pb-2">
                      { courses.filter((course: string) => course !== courseSelected).map((course: string, idx: number) => (
                          <button key={idx} className="text-black text-lg text-start px-4 truncate bg-neutral-100 hover:bg-neutral-200 rounded mx-1" onClick={() => handleCourseSelected(course)}>{ course }</button>
                        ))
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
          <div className="relative flex flex-col gap-2 p-2 ml-auto">
            <div className="flex ml-auto justify-center items-center w-12 h-12 bg-white rounded shadow-lg cursor-pointer hover:bg-neutral-100" onClick={handleToggleUserMenu}>
              <p className="text-black text-2xl font-extrabold">{ profile?.display_name[0] }</p>
            </div>
            <PartyMessagesBox partyMessages={partyMessages} profile={profile} messagesBoxRef={messagesBoxRef} />
            <div className="flex gap-1 w-80">
              <input value={message} className="w-full h-8 bg-white rounded shadow-lg outline-none px-1" placeholder="message..." onChange={(e) => handleMessageChange(e)} />
              <button className="h-8 px-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow-lg" onClick={handleSendMessage}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
            { showUserMenu &&
              <div className="absolute flex flex-col top-0 right-0 w-56 m-2 rounded shadow-lg bg-white">
                <button className="text-black text-xl font-semibold ml-auto p-2" onClick={handleToggleUserMenu}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex flex-col gap-3 p-3 mt-auto">
                  <div className="flex items-center text-neutral-700 bg-neutral-100 px-2 py-1 rounded font-semibold truncate">
                    <input className="w-40 bg-neutral-100 outline-none" value={usernameEdit ? usernameEdit : profile?.display_name} onChange={(e) => handleUsernameInputChange(e)} />
                    { showUsernameSave &&
                      <button className="ml-auto h-5 w-5 rounded bg-neutral-800 text-white" onClick={handleUsernameSave}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </button>
                    }
                  </div>
                  <p className="text-neutral-700 bg-neutral-100 px-2 py-1 rounded font-semibold cursor-default truncate">{ session.user.email }</p>
                  <button className="text-red-500 px-2 py-1 text-start hover:text-red-600" onClick={handleSignOut}>Sign Out</button>
                </div>
              </div>
            }
          </div>
        </div>
        <div className="flex justify-center items-center py-28 mt-auto">
          <div className="flex p-10 rounded-full bg-green-500 w-56 h-48 shadow-xl">
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-100 shadow-inner shadow-gray-400"></div>
          </div>
        </div>
      </div>
    </>
  )
}
