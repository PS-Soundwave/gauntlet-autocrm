import { z } from "zod";
import { authedProcedure, procedure, router } from "@/trpc";

export const appRouter = router({
    hello: procedure.input(z.string()).query(({ input }) => {
        return `Hello ${input}!`;
    }),
    authedHello: authedProcedure.query(({ ctx }) => {
        return `Hello user ${ctx.user.id}!`;
    })
});

export type AppRouter = typeof appRouter;
