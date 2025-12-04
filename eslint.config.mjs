import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "eslint-config-next";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: [
      "node_modules/",
      "*/node_modules/",
      "dist/",
      "*/dist/",
      "build/",
      "*/build/",
      ".next/",
      "*/.next/",
      "out/",
      "*/out/",
      "frontend/",
    ],
  },
  // Next.js specific rules for frontend
  {
    files: ["frontend/**/*.ts", "frontend/**/*.tsx"],
  },
];
