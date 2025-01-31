import { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("skills")
        .addColumn("description", "text")
        .addColumn("smart_assign", "boolean")
        .execute();

    await db
        .updateTable("skills")
        .set({
            smart_assign: false
        })
        .execute();

    await db.schema
        .alterTable("skills")
        .alterColumn("smart_assign", (col) => col.setNotNull())
        .execute();

    await db.schema
        .alterTable("queues")
        .addColumn("description", "text")
        .addColumn("smart_assign", "boolean")
        .execute();

    await db
        .updateTable("queues")
        .set({
            smart_assign: false
        })
        .execute();

    await db.schema
        .alterTable("queues")
        .alterColumn("smart_assign", (col) => col.setNotNull())
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("skills")
        .dropColumn("description")
        .dropColumn("smart_assign")
        .execute();
    await db.schema
        .alterTable("queues")
        .dropColumn("description")
        .dropColumn("smart_assign")
        .execute();
};
