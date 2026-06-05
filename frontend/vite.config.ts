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
        // All node_modules into a single `vendor` chunk to avoid inter-chunk
        // circular deps (the prior split between vendor-react / vendor-misc
        // tripped a `react-is` → React.createContext cycle on cold load,
        // causing TypeError: Cannot read properties of undefined (reading
        // 'createContext') and a blank page). Page-level chunks still split
        // via React.lazy() in src/App.tsx — only vendor splitting is removed.
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
          // Academy course catalog (data/academy/courses/index.ts + the
          // per-course content modules) is large, static, and only loaded by
          // the lazy Academy routes. Give it an explicit name so Rollup does
          // not name it `index-*` (it derives chunk names from the source
          // `index.ts`), which would otherwise sweep this lazy chunk into the
          // eager-entry `index-*.js` bundle-size guard in ci.yml.
          if (id.includes("/data/academy/courses/")) return "academy-courses";
          return undefined;
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
    allowedHosts: ["projextpal.com", "www.projextpal.com", "localhost", "127.0.0.1"],
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
