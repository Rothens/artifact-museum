/**
 * Call this at the top of every Server Component and API route handler
 * that touches the database. sql.js needs to be initialized asynchronously
 * once; after that all operations are synchronous.
 */
import { getDb } from "../db/client.js";

export async function initDb() {
  await getDb();
}
