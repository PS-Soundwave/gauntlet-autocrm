import { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("tickets")
        .alterColumn("priority", (col) => col.dropNotNull())
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("tickets")
        .alterColumn("priority", (col) => col.setNotNull())
        .execute();
};
