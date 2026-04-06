import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ReactHlsPlayer",
      formats: ["es", "cjs"],
      fileName: (format) => `react-hls-player.${format}.js`,
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
