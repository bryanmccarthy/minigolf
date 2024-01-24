import { Form, Link } from "@remix-run/react";
import { useState } from "react";
import { useOutletContext } from "@remix-run/react";
import type { OutletContext } from "../utils/types";

// TODO: maybe use action to sign in for use of redirect?

export default function SignInPage() {
  const { supabase } = useOutletContext<OutletContext>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      // TODO: handle error
      console.log("error: ", error);
    }
    else {
      if (data.user) {
        // TODO: redirect to lobby
        console.log("data: ", data);
      }
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signIn(email, password);
  }

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
              <Form method="post" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6 py-12">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-64 h-12 px-4 bg-white rounded shadow-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-64 h-12 px-4 bg-white rounded shadow-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="submit" className="w-64 h-12 bg-slate-400 rounded shadow-lg">Sign In</button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
