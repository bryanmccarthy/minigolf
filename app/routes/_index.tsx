import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunction, redirect } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "minigolf" },
    { name: "description", content: "Welcome to Minigolf!" },
  ];
};

export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args);
  if (userId) {
    return redirect("/lobby");
  }
  
  return {};
}

export default function Index() {
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
        <Link to={"/signIn"} className="flex justify-center items-center bg-slate-700 mx-4 w-28 h-10 text-white rounded-md shadow">Sign In</Link>
        <button className="bg-orange-500 mx-8 w-28 h-10 text-white rounded-md shadow">Guest</button>
      </div>
    </div>
  );
}
