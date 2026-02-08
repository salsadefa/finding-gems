import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rules
  {
    rules: {
      // Prevent mock data imports in production code
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["**/mockData*", "**/mock*", "**/__mocks__/*"],
              message: "⚠️ Mock data should not be used in production components. Use real API hooks instead. See FE-BUG-TRACKING.md"
            }
          ]
        }
      ]
    }
  }
]);

export default eslintConfig;

