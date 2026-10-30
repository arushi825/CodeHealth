import { ESLint } from "eslint";
import path from "path";
import fs from "fs";
import os from "os";
import { pathToFileURL } from "url";
import { createRequire } from "module";

export const runLint = async (repoPath) => {
  const absolutePath = path.resolve(repoPath);
  console.log(`[Lint] Linting path: ${absolutePath}`);

  // Write a temp config file to avoid picking up the repo's own ESLint config
  const tempConfigDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "codecop-lint-")
  );

  const tempConfigPath = path.join(
    tempConfigDir,
    "eslint.config.mjs"
  );

  const require = createRequire(import.meta.url);

  const tsParserPath = require.resolve("@typescript-eslint/parser");
  const tsPluginPath = require.resolve("@typescript-eslint/eslint-plugin");

  const tsParserUrl = pathToFileURL(tsParserPath).href;
  const tsPluginUrl = pathToFileURL(tsPluginPath).href;

  fs.writeFileSync(tempConfigPath, `
import tsParser from "${tsParserUrl}";
import tsPlugin from "${tsPluginUrl}";

export default [

  /*
   * Base configuration for JavaScript and TypeScript.
   */
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/vendor/**",
      "**/coverage/**",
      "**/.git/**",
       "**/out/**",
    "**/server/temp/**",
    ],
  },

  /*
   * Base configuration for JavaScript and TypeScript.
   */
  {
    files: [
      "**/*.js",
      "**/*.jsx",
      "**/*.mjs",
      "**/*.cjs",
      "**/*.ts",
      "**/*.tsx",
    ],
    /*
     * IMPORTANT:
     * linterOptions belongs here, at the same level as
     * languageOptions and rules.
     */
    linterOptions: {
      noInlineConfig: true,
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",

      globals: {
        describe: "readonly",
        test: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        jest: "readonly",

        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        global: "readonly",

        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",

        URL: "readonly",
        fetch: "readonly",
        Response: "readonly",
        Request: "readonly",
        AbortController: "readonly",

        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        HTMLElement: "readonly",
      },
    },

    rules: {
      "no-undef": "error",
      "no-unused-vars": "warn",

      "eqeqeq": "error",
      "no-var": "error",
      "no-eval": "error",
      "no-debugger": "error",

    },
  },

  /*
   * Cypress-specific globals.
   *
   * This prevents false positives such as:
   * 'cy' is not defined
   * 'Cypress' is not defined
   */
  {
    files: [
      "**/*.cy.js",
      "**/*.cy.ts",
      "**/*.cy.jsx",
      "**/*.cy.tsx",
    ],

    languageOptions: {
      globals: {
        Cypress: "readonly",
        cy: "readonly",
      },
    },
  },

  /*
   * TypeScript-specific rules.
   *
   * Core ESLint no-undef/no-unused-vars are disabled for TS
   * because TypeScript has its own type system and the
   * @typescript-eslint rules should handle TS analysis.
   */
  {
    files: [
      "**/*.ts",
      "**/*.tsx",
    ],

    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
    
    },
  },

];
`
  );


  const eslint = new ESLint({
    cwd: absolutePath,
    overrideConfigFile: tempConfigPath,
  });

  let results;
  try {
    results = await eslint.lintFiles([
  "**/*.{js,jsx,mjs,cjs,ts,tsx}",
]);
  } catch (err) {
    if (err.message?.includes("All files matched") || err.message?.includes("No files matching")) {
      console.log(`[Lint] No JavaScript files found in repo, skipping lint`);
      return { errors: 0, warnings: 0, details: [], skipped: true };
    }
    throw err;
  } finally {
    fs.rmSync(tempConfigDir, { recursive: true, force: true });
  }

  console.log(`[Lint] Linted ${results.length} file(s)`);

  let errors = 0;
  let warnings = 0;
  const details = [];

  results.forEach((file) => {
    errors += file.errorCount;
    warnings += file.warningCount;

    const relPath = path.relative(absolutePath, file.filePath);
    for (const msg of file.messages) {
      details.push({
        file: relPath,
        line: msg.line || 0,
        column: msg.column || 0,
        severity: msg.severity === 2 ? "error" : "warning",
        message: msg.message,
        rule: msg.ruleId || "",
      });
    }
  });

  console.log(`[Lint] Total — errors: ${errors}, warnings: ${warnings}`);
  return { errors, warnings, details, skipped: false };
};