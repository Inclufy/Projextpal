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
