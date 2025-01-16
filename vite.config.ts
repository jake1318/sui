import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "[name].js", // Ensure all entry files have the .js extension
        chunkFileNames: "[name].js", // Ensure all chunks have the .js extension
        assetFileNames: "[name].[ext]",
      },
    },
  },
  server: {
    mimeTypes: {
      "application/javascript": ["js"], // Explicitly define MIME type for JS
    },
  },
});
