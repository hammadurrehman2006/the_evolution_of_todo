import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/((?!auth).*)",
        destination: "https://teot-p3-api.vercel.app/:1",
      },
    ];
  },
};

export default nextConfig;