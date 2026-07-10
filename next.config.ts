import type { NextConfig } from "next";

const production = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  transpilePackages: ["rehype-pretty-code", "shiki"],
  async redirects() {
    return [
      {
        source: "/blog/minimalist-ai-agent",
        destination: "/blog",
        permanent: true
      }
    ];
  },
  turbopack: {
    // The route remains a production 404, but the editor and its CSS/deps are
    // replaced before bundling. Keep this exact import in app/lab/page.tsx.
    resolveAlias: production
      ? {
          "@/scene/lab/LabMount": "./scene/lab/LabUnavailable.tsx"
        }
      : {},
    rules: {
      "*.glsl": {
        loaders: ["raw-loader"],
        as: "*.js"
      }
    }
  }
};

export default nextConfig;
