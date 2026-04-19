import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// CRITICAL: base: './' makes built index.html use relative asset paths
// so the deck runs by double-clicking index.html from file://.
// See spec-slides/01-architecture.md.
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        format: "es",
      },
    },
  },
});
