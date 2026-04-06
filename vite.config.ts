import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import pkg from "./package.json";

const peerDeps = Object.keys(pkg.peerDependencies || {});

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/index.ts",
      name: "ReactHlsPlayer",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: peerDeps,
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "hls.js": "Hls",
        },
      },
    },
    minify: "esbuild",
  },
});
