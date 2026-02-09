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
    // Generated backend artifacts
    "backend/dist/**",
    "backend/coverage/**",
    // Backend has its own lint config/scripts
    "backend/**",
    "next-env.d.ts",
  ]),
  // Custom rules
  {
    rules: {
      // Keep lint useful but not blocking shipping.
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",

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
