import { Link } from "@remix-run/react";
import { useState } from "react";
import { useOutletContext, useNavigate } from "@remix-run/react";
import type { OutletContext } from "../utils/types";

export default function Lobby() {
  const navigate = useNavigate();
  const { session, supabase } = useOutletContext<OutletContext>();
  const [courseSelected, setCourseSelected] = useState('Practice');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleToggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  }

  const handleShowCourseDropdown = () => {
    setShowCourseDropdown(!showCourseDropdown);
  }

  const handleCourseSelected = (course: string) => {
    setCourseSelected(course);
    setShowCourseDropdown(false);
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
          <div className="flex">
            <div className="flex flex-col gap-2 p-2">
              {/* TODO: move to settings popup/dropdown */}
              <div className="py-2">
                <Link to={"/"} className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                  <p className="text-xl font-light">home</p>
                </Link>
              </div>

              <div className="flex flex-col">
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-semibold text-black">Lobby (3/4)</p>
                  {/* TODO: add a condition to only render button if group is not full (4/4) or full group icon */}
                  <button onClick={() => {}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                      <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-2 py-2">
                  <div className="flex items-center h-12 bg-slate-700 rounded shadow-lg">
                    <p className="text-white text-lg px-2 truncate">Bryan (Me)</p>
                  </div>
                  <div className="flex items-center h-12 bg-white rounded shadow-lg">
                    <p className="text-black text-lg px-2 truncate">Player 2</p>
                  </div>
                  <div className="flex items-center h-12 bg-white rounded shadow-lg">
                    <p className="text-black text-lg px-2 truncate">Player 3</p>
                  </div>
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
                      <button className="text-black text-xl font-semibold ml-auto p-2" onClick={handleShowCourseDropdown}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="flex flex-col gap-2 pb-2">
                        <button className="text-black text-lg text-start px-4 truncate hover:bg-gray-200 rounded-full mx-1" onClick={() => handleCourseSelected('Practice')}>Practice</button>
                        <button className="text-black text-lg text-start px-4 truncate hover:bg-gray-200 rounded-full mx-1" onClick={() => handleCourseSelected('Lazy Links')}>Lazy Links</button>
                        <button className="text-black text-lg text-start px-4 truncate hover:bg-gray-200 rounded-full mx-1" onClick={() => handleCourseSelected('Fairways')}>Fairways</button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
            <div className="relative flex flex-col gap-2 p-2 ml-auto">
              { session && session.user.email &&
                <div className="flex justify-center items-center w-12 h-12 bg-white rounded shadow-lg cursor-pointer hover:bg-neutral-100" onClick={handleToggleUserMenu}>
                  <p className="text-black text-2xl font-extrabold">{ session.user.email[0] }</p>
                </div>
              }
              { showUserMenu &&
                <div className="absolute flex flex-col top-0 right-0 w-56 h-40 m-2 rounded shadow-lg bg-white">
                  <button className="text-black text-xl font-semibold ml-auto p-2" onClick={handleToggleUserMenu}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex flex-col gap-3 p-2 mt-auto">
                    <p className="text-neutral-700 font-semibold truncate">username</p>
                    <p className="text-neutral-700 font-semibold truncate">{ session && session.user.email ? session.user.email : '' }</p>
                    <button className="text-red-500 text-start hover:text-red-600" onClick={handleSignOut}>Sign Out</button>
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