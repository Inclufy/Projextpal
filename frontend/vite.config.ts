import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// Sourcemaps naar Sentry. Zonder upload wijst elke stacktrace naar een regel in
// een geminificeerde bundel: je ziet dát er iets stuk is, niet waar.
//
// De upload draait alleen met SENTRY_AUTH_TOKEN. Zonder token wordt er ook geen
// sourcemap aangemaakt, en dat is bewust: de plug-in ruimt ze na de upload op,
// en slaat hij over, dan slaat het opruimen ook over. Dan zouden de kaarten mee
// het image in gaan en publiek downloadbaar zijn, wat je hele broncode weggeeft.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

export default defineConfig(({ mode }) => ({
  build: {
    target: "es2020",
    // Alleen aanmaken als er ook geüpload wordt, zie de toelichting hierboven.
    sourcemap: !!sentryAuthToken,
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
    // Alleen aanmaken als er ook geüpload wordt, zie de toelichting hierboven.
    sourcemap: !!sentryAuthToken,
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
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Moet als laatste: de plug-in leest de uitvoer van de build. De release is
    // VITE_APP_VERSION, dezelfde waarde die de SDK meestuurt; zonder die match
    // kan Sentry de kaarten niet aan de meldingen koppelen.
    sentryVitePlugin({
      org: "inclufy",
      project: "projextpal-frontend",
      authToken: sentryAuthToken,
      disable: !sentryAuthToken,
      telemetry: false,
      release: process.env.VITE_APP_VERSION ? { name: process.env.VITE_APP_VERSION } : undefined,
      sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
