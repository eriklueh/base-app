import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

// Cliente Drizzle + better-sqlite3. SINCRONO: usar sin await.
// Server-only: no importar desde componentes 'use client' ni runtime edge.
function createDb() {
  const sqlite = new Database(process.env.DATABASE_URL ?? "app.db");
  // Drizzle no configura PRAGMAs; hay que activarlos a mano.
  sqlite.pragma("journal_mode = WAL"); // persiste en el header del archivo
  sqlite.pragma("foreign_keys = ON"); // por conexion: SQLite lo trae OFF
  sqlite.pragma("busy_timeout = 5000"); // por conexion

  const db = drizzle(sqlite, { schema });
  // Aplica migraciones pendientes al arrancar (idempotente). Genera con: pnpm db:generate
  migrate(db, { migrationsFolder: "./drizzle" });
  return db;
}

// Singleton a prueba del hot-reload de Next dev.
const g = globalThis as unknown as { __db?: ReturnType<typeof createDb> };
export const db = g.__db ?? (g.__db = createDb());
