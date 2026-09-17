import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@a2m8/module-admin",
    "@a2m8/module-calling",
    "@a2m8/module-contacts",
    "@a2m8/module-integrations",
    "@a2m8/integration-vapi",
    "@a2m8/ui",
  ],
};

export default nextConfig;
