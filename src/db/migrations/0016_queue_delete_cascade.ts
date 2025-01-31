import { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("queue_agents")
        .dropConstraint("queue_agents_queue_fkey")
        .execute();
    await db.schema
        .alterTable("queue_tickets")
        .dropConstraint("queue_tickets_queue_fkey")
        .execute();

    await db.schema
        .alterTable("queue_agents")
        .addForeignKeyConstraint(
            "queue_agents_queue_fkey",
            ["queue"],
            "queues",
            ["id"]
        )
        .onDelete("cascade")
        .execute();
    await db.schema
        .alterTable("queue_tickets")
        .addForeignKeyConstraint(
            "queue_tickets_queue_fkey",
            ["queue"],
            "queues",
            ["id"]
        )
        .onDelete("cascade")
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("queue_agents")
        .dropConstraint("queue_agents_queue_fkey")
        .execute();
    await db.schema
        .alterTable("queue_tickets")
        .dropConstraint("queue_tickets_queue_fkey")
        .execute();

    await db.schema
        .alterTable("queue_agents")
        .addForeignKeyConstraint(
            "queue_agents_queue_fkey",
            ["queue"],
            "queues",
            ["id"]
        )
        .execute();
    await db.schema
        .alterTable("queue_tickets")
        .addForeignKeyConstraint(
            "queue_tickets_queue_fkey",
            ["queue"],
            "queues",
            ["id"]
        )
        .execute();
};
