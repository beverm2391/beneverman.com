import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["rehype-pretty-code", "shiki"],
  turbopack: {
    rules: {
      "*.glsl": {
        loaders: ["raw-loader"],
        as: "*.js"
      }
    }
  }
};

export default nextConfig;
