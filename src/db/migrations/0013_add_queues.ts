import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .createTable("queues")
        .addColumn("id", "uuid", (col) => col.primaryKey())
        .addColumn("name", "text", (col) => col.notNull())
        .addColumn("createdAt", "timestamptz", (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .execute();

    await db.schema
        .createTable("queue_agents")
        .addColumn("queue", "uuid", (col) =>
            col.notNull().references("queues.id")
        )
        .addColumn("agent", "uuid", (col) =>
            col.notNull().references("users.id")
        )
        .addColumn("created_at", "timestamptz", (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addPrimaryKeyConstraint("queue_agents_pk", ["queue", "agent"])
        .execute();

    await db.schema
        .createTable("queue_tickets")
        .addColumn("queue", "uuid", (col) =>
            col.notNull().references("queues.id")
        )
        .addColumn("ticket", "uuid", (col) =>
            col.primaryKey().references("tickets.id")
        )
        .addColumn("created_at", "timestamptz", (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema.dropTable("queue_tickets").execute();
    await db.schema.dropTable("queue_agents").execute();
    await db.schema.dropTable("queues").execute();
};
