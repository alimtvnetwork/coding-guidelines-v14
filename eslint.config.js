import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import codingGuidelines from "./eslint-plugins/coding-guidelines/index.js";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "coding-guidelines": codingGuidelines,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",

      // ═══════════════════════════════════════════════════════════════
      // 🔴 CODE RED RULES — Automatic PR rejection
      // Canonical source: spec/02-coding-guidelines/03-coding-guidelines-spec/
      // ═══════════════════════════════════════════════════════════════

      // Zero nested if — flatten with early returns or named booleans
      "coding-guidelines/no-nested-if": "error",

      // Boolean variables must use is/has/can/should/was/will prefix
      "coding-guidelines/boolean-naming": "error",

      // No raw string literals in comparisons — use enum/typed constants
      "coding-guidelines/no-magic-strings": "warn",

      // Max 15 lines per function body (non-blank, non-comment)
      "coding-guidelines/max-function-lines": ["error", { max: 15 }],

      // Promise.all for independent async calls — no sequential await
      "coding-guidelines/promise-all-independent": "error",

      // ═══════════════════════════════════════════════════════════════
      // ⚠️ STYLE RULES — Warnings
      // ═══════════════════════════════════════════════════════════════

      // Blank line before return/throw when preceded by statements (R4)
      "coding-guidelines/blank-line-before-return": "warn",

      // No else after return/throw/continue/break (R7)
      "coding-guidelines/no-else-after-return": "error",
    },
  },
);
