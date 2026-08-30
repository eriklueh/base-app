import { auth } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { addNote } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Counter } from "@/components/counter";
import { PwaManager } from "@/components/pwa";

export default async function Home() {
  const { userId } = await auth(); // async en Clerk Core 3

  // better-sqlite3: consulta sincrona (sin await).
  const myNotes = userId
    ? db
        .select()
        .from(notes)
        .where(eq(notes.authorId, userId))
        .orderBy(desc(notes.createdAt))
        .all()
    : [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Estado de cliente (Zustand)</CardTitle>
        </CardHeader>
        <CardContent>
          <Counter />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tus notas (Clerk + Drizzle/SQLite)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {userId ? (
            <>
              <form action={addNote} className="flex gap-2">
                <input
                  name="body"
                  placeholder="Escribe una nota..."
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                <Button type="submit">Anadir</Button>
              </form>
              <ul className="flex flex-col gap-2">
                {myNotes.map((n) => (
                  <li key={n.id} className="rounded-md border px-3 py-2 text-sm">
                    {n.body}
                  </li>
                ))}
                {myNotes.length === 0 && (
                  <li className="text-sm text-muted-foreground">Aun no tienes notas.</li>
                )}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Inicia sesion (boton arriba a la derecha) para crear notas.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PWA (instalar + notificaciones push)</CardTitle>
        </CardHeader>
        <CardContent>
          <PwaManager />
        </CardContent>
      </Card>
    </div>
  );
}
