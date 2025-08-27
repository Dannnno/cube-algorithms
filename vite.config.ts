/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    browser: {
      name: "chromium",
      enabled: true,
    },
    // coverage: {
    //   provider: "v8",
    //   reporter: ["default", "text", "json", "html"],
    //   reportsDirectory: "./coverage",
    //   enabled: true,
    //   reportOnFailure: true,
    // }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@model": path.resolve(__dirname, "./src/model"),
      "@common": path.resolve(__dirname, "./src/common"),
      "@test": path.resolve(__dirname, "./test"),
    },
  },
});
