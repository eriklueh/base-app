import type { MetadataRoute } from "next";

// Web App Manifest nativo de Next.js (App Router). Habilita "instalar en pantalla de inicio".
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "base-app",
    short_name: "base-app",
    description:
      "Base Next.js 16 + Clerk + Zustand + Drizzle/SQLite + shadcn/ui + Tailwind",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      // PNG placeholders (color solido). Reemplazar por iconos de marca reales.
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
