import { router, authedProcedure, procedure } from "@/trpc";
import { z } from "zod";

export const appRouter = router({
    hello: procedure.input(z.string()).query(({ input }) => {
        return `Hello ${input}!`;
    }),
    authedHello: authedProcedure.query(({ ctx }) => {
        return `Hello user ${ctx.user.id}!`;
    })
});

export type AppRouter = typeof appRouter;
