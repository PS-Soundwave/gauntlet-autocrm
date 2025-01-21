import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("ticket_messages")
        .alterColumn("author", (col) =>
            col.setDataType(sql`uuid USING "author"::text::uuid`)
        )
        .execute();

    await db.schema
        .alterTable("ticket_messages")
        .addForeignKeyConstraint(
            "ticket_messages_author_fkey",
            ["author"],
            "users",
            ["id"]
        )
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("ticket_messages")
        .dropConstraint("ticket_messages_author_fkey")
        .execute();

    await db.schema
        .alterTable("ticket_messages")
        .alterColumn("author", (col) => col.setDataType("text"))
        .execute();
};
