import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite configuration for the Blockchain E-Voting frontend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // Split heavy vendor libraries into separate chunks for faster loads
    rollupOptions: {
      output: {
        manualChunks: {
          ethers: ["ethers"],
          react: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
