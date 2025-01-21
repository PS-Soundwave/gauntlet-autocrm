import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("tickets")
        .alterColumn("author", (col) =>
            col.setDataType(sql`uuid USING "author"::text::uuid`)
        )
        .execute();

    await db.schema
        .alterTable("tickets")
        .addForeignKeyConstraint("tickets_author_fkey", ["author"], "users", [
            "id"
        ])
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("tickets")
        .dropConstraint("tickets_author_fkey")
        .execute();

    await db.schema
        .alterTable("tickets")
        .alterColumn("author", (col) => col.setDataType("text"))
        .execute();
};
