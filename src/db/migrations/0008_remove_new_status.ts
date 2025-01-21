import { Kysely, sql } from "kysely";
import { Type } from "../extensions/with_schemable_types";

export const up = async (db: Kysely<any>) => {
    await db.schema
        .createType("ticket_status_new")
        .asEnum(["open", "in_progress", "pending", "closed"])
        .execute();

    await db.schema
        .alterTable("tickets")
        .alterColumn("status", (col) =>
            col.setDataType(
                sql`${new Type("ticket_status_new")} USING "status"::text::${new Type("ticket_status_new")}`
            )
        )
        .execute();

    await db.schema.dropType("ticket_status").execute();

    await sql`ALTER TYPE ${new Type("ticket_status_new")} RENAME TO ticket_status`.execute(
        db
    );
};

export const down = async (db: Kysely<any>) => {
    await sql`ALTER TYPE ${new Type("ticket_status")} ADD VALUE 'new'`.execute(
        db
    );
};
