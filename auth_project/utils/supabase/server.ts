import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// What does the `cookies` object do?
// The cookies object lets the Supabase client know how to access the cookies, so it can read and write the user session data. To make @supabase/ssr framework-agnostic, the cookies methods aren't hard-coded. These utility functions adapt @supabase/ssr's cookie handling for Next.js.

// The set and remove methods for the server client need error handlers, because Next.js throws an error if cookies are set from Server Components. You can safely ignore this error because you'll set up middleware in the next step to write refreshed cookies to storage.

// The cookie is named sb-<project_ref>-auth-token by default.

// Do I need to create a new client for every route?
// Yes! Creating a Supabase client is lightweight.

// On the server, it basically configures a fetch call. You need to reconfigure the fetch call anew for every request to your server, because you need the cookies from the request.
// On the client, createBrowserClient already uses a singleton pattern, so you only ever create one instance, no matter how many times you call your createClient function.
