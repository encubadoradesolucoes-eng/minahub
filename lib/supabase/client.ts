import { createBrowserClient } from "@supabase/ssr";
import { DEV_MODE, mockUser } from "@/lib/dev-mode";

export function createClient() {
  if (DEV_MODE) {
    const createMockQuery = () => {
      const query: any = Promise.resolve({ data: [], error: null, count: 0 });
      
      const methods = [
        'select', 'from', 'schema', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 
        'like', 'ilike', 'is', 'in', 'contains', 'containedBy', 'range', 
        'textSearch', 'match', 'not', 'or', 'filter', 'order', 'limit', 
        'range', 'single', 'maybeSingle', 'csv'
      ];
      
      methods.forEach(method => {
        query[method] = (...args: any[]) => {
          return query;
        };
      });
      
      return query;
    };

    return {
      auth: {
        getUser: async () => ({ data: { user: mockUser }, error: null }),
        signInWithPassword: async ({ email, password }: any) => {
          if (email === mockUser.email || email === 'dev@minehub.com') {
            return { data: { user: mockUser }, error: null };
          }
          return { data: { user: null }, error: { message: "Credenciais inválidas em modo DEV" } };
        },
        signUp: async ({ email, password }: any) => ({ data: { user: mockUser }, error: null }),
        signOut: async () => {},
        onAuthStateChange: (callback: any) => {
          return { data: { subscription: { unsubscribe: () => {} } } };
        }
      },
      schema: () => createMockQuery(),
      from: () => createMockQuery(),
    } as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
