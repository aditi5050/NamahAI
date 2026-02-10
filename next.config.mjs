/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["gsap"],
  output: "export", // Optional: if static export is desired. But standard build is safer for now.
  // Actually, let's stick to standard build unless user asked for static.
  // User asked for "npm run dev without hydration errors".
  reactStrictMode: true,
  images: {
    unoptimized: true, // Necessary for local images unless we configure domains or loader
  },
};

export default nextConfig;
