import { Link } from "@remix-run/react";
import { useState } from "react";
import { useOutletContext, useNavigate } from "@remix-run/react";
import type { OutletContext } from "../utils/types";



export default function Lobby() {
  const navigate = useNavigate();
  const { session, supabase } = useOutletContext<OutletContext>();
  const [courseSelected, setCourseSelected] = useState('practice');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleToggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
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
                  {/* TODO: add a condition to only render button if group is not full (4/4) */}
                  <button onClick={() => {}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                      <path d="M5.25 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM2.25 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM18.75 7.5a.75.75 0 0 0-1.5 0v2.25H15a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H21a.75.75 0 0 0 0-1.5h-2.25V7.5Z" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-2 py-2">
                  <div className="flex items-center w-32 sm:w-40 h-12 bg-slate-700 rounded shadow-lg">
                    <p className="text-white text-lg px-2 truncate">Bryan (Me)</p>
                  </div>
                  <div className="flex items-center w-32 sm:w-40 h-12 bg-white rounded shadow-lg">
                    <p className="text-black text-lg px-2 truncate">Player 2</p>
                  </div>
                  <div className="flex items-center w-32 sm:w-40 h-12 bg-white rounded shadow-lg">
                    <p className="text-black text-lg px-2 truncate">Player 3</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col pt-2">
                <p className="text-2xl font-semibold text-black">
                  Course
                </p>
                <form className="flex flex-col gap-2 py-2">
                <select className="w-32 sm:w-40 h-12 bg-white rounded shadow-lg">
                  <option>practice</option>
                  <option>Course 1</option>
                  <option>Course 2</option>
                  <option>Course 3</option>
                </select>
                <Link to={`/${courseSelected}`}>Play</Link>
                </form>
              </div>
            </div>
            <div className="flex flex-col gap-2 p-2 ml-auto">
              { session && session.user.email ?
                <div className="flex justify-center items-center w-12 h-12 bg-white rounded shadow-lg cursor-pointer hover:bg-neutral-100" onClick={handleToggleUserMenu}>
                  <p className="text-black text-2xl font-extrabold">{ session.user.email[0] }</p>
                </div>
              :
                // TODO: add account icon and log in link
                <></>
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
              {/* <div className="flex justify-center items-center w-12 h-12 bg-white rounded shadow-lg cursor-pointer hover:bg-neutral-100" onClick={handleSignOut}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
                </svg>
              </div> */}
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