"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import webpush from "web-push";
import { db } from "@/db";
import { notes, pushSubscriptions } from "@/db/schema";

// --- Notas (demo Clerk + Drizzle) ---

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

// --- PWA: Web Push (guia oficial de Next.js) ---

type SerializedSub = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error("Faltan claves VAPID (ver .env.example)");
  }
  webpush.setVapidDetails("mailto:admin@example.com", publicKey, privateKey);
}

export async function subscribeUser(sub: SerializedSub) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autenticado");

  // Validacion de forma: las server actions son endpoints publicos autenticados.
  if (
    typeof sub?.endpoint !== "string" ||
    !sub.endpoint.startsWith("https://") ||
    typeof sub.keys?.p256dh !== "string" ||
    !sub.keys.p256dh ||
    typeof sub.keys?.auth !== "string" ||
    !sub.keys.auth
  ) {
    throw new Error("Suscripcion invalida");
  }

  db.insert(pushSubscriptions)
    .values({
      userId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      // Solo actualiza si el endpoint YA pertenece a este usuario: evita que una
      // cuenta "secuestre" (reasigne) la suscripcion de otra.
      setWhere: eq(pushSubscriptions.userId, userId),
    })
    .run();

  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autenticado");

  db.delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint),
      ),
    )
    .run();

  return { success: true };
}

export async function sendNotification(message: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autenticado");

  configureWebPush();

  const subs = db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId))
    .all();

  await Promise.all(
    subs.map((s) =>
      webpush
        .sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: "base-app", body: message, icon: "/icon.svg" }),
        )
        .catch((err: { statusCode?: number }) => {
          // 404/410 => suscripcion expirada: limpiar de la DB.
          if (err.statusCode === 404 || err.statusCode === 410) {
            db.delete(pushSubscriptions)
              .where(eq(pushSubscriptions.endpoint, s.endpoint))
              .run();
          }
        }),
    ),
  );

  return { success: true };
}
