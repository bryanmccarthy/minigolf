import { Link, Form } from "@remix-run/react";

export default function SignIn() {
  return (
    <div className="flex flex-col bg-gradient-to-b from-blue-300 to-blue-200 h-[calc(100dvh)]">
      <div className="flex items-center h-[calc(15dvh)]">
        <Link to={"/"} className="flex items-center px-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <p className="text-xl font-light">back</p>
        </Link>
      </div>
      <div className="flex flex-col bg-slate-800 h-[calc(85dvh)] mt-auto rounded-t-2xl">
        <div className="flex flex-col items-center">
          <div className="flex justify-center items-center py-4">
            <div className="w-8 h-1 bg-white rounded"></div>
          </div>
          <div className="flex flex-col w-full max-w-96">
          <div className="flex py-8 px-8">
            <p className="w-28 text-2xl font-semibold text-white">Welcome back</p>
          </div>
          <Form action="" method="post" className="flex flex-col gap-6 px-8 py-4">
            <input 
              name="email" 
              type="email" 
              placeholder="Email" 
              className="bg-transparent rounded-none border-b-2 border-gray-400 text-xl outline-none text-white" 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              className="bg-transparent rounded-none border-b-2 border-gray-400 text-xl outline-none text-white" 
            />
            <button className="bg-orange-500 text-xl text-white font-semibold my-6 py-2 rounded-full shadow">Sign in</button>
          </Form>
          </div>
        </div>
        <Link to={"/signUp"} className="h-32 mt-auto rounded-t-2xl bg-white hover:h-36">
          <div className="flex flex-col justify-center items-center py-4">
            <div className="w-8 h-1 bg-black rounded"></div>
            <p className="font-semibold py-1">Sign up</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
