import {
    FileMigrationProvider,
    Kysely,
    Migrator,
    PostgresDialect
} from "kysely";
import { Pool } from "pg";
import { promises } from "fs";
import path from "path";
import { env } from "@/env";
import { WithSchemableTypesPlugin } from "./extensions/with_schemable_types";
import { Database } from "./types";

const dialect = new PostgresDialect({
    pool: new Pool({
        connectionString: env.DATABASE_URL
    })
});

export const db = new Kysely<Database>({
    dialect
})
    .withPlugin(new WithSchemableTypesPlugin("autocrm"))
    .withSchema("autocrm");

export const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
        fs: promises,
        path,
        migrationFolder: path.join(__dirname, "migrations")
    })
});
