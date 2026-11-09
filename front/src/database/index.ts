import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Inicialização sob demanda: o build não precisa de conexão com o banco.
// O singleton evita novos pools a cada hot reload em desenvolvimento.
const databaseGlobal = globalThis as typeof globalThis & { postgresPool?: Pool };

export function getDb() {
  if (!databaseGlobal.postgresPool) {
    for (const key of ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"]) {
      if (!process.env[key]) throw new Error(`Configure ${key} no ambiente do servidor Next.js.`);
    }
    const port = Number(process.env.DB_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("DB_PORT deve ser uma porta válida.");
    }
    const pool = new Pool({
      host: process.env.DB_HOST,
      port,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      statement_timeout: 10000,
    });
    pool.on("error", (error) => console.error("Falha em conexão ociosa do PostgreSQL:", error));
    databaseGlobal.postgresPool = pool;
  }
  return drizzle({ client: databaseGlobal.postgresPool, schema });
}
