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

## Convenciones (resumen)
- Datos y secretos: SOLO en servidor (Server Components / Route Handlers / Server Actions). Nunca importar `db/` en `'use client'`.
- better-sqlite3 es SINCRONO: queries y transacciones sin `await`.
- Clerk Core 3: `ClerkProvider` dentro de `<body>`; `auth()`/`currentUser()` con `await`; proteger cerca del recurso (no en el middleware).
- shadcn/Tailwind v4: theming CSS-first en `app/globals.css` (tokens OKLCH + `@theme inline`), dark mode por clase `.dark`.

Estas convenciones estan detalladas en el plugin de Claude Code `eriklueh-plugin` (skills: `drizzle-sqlite`, `zustand-patterns`, `nextjs16-patterns`, `shadcn-tailwind-theming`, `project-conventions`).

## Plugin de Claude Code
Al confiar en esta carpeta, Claude Code registra el marketplace `eriklueh-kit` y activa `eriklueh-plugin` (definido en `.claude/settings.json`), que aporta las skills del stack y los MCP de shadcn (instalar componentes) y Clerk (snippets del SDK al dia). El MCP de Clerk pide login OAuth la primera vez.
