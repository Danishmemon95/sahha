import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy API requests to the Express server during development
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
