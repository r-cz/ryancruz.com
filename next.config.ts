import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

// Initialize Cloudflare bindings for local development
initOpenNextCloudflareForDev();

export default nextConfig;
