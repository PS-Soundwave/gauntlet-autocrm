import { Kysely, sql } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .createTable("skills")
        .addColumn("id", "uuid", (col) =>
            col.primaryKey().defaultTo(sql`gen_random_uuid()`)
        )
        .addColumn("name", "text", (col) => col.notNull().unique())
        .addColumn("createdAt", sql`timestamptz`, (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .execute();

    await db.schema
        .createTable("agent_skills")
        .addColumn("agent", "uuid", (col) =>
            col.notNull().references("users.id")
        )
        .addColumn("skill", "uuid", (col) =>
            col.notNull().references("skills.id")
        )
        .addColumn("createdAt", sql`timestamptz`, (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addPrimaryKeyConstraint("agent_skills_pk", ["agent", "skill"])
        .execute();

    await db.schema
        .createTable("ticket_skills")
        .addColumn("ticket", "uuid", (col) =>
            col.notNull().references("tickets.id")
        )
        .addColumn("skill", "uuid", (col) =>
            col.notNull().references("skills.id")
        )
        .addColumn("createdAt", sql`timestamptz`, (col) =>
            col.notNull().defaultTo(sql`now()`)
        )
        .addPrimaryKeyConstraint("ticket_skills_pk", ["ticket", "skill"])
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema.dropTable("ticket_skills").execute();
    await db.schema.dropTable("agent_skills").execute();
    await db.schema.dropTable("skills").execute();
};
