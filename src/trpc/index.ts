import { User } from "@supabase/supabase-js";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { createClient } from "@/supabase/server";

export type Context = {
    user: User | null;
};

export const createContext = async () => {
    const supabase = await createClient();
    const {
        data: { user }
    } = await supabase.auth.getUser();

    return { user };
};

export const t = initTRPC.context<typeof createContext>().create({
    transformer: superjson
});

export const router = t.router;

export const procedure = t.procedure;

export const authedProcedure = t.procedure.use(({ ctx, next }) => {
    if (ctx.user === null) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({ ctx: { user: ctx.user } });
});
