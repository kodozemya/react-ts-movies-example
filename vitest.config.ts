import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/*
  Окремий конфіг для тестів, як в уроці «Тестування компонентів».
  jsdom дає тестам подобу DOM у Node, setup.ts підключає матчери jest-dom
  і прибирає розмітку між тестами.
*/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
