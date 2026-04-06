import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
      // Peer dependencies
      external: ["react", "react-dom", "hls.js"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "hls.js": "Hls",
        },
      },
    },
  },
});
