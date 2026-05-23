import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false, // سرور نیاز به session ندارد
      },
    }
  );

  return supabase;
}