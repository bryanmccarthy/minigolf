import { Link, Form } from "@remix-run/react";
import { SignIn } from "@clerk/remix";

export default function SignInPage() {
  return (
    <div className="flex flex-col bg-white h-[calc(100dvh)]">
      <div className="flex items-center">
        <Link to={"/"} className="flex items-center px-2 py-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          <p className="text-xl font-light">back</p>
        </Link>
      </div>
      <div className="flex flex-col bg-orange-300 mt-auto rounded-t-2xl">
        <Link to={"/signUp"} className="flex justify-center items-center py-4 bg-orange-300 rounded-t-2xl hover:py-6">
          <div className="w-8 h-1 bg-black rounded"></div>
        </Link>
        <div className="flex flex-col bg-slate-800 h-full mt-auto rounded-t-2xl">
          <div className="flex flex-col items-center">
            <Link to={"/signUp"} className="flex justify-center items-center py-4 w-full">
              <div className="w-8 h-1 bg-white rounded"></div>
            </Link>
            <div className="py-4 sm:py-8 md:py-12 lg:py-16">
              <SignIn />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
