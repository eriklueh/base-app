# base-app

Base de proyecto con nuestro stack:
**Next.js 16 (App Router) · Clerk · Zustand · Drizzle ORM + SQLite (better-sqlite3) · shadcn/ui · Tailwind v4.**

Trae cableado y funcionando: auth con Clerk, una tabla demo con Drizzle/SQLite (notas por usuario), un store de Zustand, y componentes shadcn (Base UI). Ademas viene enganchado al plugin de Claude Code `eriklueh-plugin` (skills del stack) via `.claude/settings.json`.

## Requisitos
- Node.js >= 20.9
- pnpm

## Arranque
```bash
pnpm install                 # compila better-sqlite3 (aprobado en pnpm-workspace.yaml)
cp .env.example .env.local   # y rellena las claves de Clerk
pnpm dev
```
Necesitas una app en https://dashboard.clerk.com para obtener `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY`. Sin ellas, Clerk no arranca.

La base de datos SQLite (`app.db`) y sus tablas se crean solas al arrancar: `db/index.ts` aplica las migraciones de `drizzle/` en el primer acceso.

## Scripts de base de datos
```bash
pnpm db:generate   # genera SQL de migracion desde db/schema.ts -> drizzle/
pnpm db:migrate    # aplica migraciones manualmente
pnpm db:studio     # GUI para inspeccionar la DB
```

## Estructura
- `app/` — rutas (App Router). `app/page.tsx` demo (auth + notas). `app/actions.ts` server action.
- `components/ui/` — componentes shadcn. `components/` — propios (`counter.tsx`).
- `db/` — `schema.ts`, cliente `index.ts` (singleton + PRAGMAs + migrate), `drizzle.config.ts` en la raiz.
- `stores/` — stores de Zustand.
- `lib/utils.ts` — helper `cn()`.
- `proxy.ts` — middleware de Clerk (Next 16; en Next <=15 seria `middleware.ts`).

## PWA (instalable + push)
Sigue la guia oficial de Next.js (todo nativo, sin plugin):
- `app/manifest.ts` — web app manifest (instalar en pantalla de inicio). Reemplaza `public/icon.svg` por PNG 192/512 (incl. maskable) para produccion.
- `lib/service-worker.js` — service worker de push (se registra desde `components/pwa.tsx`). No cachea offline.
- `app/actions.ts` — server actions `subscribeUser`/`unsubscribeUser`/`sendNotification` (via `web-push`), gateadas por Clerk; las suscripciones se guardan en Drizzle (`push_subscriptions`).
- `components/pwa.tsx` — UI cliente (activar/enviar/instalar).

Para probar push:
```bash
npx web-push generate-vapid-keys   # pega las claves en .env.local (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY)
pnpm dev --experimental-https      # push requiere HTTPS, incluso en local
```
Para **offline real** (caché con service worker) la doc de Next recomienda [Serwist](https://github.com/serwist/serwist); Next 16 tambien trae el hook experimental `useOffline`.

## Convenciones (resumen)
- Datos y secretos: SOLO en servidor (Server Components / Route Handlers / Server Actions). Nunca importar `db/` en `'use client'`.
- better-sqlite3 es SINCRONO: queries y transacciones sin `await`.
- Clerk Core 3: `ClerkProvider` dentro de `<body>`; `auth()`/`currentUser()` con `await`; proteger cerca del recurso (no en el middleware).
- shadcn/Tailwind v4: theming CSS-first en `app/globals.css` (tokens OKLCH + `@theme inline`), dark mode por clase `.dark`.

Estas convenciones estan detalladas en el plugin de Claude Code `eriklueh-plugin` (skills: `drizzle-sqlite`, `zustand-patterns`, `nextjs16-patterns`, `shadcn-tailwind-theming`, `project-conventions`).

## Plugin de Claude Code
Al confiar en esta carpeta, Claude Code (via `.claude/settings.json`) registra dos marketplaces y activa sus plugins:
- `eriklueh-plugin@eriklueh-kit` — nuestras skills del stack + MCP de shadcn (instalar componentes) y de Clerk (snippets del SDK al dia; pide login OAuth la primera vez).
- `core`, `frameworks`, `features` de `clerk-skills` — **skills OFICIALES de Clerk**: hacen que Claude conozca los componentes (`<SignIn/>`, `<UserButton/>`, `<OrganizationSwitcher/>`, control components, hooks) y las capacidades (orgs/RBAC, billing, webhooks, custom UI, testing). (No incluimos `mobile`.)

Asi, para Clerk, Claude tiene consciencia plena de componentes/capacidades (skills oficiales) + snippets actuales (MCP). Alternativa manual: `npx skills add clerk/skills`.
