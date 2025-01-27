import { TRPCError } from "@trpc/server";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
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
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await db
                .deleteFrom("skills")
                .where("id", "=", input.id)
                .returning(["id"])
                .executeTakeFirstOrThrow(
                    () => new TRPCError({ code: "NOT_FOUND" })
                );
        }),
    getQueues: adminProcedure.query(async () => {
        const queues = await db
            .selectFrom("queues")
            .leftJoin("queue_agents", "queue_agents.queue", "queues.id")
            .select((eb) => [
                "queues.id",
                "queues.name",
                eb.fn.count("queue_agents.agent").as("agentCount")
            ])
            .groupBy(["queues.id", "queues.name"])
            .execute();

        return queues;
    }),
    createQueue: adminProcedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ input }) => {
            const queue = await db
                .insertInto("queues")
                .values({
                    id: uuidv7(),
                    name: input.name,
                    createdAt: new Date()
                })
                .returning(["id", "name"])
                .executeTakeFirstOrThrow(
                    () => new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
                );

            return queue;
        }),
    readQueueAgents: adminProcedure
        .input(z.object({ queueId: z.string() }))
        .query(async ({ input }) => {
            const agents = await db
                .selectFrom("queue_agents")
                .where("queue", "=", input.queueId)
                .select(["agent as agentId", "created_at as createdAt"])
                .execute();

            return agents;
        }),
    assignAgentToQueue: adminProcedure
        .input(z.object({ queueId: z.string(), agentId: z.string() }))
        .mutation(async ({ input }) => {
            await db
                .insertInto("queue_agents")
                .values({
                    queue: input.queueId,
                    agent: input.agentId,
                    created_at: new Date()
                })
                .onConflict((oc) => oc.doNothing())
                .execute();
        }),
    removeAgentFromQueue: adminProcedure
        .input(z.object({ queueId: z.string(), agentId: z.string() }))
        .mutation(async ({ input }) => {
            await db
                .deleteFrom("queue_agents")
                .where("queue", "=", input.queueId)
                .where("agent", "=", input.agentId)
                .execute();
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
    readAllTicketTags: agentProcedure.query(async () => {
        const tags = await db
            .selectFrom("ticket_tags")
            .select("name")
            .distinct()
            .orderBy("name", "asc")
            .execute()
            .then((r) => r.map((t) => t.name));

        return tags;
    }),
    readFocusTickets: agentProcedure
        .input(
            z.object({
                tag: z.string().optional(),
                status: z
                    .union([ticketStatusSchema, z.literal("not_closed")])
                    .optional(),
                priority: ticketPrioritySchema.nullish()
            })
        )
        .query<AgentTicketMetadata[]>(async ({ ctx, input }) => {
            // Get tickets that have skills and where all skills are in the agent's skills
            let query = db
                .selectFrom("tickets")
                .innerJoin("users", "users.id", "tickets.author")
                .leftJoin(
                    "ticket_skills",
                    "ticket_skills.ticket",
                    "tickets.id"
                );

            if (input.tag !== undefined) {
                query = query.where((dbi) =>
                    dbi.exists(
                        dbi
                            .selectFrom("ticket_tags")
                            .whereRef("ticket_tags.ticket", "=", "tickets.id")
                            .where("ticket_tags.name", "=", input.tag ?? "")
                            .select("ticket_tags.id")
                    )
                );
            }

            if (input.status !== undefined) {
                if (input.status === "not_closed") {
                    query = query.where("tickets.status", "!=", "closed");
                } else {
                    query = query.where("tickets.status", "=", input.status);
                }
            }

            if (input.priority !== undefined) {
                query = query.where((dbi) => {
                    if (input.priority === null) {
                        return dbi("tickets.priority", "is", null);
                    }
                    return dbi(
                        "tickets.priority",
                        "=",
                        input.priority as "low" | "medium" | "high" | "urgent"
                    );
                });
            }

            const tickets = await query
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
                .select((dbi) => [
                    "tickets.id as ticketId",
                    "tickets.status",
                    "tickets.priority",
                    "tickets.serial",
                    "tickets.author as authorId",
                    "tickets.title",
                    "users.name as author",
                    jsonArrayFrom(
                        dbi
                            .selectFrom("ticket_tags")
                            .whereRef("ticket_tags.ticket", "=", "tickets.id")
                            .select(["id", "name"])
                            .orderBy("name")
                    ).as("tags")
                ])
                .orderBy("tickets.serial", "asc")
                .execute();

            return tickets;
        }),
    readAllTickets: agentProcedure
        .input(
            z.object({
                tag: z.string().optional(),
                status: z
                    .union([ticketStatusSchema, z.literal("not_closed")])
                    .optional(),
                priority: ticketPrioritySchema.nullish()
            })
        )
        .query<AgentTicketMetadata[]>(async ({ input }) => {
            let query = db
                .selectFrom("tickets")
                .innerJoin("users", "users.id", "tickets.author");

            if (input.tag !== undefined) {
                query = query.where((dbi) =>
                    dbi.exists(
                        dbi
                            .selectFrom("ticket_tags")
                            .whereRef("ticket_tags.ticket", "=", "tickets.id")
                            .where("ticket_tags.name", "=", input.tag ?? "")
                            .select("ticket_tags.id")
                    )
                );
            }
            if (input.status !== undefined) {
                if (input.status === "not_closed") {
                    query = query.where("tickets.status", "!=", "closed");
                } else {
                    query = query.where("tickets.status", "=", input.status);
                }
            }

            if (input.priority !== undefined) {
                query = query.where((dbi) => {
                    if (input.priority === null) {
                        return dbi("tickets.priority", "is", null);
                    }
                    return dbi(
                        "tickets.priority",
                        "=",
                        input.priority as "low" | "medium" | "high" | "urgent"
                    );
                });
            }

            const tickets = await query
                .groupBy([
                    "tickets.id",
                    "tickets.status",
                    "tickets.priority",
                    "tickets.serial",
                    "tickets.author",
                    "tickets.title",
                    "users.name"
                ])
                .select((dbi) => [
                    "tickets.id as ticketId",
                    "tickets.status",
                    "tickets.priority",
                    "tickets.serial",
                    "tickets.author as authorId",
                    "tickets.title",
                    "users.name as author",
                    jsonArrayFrom(
                        dbi
                            .selectFrom("ticket_tags")
                            .select(["id", "name"])
                            .whereRef("ticket_tags.ticket", "=", "tickets.id")
                            .orderBy("name")
                    ).as("tags")
                ])
                .orderBy("tickets.serial", "asc")
                .execute();

            return tickets;
        }),
    readTicket: agentProcedure
        .input(z.object({ id: z.string() }))
        .query<AgentTicket>(async ({ input }) => {
            const ticket = await db
                .selectFrom("tickets")
                .innerJoin("users", "users.id", "tickets.author")
                .leftJoin("queue_tickets", "queue_tickets.ticket", "tickets.id")
                .where("tickets.id", "=", input.id)
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
                                "content",
                                "ticket_messages.type"
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
                    ).as("skills"),
                    jsonArrayFrom(
                        dbi
                            .selectFrom("ticket_tags")
                            .select(["id", "name"])
                            .whereRef("ticket_tags.ticket", "=", "tickets.id")
                            .orderBy("name")
                    ).as("tags"),
                    jsonObjectFrom(
                        dbi
                            .selectFrom("queues")
                            .whereRef("queues.id", "=", "queue_tickets.queue")
                            .select(["id", "name"])
                    ).as("queue")
                ])
                .executeTakeFirstOrThrow(
                    () => new TRPCError({ code: "NOT_FOUND" })
                );

            return ticket;
        }),
    updateTicket: agentProcedure
        .input(
            z.object({
                id: z.string(),
                status: ticketStatusSchema,
                priority: ticketPrioritySchema,
                skills: z.array(z.string()),
                tags: z.array(z.string())
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
                    .where("id", "=", input.id)
                    .returning(["id"])
                    .executeTakeFirstOrThrow(
                        () => new TRPCError({ code: "NOT_FOUND" })
                    );

                // Delete existing skills
                await tx
                    .deleteFrom("ticket_skills")
                    .where("ticket", "=", input.id)
                    .execute();

                // Insert new skills
                if (input.skills.length > 0) {
                    await tx
                        .insertInto("ticket_skills")
                        .values(
                            input.skills.map((skillId) => ({
                                ticket: input.id,
                                skill: skillId
                            }))
                        )
                        .execute();
                }

                // Delete existing tags
                await tx
                    .deleteFrom("ticket_tags")
                    .where("ticket", "=", input.id)
                    .execute();

                // Insert new tags
                if (input.tags.length > 0) {
                    await tx
                        .insertInto("ticket_tags")
                        .values(
                            input.tags.map((name) => ({
                                ticket: input.id,
                                name
                            }))
                        )
                        .execute();
                }
            });
        }),
    createTicketMessage: agentProcedure
        .input(
            z.object({
                id: z.string(),
                content: z.string(),
                type: z.enum(["internal", "public"])
            })
        )
        .mutation(async ({ ctx, input }) => {
            await db
                .insertInto("ticket_messages")
                .values({
                    ticket: input.id,
                    serial: uuidv7(),
                    type: input.type,
                    author: ctx.user.id,
                    content: input.content
                })
                .execute();
        }),
    readTicketsByAuthor: agentProcedure
        .input(z.object({ authorId: z.string() }))
        .query<AgentTicketMetadata[]>(async ({ input }) => {
            const tickets = await db
                .selectFrom("tickets")
                .innerJoin("users", "users.id", "tickets.author")
                .where("tickets.author", "=", input.authorId)
                .select((dbi) => [
                    "tickets.id as ticketId",
                    "tickets.status",
                    "tickets.priority",
                    "tickets.serial",
                    "tickets.author as authorId",
                    "tickets.title",
                    "users.name as author",
                    jsonArrayFrom(
                        dbi
                            .selectFrom("ticket_tags")
                            .select(["id", "name"])
                            .whereRef("ticket_tags.ticket", "=", "tickets.id")
                            .orderBy("name")
                    ).as("tags")
                ])
                .orderBy("tickets.serial", "desc")
                .execute();

            return tickets;
        }),
    readQueueTickets: agentProcedure
        .input(
            z.object({
                tag: z.string().optional(),
                status: z
                    .union([ticketStatusSchema, z.literal("not_closed")])
                    .optional(),
                priority: ticketPrioritySchema.nullish()
            })
        )
        .query<AgentTicketMetadata[]>(async ({ ctx, input }) => {
            let query = db
                .selectFrom("tickets")
                .innerJoin("users", "users.id", "tickets.author")
                .innerJoin(
                    "queue_tickets",
                    "queue_tickets.ticket",
                    "tickets.id"
                )
                .innerJoin(
                    "queue_agents",
                    "queue_agents.queue",
                    "queue_tickets.queue"
                )
                .where("queue_agents.agent", "=", ctx.user.id);

            if (input.tag !== undefined) {
                query = query.where((dbi) =>
                    dbi.exists(
                        dbi
                            .selectFrom("ticket_tags")
                            .whereRef("ticket_tags.ticket", "=", "tickets.id")
                            .where("ticket_tags.name", "=", input.tag ?? "")
                            .select("ticket_tags.id")
                    )
                );
            }

            if (input.status !== undefined) {
                if (input.status === "not_closed") {
                    query = query.where("tickets.status", "!=", "closed");
                } else {
                    query = query.where("tickets.status", "=", input.status);
                }
            }

            if (input.priority !== undefined) {
                query = query.where((dbi) => {
                    if (input.priority === null) {
                        return dbi("tickets.priority", "is", null);
                    }
                    return dbi(
                        "tickets.priority",
                        "=",
                        input.priority as "low" | "medium" | "high" | "urgent"
                    );
                });
            }

            const tickets = await query
                .select((dbi) => [
                    "tickets.id as ticketId",
                    "tickets.status",
                    "tickets.priority",
                    "tickets.serial",
                    "tickets.author as authorId",
                    "tickets.title",
                    "users.name as author",
                    jsonArrayFrom(
                        dbi
                            .selectFrom("ticket_tags")
                            .select(["id", "name"])
                            .whereRef("ticket_tags.ticket", "=", "tickets.id")
                            .orderBy("name")
                    ).as("tags")
                ])
                .orderBy("tickets.serial", "asc")
                .execute();

            return tickets;
        }),
    getQueues: agentProcedure.query(async () => {
        const queues = await db
            .selectFrom("queues")
            .select(["id", "name"])
            .orderBy("name")
            .execute();

        return queues;
    }),
    assignTicketToQueue: agentProcedure
        .input(
            z.object({ ticketId: z.string(), queueId: z.string().optional() })
        )
        .mutation(async ({ input }) => {
            if (input.queueId === undefined) {
                await db
                    .deleteFrom("queue_tickets")
                    .where("ticket", "=", input.ticketId)
                    .execute();
            } else {
                const queueId = input.queueId;
                await db.transaction().execute(async (tx) => {
                    // Delete existing queue assignment if any
                    await tx
                        .deleteFrom("queue_tickets")
                        .where("ticket", "=", input.ticketId)
                        .execute();

                    // Insert new queue assignment
                    await tx
                        .insertInto("queue_tickets")
                        .values({
                            queue: queueId,
                            ticket: input.ticketId,
                            created_at: new Date()
                        })
                        .execute();
                });
            }
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
    readAllTickets: authedProcedure
        .input(
            z.object({
                status: z
                    .union([ticketStatusSchema, z.literal("not_closed")])
                    .optional()
            })
        )
        .query<CustomerTicketMetadata[]>(async ({ ctx, input }) => {
            let query = db
                .selectFrom("tickets")
                .innerJoin("users", "users.id", "tickets.author")
                .select([
                    "tickets.id as ticketId",
                    "tickets.status",
                    "tickets.author as authorId",
                    "tickets.title",
                    "users.name as author"
                ])
                .where("tickets.author", "=", ctx.user.id);

            if (input.status !== undefined) {
                if (input.status === "not_closed") {
                    query = query.where("tickets.status", "!=", "closed");
                } else {
                    query = query.where("tickets.status", "=", input.status);
                }
            }

            const tickets = await query
                .orderBy("tickets.serial", "asc")
                .execute();

            return tickets;
        }),
    readTicket: authedProcedure
        .input(z.object({ id: z.string() }))
        .query<CustomerTicket>(async ({ ctx, input }) => {
            const ticket = await db
                .selectFrom("tickets")
                .innerJoin("users", "users.id", "tickets.author")
                .where("tickets.id", "=", input.id)
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
                                "content",
                                "ticket_messages.type"
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
                id: z.string(),
                content: z.string()
            })
        )
        .mutation(async ({ ctx, input }) => {
            await db.transaction().execute(async (tx) => {
                await tx
                    .selectFrom("tickets")
                    .where("id", "=", input.id)
                    .where("author", "=", ctx.user.id)
                    .select([])
                    .executeTakeFirstOrThrow(
                        () => new TRPCError({ code: "NOT_FOUND" })
                    );

                await tx
                    .insertInto("ticket_messages")
                    .values({
                        ticket: input.id,
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
