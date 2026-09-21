import path from "node:path";

import tailwind from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Standalone static build of the FirstLine UI (no router, no server).
// Used only to produce the drag-and-drop hostable folder deliverable.
export default defineConfig({
  root: "/tmp/static-app",
  base: "./",
  plugins: [react(), tailwind()],
  resolve: { alias: { "@": path.resolve("/dev-server/src") } },
  server: { fs: { allow: ["/tmp/static-app", "/dev-server"] } },
  build: { outDir: "/tmp/firstline-static", emptyOutDir: true },
});
