import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "minigolf" },
    { name: "description", content: "Welcome to Minigolf!" },
  ];
};

export default function Index() {
  return (
    <div className="flex flex-col bg-gradient-to-b from-blue-200 to-blue-100 h-[calc(100dvh)]">
      <p className="text-center py-8 text-4xl text-green-500 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">minigolf</p>
      <div className="flex flex-col justify-center items-center pt-4">
        <div className="w-40 h-40 p-8 m-1 bg-green-500 rounded shadow-xl">
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-100 shadow-inner"></div>
        </div>
        <div className="w-32 h-32 p-8 m-1 bg-green-500 rounded ml-20 shadow-lg">
        </div>
        <div className="w-20 h-20 p-8 m-1 bg-green-500 rounded mr-8 shadow-md">
        </div>
      </div>
      <div className="flex justify-center items-center pt-16">
        <button className="bg-blue-400 mx-4 w-28 h-10 text-white rounded shadow-sm">Sign Up</button>
        <button className="bg-orange-400 mx-8 w-28 h-10 text-white rounded shadow-sm">Guest</button>
      </div>
    </div>
  );
}
