import { TRPCError } from "@trpc/server";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { uuidv7 } from "uuidv7";
import { z } from "zod";
import {
    AgentTicket,
    AgentTicketMetadata,
    CustomerTicket,
    CustomerTicketMetadata,
    ticketPrioritySchema,
    ticketStatusSchema,
    User,
    userRoleSchema
} from "@/api/types";
import { db } from "@/db";
import { authedProcedure, router } from "@/trpc";

const adminProcedure = authedProcedure.use(async ({ ctx, next }) => {
    const user = await db
        .selectFrom("users")
        .where("id", "=", ctx.user.id)
        .selectAll()
        .executeTakeFirstOrThrow(() => new TRPCError({ code: "UNAUTHORIZED" }));

    if (user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
    }

    return next({ ctx });
});

const adminRouter = router({
    readAllUsers: adminProcedure.query<User[]>(async () => {
        const users = await db
            .selectFrom("users")
            .select(["id", "name", "role"])
            .execute();

        return users;
    }),
    updateUserRole: adminProcedure
        .input(z.object({ id: z.string(), role: userRoleSchema }))
        .mutation(async ({ input }) => {
            await db
                .updateTable("users")
                .set({ role: input.role })
                .where("id", "=", input.id)
                .executeTakeFirstOrThrow(
                    () => new TRPCError({ code: "NOT_FOUND" })
                );
        })
});

const agentProcedure = authedProcedure.use(async ({ ctx, next }) => {
    const user = await db
        .selectFrom("users")
        .where("id", "=", ctx.user.id)
        .selectAll()
        .executeTakeFirstOrThrow(() => new TRPCError({ code: "UNAUTHORIZED" }));

    if (user?.role !== "agent" && user?.role !== "admin") {
        throw new TRPCError({
            code: "FORBIDDEN"
        });
    }

    return next({ ctx });
});

const agentRouter = router({
    readAllTickets: agentProcedure.query<AgentTicketMetadata[]>(async () => {
        const tickets = await db
            .selectFrom("tickets")
            .innerJoin("users", "users.id", "tickets.author")
            .select([
                "tickets.id as ticketId",
                "tickets.status",
                "tickets.priority",
                "tickets.serial",
                "tickets.author as authorId",
                "tickets.title",
                "users.name as author"
            ])
            .orderBy("tickets.serial", "asc")
            .execute();

        return tickets;
    }),
    readTicket: agentProcedure
        .input(z.string())
        .query<AgentTicket>(async ({ input }) => {
            const ticket = await db
                .selectFrom("tickets")
                .innerJoin("users", "users.id", "tickets.author")
                .where("tickets.id", "=", input)
                .select((dbi) => [
                    "tickets.status",
                    "tickets.priority",
                    "tickets.serial",
                    "tickets.author as authorId",
                    "tickets.title",
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
        }),
    updateTicket: agentProcedure
        .input(
            z.object({
                ticketId: z.string(),
                status: ticketStatusSchema,
                priority: ticketPrioritySchema
            })
        )
        .mutation(async ({ input }) => {
            await db
                .updateTable("tickets")
                .set({
                    status: input.status,
                    priority: input.priority
                })
                .where("id", "=", input.ticketId)
                .executeTakeFirstOrThrow(
                    () => new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
                );
        }),
    createTicketMessage: agentProcedure
        .input(
            z.object({
                ticketId: z.string(),
                content: z.string()
            })
        )
        .mutation(async ({ ctx, input }) => {
            await db
                .insertInto("ticket_messages")
                .values({
                    ticket: input.ticketId,
                    serial: uuidv7(),
                    type: "public",
                    author: ctx.user.id,
                    content: input.content
                })
                .executeTakeFirstOrThrow(
                    () => new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
                );
        })
});

const customerRouter = router({
    createTicket: authedProcedure
        .input(
            z.object({
                title: z.string(),
                content: z.string()
            })
        )
        .mutation(async ({ ctx, input }) => {
            await db.transaction().execute(async (tx) => {
                const ticket = await tx
                    .insertInto("tickets")
                    .values({
                        author: ctx.user.id,
                        title: input.title,
                        status: "open",
                        priority: null
                    })
                    .returning("id")
                    .executeTakeFirstOrThrow(
                        () => new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
                    );

                await tx
                    .insertInto("ticket_messages")
                    .values({
                        ticket: ticket.id,
                        serial: uuidv7(),
                        type: "public",
                        author: ctx.user.id,
                        content: input.content
                    })
                    .executeTakeFirstOrThrow(
                        () => new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
                    );
            });
        }),
    readAllTickets: authedProcedure.query<CustomerTicketMetadata[]>(
        async ({ ctx }) => {
            const tickets = await db
                .selectFrom("tickets")
                .innerJoin("users", "users.id", "tickets.author")
                .select([
                    "tickets.id as ticketId",
                    "tickets.status",
                    "tickets.author as authorId",
                    "tickets.title",
                    "users.name as author"
                ])
                .where("tickets.author", "=", ctx.user.id)
                .orderBy("tickets.serial", "asc")
                .execute();

            return tickets;
        }
    ),
    readTicket: authedProcedure
        .input(z.string())
        .query<CustomerTicket>(async ({ ctx, input }) => {
            const ticket = await db
                .selectFrom("tickets")
                .innerJoin("users", "users.id", "tickets.author")
                .where("tickets.id", "=", input)
                .where("tickets.author", "=", ctx.user.id)
                .select((dbi) => [
                    "tickets.status",
                    "tickets.title",
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
                            .where("ticket_messages.type", "=", "public")
                            .orderBy("ticket_messages.serial", "asc")
                    ).as("messages")
                ])
                .executeTakeFirstOrThrow(
                    () => new TRPCError({ code: "NOT_FOUND" })
                );

            return ticket;
        }),
    createTicketMessage: authedProcedure
        .input(
            z.object({
                ticketId: z.string(),
                content: z.string()
            })
        )
        .mutation(async ({ ctx, input }) => {
            await db.transaction().execute(async (tx) => {
                await tx
                    .selectFrom("tickets")
                    .where("id", "=", input.ticketId)
                    .where("author", "=", ctx.user.id)
                    .select([])
                    .executeTakeFirstOrThrow(
                        () => new TRPCError({ code: "NOT_FOUND" })
                    );

                await tx
                    .insertInto("ticket_messages")
                    .values({
                        ticket: input.ticketId,
                        serial: uuidv7(),
                        type: "public",
                        author: ctx.user.id,
                        content: input.content
                    })
                    .executeTakeFirstOrThrow(
                        () => new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
                    );
            });
        })
});

export const appRouter = router({
    admin: adminRouter,
    agent: agentRouter,
    customer: customerRouter
});

export type AppRouter = typeof appRouter;
