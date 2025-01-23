import { TRPCError } from "@trpc/server";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { uuidv7 } from "uuidv7";
import { z } from "zod";
import {
    AgentTicket,
    AgentTicketMetadata,
    CustomerTicket,
    CustomerTicketMetadata,
    Skill,
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
                .returning(["id"])
                .executeTakeFirstOrThrow(
                    () => new TRPCError({ code: "NOT_FOUND" })
                );
        }),
    createSkill: adminProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ input }) => {
            await db
                .insertInto("skills")
                .values({ name: input.name })
                .returning("id")
                .onConflict((oc) => oc.doNothing())
                .executeTakeFirstOrThrow(
                    () => new TRPCError({ code: "CONFLICT" })
                );
        }),
    readAgents: adminProcedure.query(async () => {
        const agents = await db
            .selectFrom("users")
            .where("role", "in", ["agent", "admin"])
            .select((dbi) => [
                "id",
                "name",
                "role",
                jsonArrayFrom(
                    dbi
                        .selectFrom("agent_skills")
                        .innerJoin("skills", "skills.id", "agent_skills.skill")
                        .select(["skills.id", "skills.name"])
                        .whereRef("agent_skills.agent", "=", "users.id")
                        .orderBy("skills.name")
                ).as("skills")
            ])
            .orderBy("name")
            .execute();

        return agents;
    }),
    addAgentSkill: adminProcedure
        .input(z.object({ userId: z.string(), skillId: z.string() }))
        .mutation(async ({ input }) => {
            await db
                .insertInto("agent_skills")
                .values({
                    agent: input.userId,
                    skill: input.skillId
                })
                .onConflict((oc) => oc.doNothing())
                .execute();
        }),
    removeAgentSkill: adminProcedure
        .input(z.object({ userId: z.string(), skillId: z.string() }))
        .mutation(async ({ input }) => {
            await db
                .deleteFrom("agent_skills")
                .where("agent", "=", input.userId)
                .where("skill", "=", input.skillId)
                .execute();
        }),
    deleteSkill: adminProcedure
        .input(z.string())
        .mutation(async ({ input }) => {
            await db
                .deleteFrom("skills")
                .where("id", "=", input)
                .returning(["id"])
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
    readAllSkills: agentProcedure.query<Skill[]>(async () => {
        const skills = await db
            .selectFrom("skills")
            .select(["id", "name"])
            .orderBy("name", "asc")
            .execute();

        return skills;
    }),
    readFocusTickets: agentProcedure.query<AgentTicketMetadata[]>(
        async ({ ctx }) => {
            // Get tickets that have skills and where all skills are in the agent's skills
            const tickets = await db
                .selectFrom("tickets")
                // Only include tickets that have skills
                .leftJoin("ticket_skills", "ticket_skills.ticket", "tickets.id")
                .innerJoin("users", "users.id", "tickets.author")
                .groupBy([
                    "tickets.id",
                    "tickets.status",
                    "tickets.priority",
                    "tickets.serial",
                    "tickets.author",
                    "tickets.title",
                    "users.name"
                ])
                .having(db.fn.count("ticket_skills.skill"), "=", (dbi) =>
                    dbi
                        .selectFrom("ticket_skills as ts")
                        .whereRef("ts.ticket", "=", "tickets.id")
                        .where("ts.skill", "in", (dbii) =>
                            dbii
                                .selectFrom("agent_skills")
                                .where("agent_skills.agent", "=", ctx.user.id)
                                .select("agent_skills.skill")
                        )
                        .select(dbi.fn.countAll().as("c"))
                )
                .select([
                    "tickets.id as ticketId",
                    "tickets.status",
                    "tickets.priority",
                    "tickets.serial",
                    "tickets.author as authorId",
                    "tickets.title",
                    "users.name as author"
                ])
                .execute();

            return tickets;
        }
    ),
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
                    ).as("messages"),
                    jsonArrayFrom(
                        dbi
                            .selectFrom("ticket_skills")
                            .innerJoin(
                                "skills",
                                "skills.id",
                                "ticket_skills.skill"
                            )
                            .select(["skills.id", "skills.name"])
                            .whereRef("ticket_skills.ticket", "=", "tickets.id")
                            .orderBy("skills.name")
                    ).as("skills")
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
                priority: ticketPrioritySchema,
                skills: z.array(z.string())
            })
        )
        .mutation(async ({ input }) => {
            await db.transaction().execute(async (tx) => {
                // Update ticket status and priority
                await tx
                    .updateTable("tickets")
                    .set({
                        status: input.status,
                        priority: input.priority
                    })
                    .where("id", "=", input.ticketId)
                    .returning(["id"])
                    .executeTakeFirstOrThrow(
                        () => new TRPCError({ code: "NOT_FOUND" })
                    );

                // Delete existing skills
                await tx
                    .deleteFrom("ticket_skills")
                    .where("ticket", "=", input.ticketId)
                    .execute();

                // Insert new skills
                if (input.skills.length > 0) {
                    await tx
                        .insertInto("ticket_skills")
                        .values(
                            input.skills.map((skillId) => ({
                                ticket: input.ticketId,
                                skill: skillId
                            }))
                        )
                        .execute();
                }
            });
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
                .execute();
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
                    .execute();
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
                    .execute();
            });
        })
});

export const appRouter = router({
    admin: adminRouter,
    agent: agentRouter,
    customer: customerRouter
});

export type AppRouter = typeof appRouter;
