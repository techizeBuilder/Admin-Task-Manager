import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  root: "./client",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    allowedHosts: [
      "25b3cec7-b6b2-48b7-a8f4-7ee8a9c12574-00-36vzyej2u9kbm.kirk.replit.dev",
      ".replit.dev",
      "localhost",
    ],
    host: "0.0.0.0",
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
