import { Kysely, sql } from "kysely";
import { db } from "..";
import { Type } from "../extensions/with_schemable_types";

export const up = async (db: Kysely<any>) => {
    await sql`ALTER TYPE ${new Type("user_role")} ADD VALUE 'customer'`.execute(
        db
    );
};

export const down = async () => {
    await db.schema.createType("user_role_new").asEnum(["agent"]).execute();

    await db.schema
        .alterTable("users")
        .alterColumn("role", (col) =>
            col.setDataType(
                sql`user_role_new USING "role"::text::"user_role_new"`
            )
        )
        .execute();

    await db.schema.dropType("user_role").execute();

    await sql`ALTER TYPE "user_role_new" RENAME TO "user_role"`.execute(db);
};
