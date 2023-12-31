import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [laravel("resources/js/main.jsx"), react()],
  server: {
    hmr: {
      host: "localhost",
    },
  },
});
