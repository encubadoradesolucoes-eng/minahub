import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEV_MODE } from "@/lib/dev-mode";

export async function updateSession(request: NextRequest) {
    // MODO DESENVOLVIMENTO - Pular verificação de sessão
    if (DEV_MODE) {
        return NextResponse.next({
            request: { headers: request.headers },
        });
    }

    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: any[]) {
                    cookiesToSet.forEach(({ name, value, options }: any) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    await supabase.auth.getUser();

    return response;
}
