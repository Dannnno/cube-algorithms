const { defineConfig, globalIgnores } = require("eslint/config");
const globals = require("globals");
const { fixupConfigRules, fixupPluginRules } = require("@eslint/compat");
const tsParser = require("@typescript-eslint/parser");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const _import = require("eslint-plugin-import");
const reactRefresh = require("eslint-plugin-react-refresh");
const js = require("@eslint/js");
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: __dirname,

        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/strict-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:react/jsx-runtime",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "prettier",
      ),
    ),

    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },

      react: {
        version: "detect",
      },
    },

    plugins: {
      react: fixupPluginRules(react),
      "react-hooks": fixupPluginRules(reactHooks),
      import: fixupPluginRules(_import),
      "react-refresh": reactRefresh,
    },

    rules: {
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],

      "react/react-in-jsx-scpe": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/unified-signatures": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "@typescript-eslint/no-inferrable-types": [
        "error",
        {
          ignoreParameters: true,
          ignoreProperties: true,
        },
      ],

      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allow: [
            {
              name: ["Error", "URL", "URLSearchParams", "unknown"],
              from: "lib",
            },
          ],
          allowAny: true,
          allowBoolean: true,
          allowNever: true,
          allowNullish: true,
          allowNumber: true,
        },
      ],
    },
  },
  globalIgnores([
    "**/dist",
    "**/.eslintrc.cjs",
    "**/*.scss.d.ts",
    "**/node_modules",
    "**/.vite",
    "**/commitlint.config.js",
    "**/vite.config.ts",
    "**/eslint.config.cjs",
  ]),
]);
