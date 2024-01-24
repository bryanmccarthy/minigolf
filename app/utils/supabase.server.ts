import { createServerClient } from "@supabase/auth-helpers-remix";

export const createSupabaseServerClient = ({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) =>
  createServerClient(
    process.env.PUBLIC_SUPABASE_URL as string,
    process.env.PUBLIC_SUPABASE_ANON_KEY as string,
    { request, response }
  );
