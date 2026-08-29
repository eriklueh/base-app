import { clerkMiddleware } from "@clerk/nextjs/server";

// Next.js 16: el archivo de middleware se llama proxy.ts (en Next <=15 seria middleware.ts).
// Obligatorio aunque no protejas rutas aqui: auth() lo necesita para resolver la sesion.
// Clerk ya NO recomienda proteger rutas en el middleware ni usar createRouteMatcher (deprecado):
// protege cerca del recurso (Server Components / Route Handlers / Server Actions) con auth().
export default clerkMiddleware();

export const config = {
  matcher: [
    // Todas las rutas salvo estaticos e internos de Next.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Siempre en API/tRPC.
    "/(api|trpc)(.*)",
    // Handshake/proxy de Clerk (requerido en Next 16).
    "/__clerk/(.*)",
  ],
};
