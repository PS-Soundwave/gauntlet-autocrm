import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("users")
        .alterColumn("id", (col) =>
            col.setDataType(sql`uuid USING "id"::text::uuid`)
        )
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("users")
        .alterColumn("id", (col) => col.setDataType("text"))
        .execute();
};
