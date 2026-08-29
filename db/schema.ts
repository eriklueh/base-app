import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

// Tabla demo: notas por usuario. authorId guarda el user id de Clerk.
export const notes = sqliteTable(
  "notes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    authorId: text("author_id").notNull(),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("notes_author_idx").on(t.authorId)],
);

// Tipos derivados del esquema (usar en server actions, route handlers, etc.).
export type SelectNote = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;
