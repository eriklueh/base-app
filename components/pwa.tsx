"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { subscribeUser, unsubscribeUser, sendNotification } from "@/app/actions";

// Lee un valor del navegador de forma SSR-safe (server snapshot fijo) sin setState-en-efecto.
const noopSubscribe = () => () => {};
function useBrowserValue<T>(compute: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, compute, () => serverValue);
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function PwaManager() {
  const isSupported = useBrowserValue(
    () => "serviceWorker" in navigator && "PushManager" in window,
    false,
  );
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isSupported) return;
    let active = true;
    navigator.serviceWorker
      .register(new URL("../lib/service-worker.js", import.meta.url), {
        scope: "/",
        updateViaCache: "none",
      })
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (active) setSubscription(sub);
      });
    return () => {
      active = false;
    };
  }, [isSupported]);

  async function subscribe() {
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!key) {
      alert("Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY (ver .env.example)");
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });
    setSubscription(sub);
    const json = sub.toJSON();
    await subscribeUser({
      endpoint: json.endpoint!,
      keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
    });
  }

  async function unsubscribe() {
    if (!subscription) return;
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    setSubscription(null);
    await unsubscribeUser(endpoint);
  }

  async function sendTest() {
    if (!subscription) return;
    await sendNotification(message || "Hola desde base-app");
    setMessage("");
  }

  if (!isSupported) {
    return (
      <p className="text-sm text-muted-foreground">
        Este navegador no soporta notificaciones push.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {subscription ? (
        <>
          <p className="text-sm text-muted-foreground">Suscrito a notificaciones.</p>
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mensaje de prueba..."
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button onClick={sendTest}>Enviar</Button>
          </div>
          <Button variant="outline" onClick={unsubscribe}>
            Desuscribir
          </Button>
        </>
      ) : (
        <Button onClick={subscribe}>Activar notificaciones</Button>
      )}
      <InstallHint />
    </div>
  );
}

function InstallHint() {
  const isIOS = useBrowserValue(
    () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    false,
  );
  const isStandalone = useBrowserValue(
    () => window.matchMedia("(display-mode: standalone)").matches,
    false,
  );

  if (isStandalone) return null;

  return (
    <p className="text-sm text-muted-foreground">
      {isIOS
        ? 'Para instalar: toca Compartir y "Anadir a pantalla de inicio".'
        : "Puedes instalar esta app desde el menu del navegador (Instalar)."}
    </p>
  );
}
