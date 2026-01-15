import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/((?!auth).*)",
        destination: "https://todo-api-phase3.vercel.app/:1",
      },
    ];
  },
};

export default nextConfig;