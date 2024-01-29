import { useState } from "react";
import { Link, useOutletContext, useNavigate, json, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { createSupabaseServerClient } from "../utils/supabase.server";
import type { OutletContext } from "../utils/types";

const courses = [
  "Practice",
  "Lazy Links",
  "Fairways"
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createSupabaseServerClient({ request, response });

  const { data } = await supabase.from("parties").select();

  return json({ data });
}

export default function Lobby() {
  const navigate = useNavigate();
  const { data } = useLoaderData<{ data: any }>();
  const { session, supabase } = useOutletContext<OutletContext>();
  const [username, setUsername] = useState(session.user.user_metadata.username);
  const [courseSelected, setCourseSelected] = useState('Practice');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInvitePane, setShowInvitePane] = useState(false);
  const [showUsernameSave, setShowUsernameSave] = useState(false);

  const handleToggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  }

  const handleToggleInvitePane = () => {
    setShowInvitePane(!showInvitePane);
  }

  const handleShowCourseDropdown = () => {
    setShowCourseDropdown(!showCourseDropdown);
  }

  const handleCourseSelected = (course: string) => {
    setCourseSelected(course);
    setShowCourseDropdown(false);
  }

  const handleUsernameInputChange = (e: any) => {
    setUsername(e.target.value);
    setShowUsernameSave(true);
  }

  const handleUsernameSave = async () => {
    // TODO: update username in supabase
    setShowUsernameSave(false);
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.log("error: ", error); // TODO: handle error
    } else {
      navigate("/");
    }
  }

  return (
    <>
      <div className="flex flex-col bg-gradient-to-b from-blue-300 to-blue-200 h-[calc(100dvh)]">
        <div className="relative flex">
          {/* Invite Pane */}
          { showInvitePane &&
            <div className="absolute flex flex-col items-center w-44 h-32 top-2 left-48 rounded shadow-lg bg-white">
              <button className="ml-auto p-2" onClick={handleToggleInvitePane}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
              <input placeholder="username" className="w-10/12 h-8 px-2 my-1 border-2 border-black rounded text-lg text-black outline-none" />
              <button className="w-10/12 h-8 my-1 bg-black text-lg text-white rounded">Invite</button>
            </div>
          }
          <div className="relative flex flex-col gap-2 p-2 w-48">
            <div className="flex flex-col">
              <div className="flex items-end gap-3">
                <p className="text-2xl font-semibold text-black">Lobby (3/4)</p>
                {/* TODO: add a condition to only render button if group is not full (4/4) or full group icon */}
                <button onClick={handleToggleInvitePane}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                    <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-col gap-2 py-2">
                <div className="flex items-center h-12 bg-slate-700 rounded shadow-lg">
                  <p className="text-white text-lg px-2 truncate">{ session && session.user ? username : "Guest" } (Me)</p>
                </div>
                {/* TODO: Get party members */}
                { data.map((party: any, idx: number) => (
                    <div key={idx} className="flex items-center h-12 bg-white rounded shadow-lg">
                      <p className="text-black text-lg px-2 truncate">{ party.leader }</p>
                    </div>
                  ))
                }
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
                <Link to={`/${courseSelected}`} className="flex items-center justify-center bg-orange-300 rounded h-12 shadow-lg">
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
            { session &&
              <div className="flex justify-center items-center w-12 h-12 bg-white rounded shadow-lg cursor-pointer hover:bg-neutral-100" onClick={handleToggleUserMenu}>
                <p className="text-black text-2xl font-extrabold">{ session.user.user_metadata.username[0] }</p>
              </div>
            }
            { showUserMenu &&
              <div className="absolute flex flex-col top-0 right-0 w-56 m-2 rounded shadow-lg bg-white">
                <button className="text-black text-xl font-semibold ml-auto p-2" onClick={handleToggleUserMenu}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex flex-col gap-3 p-3 mt-auto">
                  <div className="flex items-center text-neutral-700 bg-neutral-100 px-2 py-1 rounded font-semibold truncate">
                    <input className="w-40 bg-neutral-100 outline-none" value={username} onChange={(e) => handleUsernameInputChange(e)} />
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