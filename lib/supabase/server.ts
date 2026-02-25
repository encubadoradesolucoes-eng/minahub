import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DEV_MODE, mockUser } from "@/lib/dev-mode";

export async function createClient() {
  // MODO DESENVOLVIMENTO - Retornar cliente mock robusto
  if (DEV_MODE) {
    const createMockQuery = () => {
      const query: any = Promise.resolve({ data: [], error: null, count: 0 });

      const chain = () => {
        // Implementação recursiva de proxy/chaining para suportar qualquer método do Supabase
        const methods = [
          'select', 'from', 'schema', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
          'like', 'ilike', 'is', 'in', 'contains', 'containedBy', 'range',
          'textSearch', 'match', 'not', 'or', 'filter', 'order', 'limit',
          'range', 'single', 'maybeSingle', 'csv'
        ];

        methods.forEach(method => {
          query[method] = (...args: any[]) => {
            return query; // Retorna a própria promise/objeto para encadeamento
          };
        });

        return query;
      };

      return chain();
    };

    return {
      auth: {
        getUser: async () => ({ data: { user: mockUser } }),
        signOut: async () => { },
        signInWithPassword: async () => ({ data: { user: mockUser }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
      },
      schema: () => createMockQuery(),
      from: () => createMockQuery(),
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
