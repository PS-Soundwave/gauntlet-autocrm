import { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("tickets")
        .addColumn("title", "text", (col) => col.notNull())
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema.alterTable("tickets").dropColumn("title").execute();
};
