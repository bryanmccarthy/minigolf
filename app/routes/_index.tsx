import type { MetaFunction } from "@remix-run/node";
import { Link, useOutletContext } from "@remix-run/react";
import type { OutletContext } from "../utils/types";

export const meta: MetaFunction = () => {
  return [
    { title: "minigolf" },
    { name: "description", content: "Welcome to Minigolf!" },
  ];
};

export default function Index() {
  const { session, supabase } = useOutletContext<OutletContext>();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    // TODO: handle error
    console.log("error: ", error);
  }

  return (
    <div className="flex flex-col bg-gradient-to-b from-blue-300 to-blue-200 h-[calc(100dvh)]">
      <p className="text-center py-6 text-5xl font-light text-black drop-shadow">minigolf</p>
      <div className="flex flex-col justify-center items-center pt-4">
        <div className="w-40 h-40 p-8 m-1 bg-green-500 rounded shadow-xl">
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-100 shadow-inner shadow-gray-400"></div>
        </div>
        <div className="w-32 h-32 p-8 m-1 bg-green-500 rounded ml-20 shadow-lg">
        </div>
        <div className="w-20 h-20 p-8 m-1 bg-green-500 rounded mr-8 shadow-md">
        </div>
      </div>
      <div className="flex justify-center items-center pt-16">
        { session && session.user ?
          <div className="flex flex-col gap-4 justify-center items-center">
            <Link to={"/lobby"} className="flex justify-center items-center bg-slate-700 mx-4 w-56 h-10 text-white rounded-md shadow">Lobby</Link>
            <button className="flex justify-center items-center bg-slate-700 mx-4 w-56 h-10 text-white rounded-md shadow" onClick={handleSignOut}>Sign Out</button>
          </div>
        :
          <Link to={"/signIn"} className="flex justify-center items-center bg-slate-700 mx-4 w-56 h-10 text-white rounded-md shadow">Sign In/up</Link>
        }
      </div>
    </div>
  );
}
