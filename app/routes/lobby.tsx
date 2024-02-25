import { useState, useEffect, useRef } from "react";
import { Link, useOutletContext, useNavigate } from "@remix-run/react";
import type { OutletContext, Profile, Party, Message, Invite } from "../utils/types";
import useProfile from "../hooks/useProfile";
import InvitePane from "../components/InvitePane";
import PartyMessagesBox from "../components/PartyMessagesBox";
import PartyMemberEditPane from "../components/PartyMemberEditPane";
import { RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from "@supabase/supabase-js";

const courses = [
  "Practice",
  "Lazy Links",
  "Fairways"
];

export default function Lobby() {
  const navigate = useNavigate();
  const { session, supabase } = useOutletContext<OutletContext>();
  // const profile = useProfile(supabase, session.user.id);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [partyMembers, setPartyMembers] = useState<Profile[]>([]);
  const [partyMessages, setPartyMessages] = useState<Message[]>([]);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifcations, setShowNotifications] = useState(false);
  const [showInvitePane, setShowInvitePane] = useState(false);
  const [showConfirmLeaveParty, setShowConfirmLeaveParty] = useState(false);
  const [showUsernameSave, setShowUsernameSave] = useState(false);
  const [usernameEdit, setUsernameEdit] = useState("");
  const [showPartyMemberEdit, setShowPartyMemberEdit] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [showPartyMessagesBox, setShowPartyMessagesBox] = useState(false);
  const [message, setMessage] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const messagesBoxRef = useRef<HTMLDivElement>(null);

  const handleToggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  }

  const handleToggleInvitePane = () => {
    setShowInvitePane(!showInvitePane);
    // Make sure conflicting panes are closed
    setShowPartyMemberEdit(false);
    setShowConfirmLeaveParty(false);
  }

  const handleToggleLeavePartyPane = () => {
    setShowConfirmLeaveParty(!showConfirmLeaveParty);
    // Make sure conflicting panes are closed
    setShowPartyMemberEdit(false);
    setShowInvitePane(false);
  }

  const handleOpenPartyMemberEdit = (member: Profile) => {
    setSelectedMember(member);
    setShowPartyMemberEdit(true);
    // Make sure conflicting panes are closed
    setShowInvitePane(false);
    setShowConfirmLeaveParty(false);
  }

  const handleClosePartyMemberEdit = () => {
    setShowPartyMemberEdit(false);
  }

  const handleShowCourseDropdown = () => {
    setShowCourseDropdown(!showCourseDropdown);
  }

  const handleCourseSelected = async (course: string) => {
    const { error } = await supabase.from("parties").update({ course }).eq("id", profile?.party_id);

    if (error) {
      console.log("error: ", error); // TODO: handle error
    } else {
      setShowCourseDropdown(false);
    }
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
    if (!profile) return;

    const { error } = await supabase
      .from("messages")
      .insert([
        { party_id: profile.party_id, sender_id: profile.id, sender_display_name: profile.display_name, content: message }
      ]);

    if (error) {
      console.log("error: ", error); // TODO: handle error
    } else {
      setMessage("");
    }
  }

  const handleMakeSelectedMemberLeader = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from("parties")
      .update({ leader: selectedMember?.id })
      .eq("id", profile.party_id);

    if (error) {
      console.log("error: ", error); // TODO: handle error
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
      // setPartyMembers(partyMembers.filter((member: Profile) => member.id !== id));
    }
  }

  const removeLeaderFromParty = async () => {
    // Assign a new leader if the leader is leaving
    if (partyMembers.length < 1) {
      // Delete the party if the leader is the only member
      const { error } = await supabase.from("parties").delete().eq("id", profile?.party_id);

      if (error) {
        console.log("error: ", error); // TODO: handle error
      }
    } else {
      const newLeader = partyMembers.find((member: Profile) => member.id !== profile?.id);
      console.log("newLeader: ", newLeader);
      const { data, error } = await supabase.from("parties").update({ leader: newLeader?.id }).eq("id", profile?.party_id).select();

      if (error) {
        console.log("error: ", error); // TODO: handle error
      } else {
        console.log("party updated: ", data);
      }
    }
  }

  const handleLeaveParty = async () => {

    if (party?.leader === profile?.id) {
      removeLeaderFromParty();
    }

    const { error } = await supabase.from("profiles").update({ party_id: null }).eq("id", profile?.id).select();

    if (error) {
      console.log("error: ", error); // TODO: handle error
    } else {
      console.log("left party");
    }
  }

  const handleAcceptInvite = async (invite: Invite) => {

    // Leave current party
    if (party?.leader === profile?.id) {
      removeLeaderFromParty();
    }

    const { error } = await supabase.from("profiles").update({ party_id: invite.party_id }).eq("id", profile?.id).select();

    if (error) {
      console.log("error: ", error); // TODO: handle error
    } else {
      const { error } = await supabase.from("invites").delete().eq("id", invite.id);

      if (error) {
        console.log("error: ", error); // TODO: handle error
      } else {
        console.log("invite accepted");
        setInvites(invites.filter((inv: Invite) => inv.id !== invite.id));
        setShowNotifications(false);
      }
    }
  }

  const handleDeclineInvite = async (invite: Invite) => {
    const { error } = await supabase.from("invites").delete().eq("id", invite.id);

    if (error) {
      console.log("error: ", error); // TODO: handle error
    } else {
      console.log("invite declined");
      setInvites(invites.filter((inv: Invite) => inv.id !== invite.id));
    }
  }

  const handleStartGame = async () => {
    const { error } = await supabase.from("parties").update({ game_state: 'game' }).eq("id", profile?.party_id).select();

    if (error) {
      console.log("error: ", error); // TODO: handle error
    } else {
      navigate(`/${party?.course}`);
    }
  }

  const handleEndGameClick = async () => {
    if (party?.game_state === 'game') {
      const { error } = await supabase.from("parties").update({ game_state: 'lobby' }).eq("id", profile?.party_id).select();

      if (error) {
        console.log("error: ", error); // TODO: handle error
      }
    }
  }

  const handleJoinGameClick = () => {
    if (party?.game_state === 'game') {
      navigate(`/${party.course}`);
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
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select().eq("id", session.user.id);

      if (data) {
        setProfile(data[0]);
      }
    }

    const fetchParty = async () => {
      if (!profile) return;

      const { data, error } = await supabase.from("parties").select().eq("id", profile.party_id);
      if (data) {
        setParty(data[0]);
      } else {
        console.log("error: ", error); // TODO: handle error
      }
    }

    const fetchPartyMembers = async () => {
      if (!profile) return;

      const { data, error } = await supabase.from("profiles").select().eq("party_id", profile.party_id);
      if (data) {
        const filteredData = data.filter((member: Profile) => member.id !== profile.id);
        setPartyMembers(filteredData);
      } else {
        console.log("error: ", error); // TODO: handle error
      }
    }

    const fetchPartyMessages = async () => {
      if (!profile) return;

      const { data, error } = await supabase.from('messages').select().eq('party_id', profile.party_id);
      if (data) {
        setPartyMessages(data);
        if (data.length > 0) setShowPartyMessagesBox(true);
      } else {
        console.log("error: ", error); // TODO: handle error
      }
    }

    const createParty = async () => {
      const { data, error } = await supabase.from("parties").select().eq("leader", profile?.id);
      
      if (error) {
        console.log("error: ", error); // TODO: handle error
      } else {
        if (data.length > 0) {
          // Join the existing party
          const { error } = await supabase.from("profiles").update({ party_id: data[0].id }).eq("id", profile?.id).select();

          if (error) {
            console.log("error joining party: ", error); // TODO: handle error
          } else {
            setParty(data[0]);
          }
        } else {
          // Create a new party
          const { data, error } = await supabase.from("parties").insert([{ leader: profile?.id, game_state: 'lobby' }]).select();

          if (error) {
            console.log("error: ", error); // TODO: handle error
          } else {
            // Join the created party
            const partyId = data[0].id;
            const { error } = await supabase.from("profiles").update({ party_id: partyId }).eq("id", profile?.id).select();

            if (error) {
              console.log("error joining party: ", error); // TODO: handle error
            } else {
              setParty(data[0]);
            }
          }
        }
      }
    }

    const fetchInvites = async () => {
      const { data, error } = await supabase.from("invites").select().eq("receiver_display_name", profile?.display_name);

      if (error) {
        console.log("error: ", error); // TODO: handle error
      } else {
        console.log("invites: ", data);
        setInvites(data);
      }
    }

    if (profile) {
      if (profile.party_id === null) {
        createParty();
      } else {
        if (party === null) fetchParty();
        if (partyMembers.length === 0) fetchPartyMembers();
        if (partyMessages.length === 0) fetchPartyMessages();
      }

      if (invites.length === 0) fetchInvites();
    } else {
      fetchProfile();
    }

    const profileChannel = supabase.channel('profiles');

    if (profile?.party_id !== null) {
      profileChannel
        .on(
          'postgres_changes',
          { event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `party_id=eq.${profile?.party_id}`
          },
          (
            payload: RealtimePostgresUpdatePayload<Profile>
          ) => {
            const updatedProfileId = payload.new.id;

            if (updatedProfileId === profile?.id) {
              setProfile(payload.new);
            } else {
              const newPartyMembers = [...partyMembers];

              newPartyMembers.filter((member) => {
                member.id === updatedProfileId;
              })

              newPartyMembers.push(payload.new);
              setPartyMembers(newPartyMembers);
            }
          }
        )
        .subscribe();
    }

    const messageChannel = supabase.channel('messages');

    if (profile?.party_id !== null) {
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
              const msg = (({ id, party_id, sender_id, sender_display_name, content, created_at }: Message) => ({
                id,
                party_id,
                sender_id,
                sender_display_name,
                content,
                created_at
              }))(payload.new);

              messages.push(msg);

              return messages;
            })
          }
        )
        .subscribe();
    }

    const partyChannel = supabase.channel('parties');

    if (profile?.party_id !== null) {
      partyChannel
        .on(
          'postgres_changes',
          { event: 'UPDATE',
            schema: 'public',
            table: 'parties',
            filter: `id=eq.${profile?.party_id}`
          },
          (
            payload: RealtimePostgresUpdatePayload<Party>
          ) => {
            console.log("party update payload: ", payload);
            if (payload.new.game_state === 'game') {
              navigate(`/${payload.new.course}`);
            } else {
              setParty(payload.new);
              setShowPartyMemberEdit(false); // Hide after member is promoted to leader or kicked
            }
          }
        )
        .subscribe();
    }

    const inviteChannel = supabase.channel('invites');

    if (profile?.party_id !== null) {
      inviteChannel
        .on(
          'postgres_changes',
          { event: 'INSERT',
            schema: 'public',
            table: 'invites',
            filter: `receiver_display_name=eq.${profile?.display_name}`
          },
          (
            payload: RealtimePostgresInsertPayload<Invite> 
          ) => {
            console.log("new invite payload: ", payload);
            setInvites((prevInvs: Invite[]) => {
              const invites = [...prevInvs];
              const inv = (({ id, party_id, receiver_display_name, sender_display_name }: Invite) => ({
                id,
                party_id,
                receiver_display_name,
                sender_display_name
              }))(payload.new);

              invites.push(inv);

              return invites;
            })
          }
        )
        .subscribe();
    }

    return () => {
      messageChannel && supabase.removeChannel(messageChannel);
      partyChannel && supabase.removeChannel(partyChannel);
      inviteChannel && supabase.removeChannel(inviteChannel);
      profileChannel && supabase.removeChannel(profileChannel);
    }

  }, [profile]);

  useEffect(() => {
    if (messagesBoxRef.current) {
      messagesBoxRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [partyMessages]);

  if (!profile) {
    return null; // TODO: handle loading state
  }

  return (
    <>
      <div className="flex flex-col bg-sky-300 h-[calc(100dvh)]">
        <div className="relative flex">
          {/* Invite Pane */}
          { showInvitePane &&
            <InvitePane
              displayName={profile.display_name}
              partyId={profile.party_id}
              partyMembers={partyMembers}
              supabase={supabase}
              close={handleToggleInvitePane}
            />
          }
          <div className="flex flex-col gap-2 p-2 w-48">
            <div className="flex flex-col">
              <div className="flex items-end gap-1">
                <p className="text-2xl font-semibold text-black">Lobby</p>
                { party?.leader === profile.id ?
                  <button className="ml-auto" onClick={handleToggleInvitePane}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                      <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                    </svg>
                  </button>
                :
                  <div className="ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                      <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
                    </svg>
                  </div>
                }
                { partyMembers.length > 0 &&
                  <div className="relative text-red-600 cursor-pointer" onClick={handleToggleLeavePartyPane}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                    </svg>
                    { showConfirmLeaveParty &&
                      <div className="absolute flex justify-between items-center left-9 -top-1 w-44 h-10 px-2 rounded shadow-lg bg-white">
                        <button className="text-light text-white bg-red-500 px-2 py-1 rounded" onClick={handleLeaveParty}>leave party</button>
                        <button className="text-black" onClick={handleToggleLeavePartyPane}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
              <div className="flex flex-col gap-2 py-2">
                <div className="flex items-center h-12 bg-slate-700 rounded shadow-lg">
                  <p className="w-40 text-white text-lg px-2 truncate">{ usernameEdit ? usernameEdit : profile.display_name } (Me)</p>
                  { party?.leader === profile.id &&
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
                    { party?.leader === profile.id &&
                      <div className="p-2 cursor-pointer transform hover:scale-110" onClick={() => handleOpenPartyMemberEdit(member)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                        </svg>
                      </div>
                    }
                    { showPartyMemberEdit && selectedMember && selectedMember.id === member.id &&
                      <PartyMemberEditPane
                        handleClosePartyMemberEdit={handleClosePartyMemberEdit}
                        handleMakeSelectedMemberLeader={handleMakeSelectedMemberLeader}
                        handleKickUserFromParty={() => handleKickUserFromParty(member.id)}
                        member={selectedMember}
                      />
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
                { party && profile.id === party.leader ?
                  <>
                  <div className="flex items-center justify-between h-12 bg-white rounded shadow-lg cursor-pointer" onClick={handleShowCourseDropdown}>
                    <p className="text-black text-lg px-2 truncate">{ party.course ? party.course : <label className="text-neutral-500">select a course</label> }</p>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                  </div>
                  { party?.game_state === 'lobby' &&
                    <button className="flex items-center justify-center bg-orange-200 rounded h-12 shadow-lg" onClick={handleStartGame}>
                      <p className="text-black text-xl">Start</p>
                    </button>
                  }
                  </>
                  :
                  <div className="flex items-center justify-between h-12 bg-white rounded shadow-lg">
                    <p className="text-black text-lg px-2 truncate">{ party?.course ? party.course : <label className="text-neutral-500">waiting for leader...</label> }</p>
                  </div>
                }
                { party?.game_state === 'game' &&
                  <button className="flex items-center justify-center h-12 bg-orange-200 rounded shadow-lg" onClick={handleJoinGameClick}>
                    <p className="text-black text-lg px-2 truncate">Join game</p>
                  </button>
                }
                { party?.game_state === 'game' && profile.id === party.leader &&
                  <button className="flex items-center justify-center h-12 bg-red-400 rounded shadow-lg" onClick={handleEndGameClick}>
                    <p className="text-black text-lg px-2 truncate">End game</p>
                  </button>
                }
                { showCourseDropdown &&
                  <div className="absolute flex flex-col top-0 right-0 w-full rounded shadow-lg bg-white">
                    <button className="ml-auto p-2" onClick={handleShowCourseDropdown}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="flex flex-col gap-2 pb-2">
                      { courses.filter((course: string) => course !== party?.course).map((course: string, idx: number) => (
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
            <div className="flex items-center ml-auto gap-2">
              <button className="cursor-pointer" onClick={() => setShowPartyMessagesBox(!showPartyMessagesBox)}>
                { showPartyMessagesBox ?
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
                  </svg>
                :                
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97-1.94.284-3.916.455-5.922.505a.39.39 0 0 0-.266.112L8.78 21.53A.75.75 0 0 1 7.5 21v-3.955a48.842 48.842 0 0 1-2.652-.316c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
                  </svg>
                }
              </button>
              <div className="relative cursor-pointer" onClick={() => setShowNotifications(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                  <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z" clipRule="evenodd" />
                </svg>
                { invites.length > 0 &&
                  <div className="absolute flex justify-center items-center -top-2 -right-1 w-5 h-5 bg-red-500 text-white rounded-full">
                    <p className="text-xs font-semibold">{ invites.length > 9 ? '9+' : invites.length }</p>
                  </div>
                }
              </div>
              <div className="flex justify-center items-center w-12 h-12 bg-white rounded shadow-lg cursor-pointer hover:bg-neutral-100" onClick={handleToggleUserMenu}>
                <p className="text-black text-2xl font-extrabold">{ profile.display_name[0] }</p>
              </div>
            </div>
            { party && showPartyMessagesBox &&
              <>
                <PartyMessagesBox partyMessages={partyMessages} profile={profile} messagesBoxRef={messagesBoxRef} />
                <div className="flex gap-1 w-80">
                  <input value={message} className="w-full h-8 bg-white rounded shadow-lg outline-none px-1" placeholder="message..." onChange={(e) => handleMessageChange(e)} />
                  <button className="h-8 px-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow-lg" onClick={handleSendMessage}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </>
            }
            { showUserMenu &&
              <div className="absolute flex flex-col top-0 right-0 w-56 m-2 rounded shadow-lg bg-white">
                <div className="flex justify-between items-center p-2">
                  <p className="text-lg font-light text-black px-2">Profile</p>
                  <button onClick={handleToggleUserMenu}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-3 p-3 mt-auto">
                  <div className="flex items-center text-neutral-700 bg-neutral-100 px-2 py-1 rounded font-semibold truncate">
                    <input className="w-40 bg-neutral-100 outline-none" value={usernameEdit ? usernameEdit : profile.display_name} onChange={(e) => handleUsernameInputChange(e)} />
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
            { showNotifcations &&
              <div className="absolute flex flex-col top-0 right-0 w-56 max-h-96 m-2 rounded shadow-lg bg-white">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-light text-black p-2">Notifications</p>
                  <button className="text-black text-xl font-semibold p-2" onClick={() => setShowNotifications(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                { invites.length > 0 ?
                    <div className="flex flex-col h-full">
                      { invites.map((invite: Invite, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-2">
                            <p className="text-black font-light text-lg">{ invite.sender_display_name }</p>
                            <div className="flex gap-2 px-2">
                              <button className="text-green-600 hover:text-green-500" onClick={() => handleAcceptInvite(invite)}>
                                accept
                              </button>
                              <button className="text-red-600 hover:text-red-500" onClick={() => handleDeclineInvite(invite)}>
                                decline
                              </button>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  :
                    <div className="h-full">
                      <p className="grid place-items-center h-20 text-xl font-semibold text-neutral-500">No notifications</p>
                    </div>
                }
              </div>
            }
          </div>
        </div>
        <div className="flex justify-center items-center pb-28 mt-auto">
          <div className="flex p-10 rounded-full bg-green-500 w-56 h-48 shadow-xl">
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-100 shadow-inner shadow-gray-400"></div>
          </div>
        </div>
      </div>
    </>
  )
}
