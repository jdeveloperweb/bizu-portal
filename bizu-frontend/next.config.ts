import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: "http://localhost:8280/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
