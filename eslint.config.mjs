import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

// D-024: jsx-a11y enforcement on JSX surfaces. Uses @typescript-eslint/parser
// so the rules can read TS/TSX syntax without choking on annotations.
const tsxLanguageOptions = {
  parser: tsParser,
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: "latest",
    sourceType: "module",
  },
};

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
      // Worktree copies created by the Claude Code harness — they're full
      // repo clones that lint would otherwise double-scan, producing
      // duplicate noise on every push (see SESSION_28 close).
      ".claude/**",
    ],
  },
  ...compat.extends("plugin:jsx-a11y/recommended").map((config) => ({
    ...config,
    files: ["**/*.tsx"],
    languageOptions: {
      ...config.languageOptions,
      ...tsxLanguageOptions,
    },
  })),
  // D-024 apply-on-touch (Session D): react-hooks plugin enables the
  // `react-hooks/exhaustive-deps` rule referenced by existing eslint-disable
  // directives (e.g. app/sign-up/form.tsx:22). Without this the directive
  // was raising "Definition for rule not found" errors.
  ...compat.extends("plugin:react-hooks/recommended").map((config) => ({
    ...config,
    files: ["**/*.tsx"],
    languageOptions: {
      ...config.languageOptions,
      ...tsxLanguageOptions,
    },
  })),
];
