import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 es un modulo nativo de Node: no debe empaquetarse en el bundle del servidor.
  serverExternalPackages: ["better-sqlite3"],
  // Headers de seguridad recomendados (utiles tambien para PWA).
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
