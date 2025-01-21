import { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("ticket_messages")
        .dropColumn("serial")
        .execute();

    await db.schema
        .alterTable("ticket_messages")
        .addColumn("serial", "uuid", (col) => col.notNull().unique())
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("ticket_messages")
        .dropColumn("serial")
        .execute();

    await db.schema
        .alterTable("ticket_messages")
        .addColumn("serial", "integer", (col) =>
            col.notNull().unique().generatedAlwaysAsIdentity()
        )
        .execute();
};
