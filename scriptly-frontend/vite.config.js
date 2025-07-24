// scriptly-frontend/vite.config.js

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite"; // Keep this line as is for now
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Add the define block here, at the same level as plugins
  define: {
    global: "window", // This tells Vite to replace 'global' with 'window'
  },
});
