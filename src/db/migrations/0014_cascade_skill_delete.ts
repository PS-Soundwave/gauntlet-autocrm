import { Kysely } from "kysely";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("ticket_skills")
        .dropConstraint("ticket_skills_skill_fkey")
        .execute();

    await db.schema
        .alterTable("agent_skills")
        .dropConstraint("agent_skills_skill_fkey")
        .execute();

    await db.schema
        .alterTable("ticket_skills")
        .addForeignKeyConstraint(
            "ticket_skills_skill_fkey",
            ["skill"],
            "skills",
            ["id"]
        )
        .onDelete("cascade")
        .execute();

    await db.schema
        .alterTable("agent_skills")
        .addForeignKeyConstraint(
            "agent_skills_skill_fkey",
            ["skill"],
            "skills",
            ["id"]
        )
        .onDelete("cascade")
        .execute();
};

export const down = async (db: Kysely<any>) => {
    await db.schema
        .alterTable("agent_skills")
        .dropConstraint("agent_skills_skill_fkey")
        .execute();

    await db.schema
        .alterTable("agent_skills")
        .addForeignKeyConstraint(
            "agent_skills_skill_fkey",
            ["skill"],
            "skills",
            ["id"]
        )
        .execute();

    await db.schema
        .alterTable("ticket_skills")
        .dropConstraint("ticket_skills_skill_fkey")
        .execute();

    await db.schema
        .alterTable("ticket_skills")
        .addForeignKeyConstraint(
            "ticket_skills_skill_fkey",
            ["skill"],
            "skills",
            ["id"]
        )
        .execute();
};
