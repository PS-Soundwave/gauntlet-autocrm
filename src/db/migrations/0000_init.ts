import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema.createType("user_role").asEnum(["agent"]).execute();

    await db.schema
        .createType("ticket_status")
        .asEnum(["new", "open", "in_progress", "pending", "closed"])
        .execute();

    await db.schema
        .createType("ticket_priority")
        .asEnum(["low", "medium", "high", "urgent"])
        .execute();

    await db.schema
        .createType("ticket_message_type")
        .asEnum(["internal", "public"])
        .execute();

    await db.schema
        .createTable("users")
        .addColumn("id", "text", (col) => col.primaryKey())
        .addColumn("createdAt", "timestamptz", (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn("role", sql`user_role`, (col) => col.notNull())
        .execute();

    await db.schema
        .createTable("tickets")
        .addColumn("id", "uuid", (col) =>
            col.primaryKey().defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn("serial", "integer", (col) =>
            col.notNull().unique().generatedAlwaysAsIdentity()
        )
        .addColumn("createdAt", "timestamptz", (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn("author", "text", (col) => col.notNull())
        .addColumn("status", sql`ticket_status`, (col) => col.notNull())
        .addColumn("priority", sql`ticket_priority`, (col) => col.notNull())
        .execute();

    await db.schema
        .createTable("ticket_messages")
        .addColumn("id", "uuid", (col) =>
            col.primaryKey().defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn("serial", "integer", (col) =>
            col.notNull().unique().generatedAlwaysAsIdentity()
        )
        .addColumn("ticket", "uuid", (col) =>
            col.notNull().references("tickets.id")
        )
        .addColumn("createdAt", "timestamptz", (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn("author", "text", (col) => col.notNull())
        .addColumn("type", sql`ticket_message_type`, (col) => col.notNull())
        .addColumn("content", "text", (col) => col.notNull())
        .execute();

    await db.schema
        .createTable("ticket_tags")
        .addColumn("id", "uuid", (col) =>
            col.primaryKey().defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn("message", "uuid", (col) =>
            col.notNull().references("ticket_messages.id")
        )
        .addColumn("createdAt", "timestamptz", (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addColumn("name", "text", (col) => col.notNull())
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema.dropTable("ticket_tags").execute();
    await db.schema.dropTable("ticket_messages").execute();
    await db.schema.dropTable("tickets").execute();
    await db.schema.dropTable("users").execute();
    await db.schema.dropType("ticket_message_type").execute();
    await db.schema.dropType("ticket_priority").execute();
    await db.schema.dropType("ticket_status").execute();
    await db.schema.dropType("user_role").execute();
};
