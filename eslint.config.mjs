import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

// D-024: jsx-a11y enforcement on JSX surfaces. Uses @typescript-eslint/parser
// so the rules can read TS/TSX syntax without choking on annotations.
export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "supabase/functions/**",
      "scripts/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("plugin:jsx-a11y/recommended").map((config) => ({
    ...config,
    files: ["**/*.tsx"],
    languageOptions: {
      ...config.languageOptions,
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  })),
];
