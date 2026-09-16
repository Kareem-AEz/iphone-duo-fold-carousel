import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["172.16.0.2", "192.168.100.2"],
  // Backs the promise in "Try your photos": the page can only send requests to its own
  // origin, and images only come from here or from local `blob:` URLs.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "img-src 'self' blob: data:; connect-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
