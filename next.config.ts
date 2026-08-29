import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 es un modulo nativo de Node: no debe empaquetarse en el bundle del servidor.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
