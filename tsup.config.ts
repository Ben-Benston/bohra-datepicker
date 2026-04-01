import { defineConfig } from "tsup";

export default defineConfig([
  // Core — no framework, ships ESM + CJS
  {
    entry: { index: "src/core/index.ts" },
    outDir: "dist/core",
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom"],
  },
  // React component — ESM + CJS
  {
    entry: { index: "src/react/index.ts" },
    outDir: "dist/react",
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    external: ["react", "react-dom"],
    esbuildOptions(opts) {
      opts.jsx = "automatic";
    },
  },
  // Vanilla — IIFE bundle for <script> tag usage
  {
    entry: { "bohra-datepicker": "src/vanilla/index.ts" },
    outDir: "dist/vanilla",
    format: ["iife"],
    globalName: "BohraDatepicker",
    minify: true,
    sourcemap: true,
  },
]);
