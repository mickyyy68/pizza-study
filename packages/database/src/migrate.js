import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
function getConnectionString() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error("DATABASE_URL environment variable is not set");
    }
    return url;
}
// Use max: 1 for migrations (required by migrator)
const migrationSql = postgres(getConnectionString(), { max: 1 });
const db = drizzle(migrationSql);
async function main() {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations complete!");
    await migrationSql.end();
}
main().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
