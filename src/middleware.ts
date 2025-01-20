import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const updateSession = async (request: NextRequest) => {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                }
            }
        }
    );

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        // User not authed, protect the route if needed:
        // return NextResponse.redirect(url)
    }

    return supabaseResponse;
};

export const middleware = async (request: NextRequest) => {
    return await updateSession(request);
};

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
    ]
};
