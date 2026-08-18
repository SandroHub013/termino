import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Rules a Sonar-style scan reports on this repo but eslint-config-next
    // leaves off. Turning them on here keeps the two in agreement, so a
    // regression fails `npm run lint` instead of surfacing weeks later in a
    // scan report.
    rules: {
      "react/no-array-index-key": "error",
      "react/prefer-read-only-props": "error",
      "react/jsx-child-element-spacing": "error",
      "react/no-unknown-property": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-noninteractive-tabindex": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "@typescript-eslint/prefer-for-of": "error",
    },
  },
  {
    // `examples/` compiles against `jsxImportSource: "@opentui/react"`, whose
    // intrinsics are terminal renderables, not DOM elements — `fg`, `gap`,
    // `borderStyle` and `flexDirection` are declared props of `TextOptions`
    // and `BoxOptions`. A rule that validates JSX props against the HTML DOM
    // has nothing to say about them.
    files: ["examples/**/*.tsx"],
    rules: { "react/no-unknown-property": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test coverage output.
    "coverage/**",
  ]),
]);

export default eslintConfig;
