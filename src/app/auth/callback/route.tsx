import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { db } from "@/db";
import { createClient } from "@/supabase/server";

const GET = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const redirect_url = searchParams.get("redirect") ?? "/";

    if (token_hash && (type === "magiclink" || type === "signup")) {
        const supabase = await createClient();

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash
        });

        if (!error) {
            if (type === "signup") {
                const {
                    data: { user }
                } = await supabase.auth.getUser();

                if (user) {
                    // Add the new user to our database
                    await db
                        .insertInto("users")
                        .values({
                            id: user.id,
                            name: user.email?.split("@")[0] ?? "Unknown User",
                            role: "customer" // Default role for new signups
                        })
                        .onConflict((oc) => oc.column("id").doNothing())
                        .execute();
                }
            }

            redirect(redirect_url);
        }
    }

    redirect("/");
};

export { GET };
