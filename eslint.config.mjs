import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
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
