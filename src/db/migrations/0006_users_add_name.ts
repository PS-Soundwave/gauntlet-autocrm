import { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("users")
        .addColumn("name", "text", (col) => col.notNull())
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema.alterTable("users").dropColumn("name").execute();
};
