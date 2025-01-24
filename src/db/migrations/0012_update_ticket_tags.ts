import { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("ticket_tags")
        .dropConstraint("ticket_tags_message_fkey")
        .execute();

    await db.schema
        .alterTable("ticket_tags")
        .renameColumn("message", "ticket")
        .execute();

    await db.schema
        .alterTable("ticket_tags")
        .addForeignKeyConstraint(
            "ticket_tags_ticket_fkey",
            ["ticket"],
            "tickets",
            ["id"]
        )
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("ticket_tags")
        .dropConstraint("ticket_tags_ticket_fkey")
        .execute();

    await db.schema
        .alterTable("ticket_tags")
        .renameColumn("ticket", "message")
        .execute();

    await db.schema
        .alterTable("ticket_tags")
        .addForeignKeyConstraint(
            "ticket_tags_message_fkey",
            ["message"],
            "ticket_messages",
            ["id"]
        )
        .execute();
};
