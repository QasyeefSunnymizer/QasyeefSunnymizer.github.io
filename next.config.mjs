/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so it can be served from GitHub Pages now and any static or
  // Node host (Vercel, Cloudflare Pages, ...) later without code changes.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
