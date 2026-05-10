import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  build: {
    target: "es2020",
    // Bump warning limit; the actual budget is enforced in CI by the
    // bundle-size guard in .github/workflows/ci.yml.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split vendor + heavy libs into stable chunks. Browser cache survives
        // app updates because vendor hashes change rarely. Per Vite/Rollup docs
        // a manualChunks function must return a single chunk name per module.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          // Heavy libs each get their own chunk.
          if (id.includes("@tiptap")) return "vendor-tiptap";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("jspdf") || id.includes("html2canvas")) return "vendor-pdf";
          if (id.includes("@dnd-kit")) return "vendor-dnd";

          // Radix UI (~30 sub-packages) — one chunk for all.
          if (id.includes("@radix-ui")) return "vendor-radix";

          // Core React stack.
          if (
            id.includes("react/") ||
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("scheduler")
          ) {
            return "vendor-react";
          }

          // Sentry — bigger than typical lib but optional.
          if (id.includes("@sentry")) return "vendor-sentry";

          // i18n stack.
          if (id.includes("i18next") || id.includes("react-i18next")) return "vendor-i18n";

          // TanStack Query.
          if (id.includes("@tanstack")) return "vendor-tanstack";

          // Lucide icons (tree-shaken but still ~big in single chunk).
          if (id.includes("lucide-react")) return "vendor-icons";

          // Date / forms / utils — small, group together.
          if (
            id.includes("date-fns") ||
            id.includes("react-hook-form") ||
            id.includes("zod") ||
            id.includes("class-variance-authority") ||
            id.includes("clsx") ||
            id.includes("tailwind-merge")
          ) {
            return "vendor-utils";
          }

          // Everything else from node_modules.
          return "vendor-misc";
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
  },
  server: {
    allowedHosts: ["projextpal.com", "www.projextpal.com"],
    host: "::",
    port: 8083,
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
