import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import stylesheet from "./tailwind.css";
import { createSupabaseServerClient } from "./utils/supabase.server";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import { useState, useEffect } from "react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL as string,
    PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY as string,
  };

  const response = new Response();

  const supabase = createSupabaseServerClient({ request, response });

  const { data: { session } } = await supabase.auth.getSession();

  return json({ env, session }, { headers: response.headers });
}

function App() {
  const { env, session } = useLoaderData<{ env: any, session: any }>();
  const { revalidate } = useRevalidator();

  const [supabase] = useState(() =>
    createBrowserClient(env.PUBLIC_SUPABASE_URL, env.PUBLIC_SUPABASE_ANON_KEY)
  );

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token !== serverAccessToken) {
        revalidate();
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, serverAccessToken, revalidate]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet context={{ supabase, session }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default App;
