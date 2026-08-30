import type { NextConfig } from "next";

// BASE_PATH lets the same build serve from a subpath (GitHub Pages: /booksum)
// or from root (Vercel/local: ""). Set via env when building for Pages.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Static export -> works on GitHub Pages (free) AND Vercel.
  output: "export",
  images: { unoptimized: true },
  basePath,
  // assetPrefix keeps sub-resource URLs correct under a subpath.
  assetPrefix: basePath,
};

export default nextConfig;
