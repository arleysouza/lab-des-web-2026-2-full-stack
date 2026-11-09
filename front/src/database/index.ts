import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Inicialização sob demanda: o build não precisa de conexão com o banco.
// Reutiliza o pool nas chamadas deste módulo.
let pool: Pool | undefined;

export function getDb() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    pool.on("error", (error) =>
      console.error("Falha em conexão ociosa do PostgreSQL:", error),
    );
  }
  return drizzle({ client: pool, schema });
}
