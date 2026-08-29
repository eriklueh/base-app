"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { notes } from "@/db/schema";

// Server Action: crea una nota para el usuario autenticado.
// Protegemos cerca del recurso (no en el middleware), leyendo auth() aqui.
export async function addNote(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autenticado");

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  // better-sqlite3 es sincrono: sin await, con .run().
  db.insert(notes).values({ authorId: userId, body, createdAt: new Date() }).run();

  revalidatePath("/");
}
