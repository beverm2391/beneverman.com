import type { NextConfig } from "next";

const production = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  transpilePackages: ["rehype-pretty-code", "shiki"],
  // mermaid-isomorphic locates its browser bundle via import.meta.resolve,
  // which Turbopack's shim doesn't implement — run these in real Node.
  serverExternalPackages: ["rehype-mermaid", "mermaid-isomorphic", "playwright"],
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
