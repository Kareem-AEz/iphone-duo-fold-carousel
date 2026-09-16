import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["172.16.0.2", "192.168.100.2"],
};

export default nextConfig;
