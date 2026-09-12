import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      "next/font/google": fileURLToPath(new URL("./test-support/next-font-google.ts", import.meta.url))
    }
  }
});
