import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Ensure the app is served from the root
  build: {
    outDir: "dist", // Specify the output directory
    sourcemap: true, // Enable source maps for debugging
  },
});
