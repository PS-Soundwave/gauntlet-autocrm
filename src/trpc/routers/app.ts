import { TRPCError } from "@trpc/server";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { z } from "zod";
import { Ticket } from "@/api/types";
import { db } from "@/db";
import { authedProcedure, router } from "@/trpc";

const authAgent = async (userId: string) => {
    const user = await db
        .selectFrom("users")
        .where("id", "=", userId)
        .selectAll()
        .executeTakeFirst();

    if (user?.role !== "agent") {
        throw new TRPCError({
            code: "FORBIDDEN"
        });
    }
};

export const appRouter = router({
    readTicket: authedProcedure
        .input(z.string())
        .query<Ticket>(async ({ ctx, input }) => {
            await authAgent(ctx.user.id);

            const ticket = await db
                .selectFrom("tickets")
                .innerJoin("users", "users.id", "tickets.author")
                .where("tickets.id", "=", input)
                .select((dbi) => [
                    "tickets.status",
                    "tickets.priority",
                    "tickets.serial",
                    "tickets.author as authorId",
                    "users.name as author",
                    jsonArrayFrom(
                        dbi
                            .selectFrom("ticket_messages")
                            .innerJoin(
                                "users",
                                "users.id",
                                "ticket_messages.author"
                            )
                            .select([
                                "ticket_messages.author as authorId",
                                "users.name as author",
                                "content"
                            ])
                            .whereRef(
                                "ticket_messages.ticket",
                                "=",
                                "tickets.id"
                            )
                            .orderBy("ticket_messages.serial", "asc")
                    ).as("messages")
                ])
                .executeTakeFirstOrThrow(
                    () => new TRPCError({ code: "NOT_FOUND" })
                );

            return ticket;
        })
});

export type AppRouter = typeof appRouter;
