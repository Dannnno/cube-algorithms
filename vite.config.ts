/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import sassDts from "vite-plugin-sass-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sassDts({
      enabledMode: ["development", "production"],
      sourceDir: path.resolve(__dirname, "./src"),
      outputDir: path.resolve(__dirname, "./dist"),
    }),
  ],
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
      "@common": path.resolve(__dirname, "./src/common"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@model": path.resolve(__dirname, "./src/model"),
      "@test": path.resolve(__dirname, "./test"),
    },
  },
});
