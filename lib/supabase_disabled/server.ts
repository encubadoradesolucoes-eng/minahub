import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DEV_MODE, mockUser } from "@/lib/dev-mode";

export async function createClient() {
  // MODO DESENVOLVIMENTO - Retornar cliente mock
  if (DEV_MODE) {
    return {
      auth: {
        getUser: async () => ({ data: { user: mockUser } }),
        signOut: async () => {},
        signInWithPassword: async () => ({ data: { user: mockUser }, error: null })
      }
    } as any;
  }

  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component; ignore
          }
        },
      },
    }
  );
}
