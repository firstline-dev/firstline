import path from "node:path";

import tailwind from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Standalone static build of the FirstLine UI (no router, no server).
// Used only to produce the drag-and-drop hostable folder deliverable.
export default defineConfig({
  root: path.resolve("/dev-server/static-export"),
  base: "./",
  plugins: [react(), tailwind()],
  resolve: { alias: { "@": path.resolve("/dev-server/src") } },
  
  build: { outDir: "/tmp/firstline-static", emptyOutDir: true },
});
