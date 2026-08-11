import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// JSX is transformed by esbuild using the `jsx: "react-jsx"` setting from
// tsconfig.json — no React plugin needed, Fast Refresh is irrelevant here.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json-summary", "lcov"],
      reportsDirectory: "./coverage",
      include: ["lib/**/*.ts", "components/**/*.tsx"],
      // OpenTUI (terminal-host) components cannot mount in jsdom, and the
      // barrel that re-exports them resolves only through a bundler. The pure
      // rendering functions they call are covered directly instead.
      exclude: [
        "lib/custom/*.tsx",
        "lib/custom/index.ts",
        "components/demos/**",
      ],
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
      },
    },
  },
});
