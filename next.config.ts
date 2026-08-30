import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Deploys to Vercel (free tier). No static export needed — Vercel builds & serves it.
  // Cover images are remote (Open Library) and rendered with plain <img>, so no image domain config required.
};

export default nextConfig;
