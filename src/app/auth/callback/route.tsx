import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
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
            redirect(redirect_url);
        }
    }

    redirect("/");
};

export { GET };
