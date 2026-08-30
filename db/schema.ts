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

// PWA: suscripciones de Web Push. Una fila por navegador/dispositivo suscrito.
export const pushSubscriptions = sqliteTable(
  "push_subscriptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(), // Clerk user id
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [index("push_subscriptions_user_idx").on(t.userId)],
);

export type SelectPushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;
