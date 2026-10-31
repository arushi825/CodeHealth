import fs from "fs";
import path from "path";
import { spawnWithTimeout, isToolInstalled } from "../../utility/spawnWithTimeout.utils.js";

import { parseRuff, parseGolangciLint, parseDartAnalyze, parseTsc } from "../../utility/linterParsers.utils.js";
const LINTER_REGISTRY = {
  TypeScript: {
    command: "tsc",
    args: ["--noEmit", "--pretty", "false"],
    outputSource: "stdout",
    parser: parseTsc,
    requiresFile: "tsconfig.json",
  },
  Python: {
    command: "ruff",
    args: ["check", ".", "--output-format", "json"],
    outputSource: "stdout",
    parser: parseRuff,
  },
  Go: {
    command: "golangci-lint",
    args: ["run", "--out-format", "json", "--timeout", "30s"],
    outputSource: "stdout",
    parser: parseGolangciLint,
  },
  Dart: {
    command: "dart",
    args: ["analyze", "--format", "machine"],
    outputSource: "stdout",
    parser: parseDartAnalyze,
  },
};

// JavaScript is handled by the ESLint integration in lint.service.js
const ESLINT_LANGUAGES = new Set(["JavaScript", "TypeScript"]);

/**
 * Run linters sequentially for detected languages.
 * Skips JS/TS (handled by ESLint) and languages without a registry entry.
 * Silently skips if tool not installed, times out, or parse fails.
 */
export const runMultiLint = async (languages, repoPath) => {
  const results = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const language of languages) {
    if (ESLINT_LANGUAGES.has(language)) continue;

    const entry = LINTER_REGISTRY[language];
    if (!entry) continue;

    const { command, args, parser, requiresFile } = entry;

    // Check if required config file exists
    if (requiresFile && !fs.existsSync(path.join(repoPath, requiresFile))) {
      console.log(`[CodeCop] Skipping ${language} - ${requiresFile} not found`);
      continue;
    }

    console.log(`[CodeCop] Running ${language} linter (${command})...`);

    // Check if tool is installed
    const installed = await isToolInstalled(command);
    if (!installed) {
      console.log(`[CodeCop] Skipping ${language} - tool not installed`);
      continue;
    }

    // Spawn with timeout
    let output;
    try {
      output = await spawnWithTimeout(command, args, { cwd: repoPath, timeout: 30000 });
    } catch (err) {
      if (err === "TIMEOUT") {
        console.log(`[CodeCop] Skipping ${language} - timed out`);
      } else if (err === "NOT_INSTALLED") {
        console.log(`[CodeCop] Skipping ${language} - tool not installed`);
      } else {
        console.log(`[CodeCop] Skipping ${language} - spawn error: ${err}`);
      }
      continue;
    }

    // Parse output
    const parsed = parser(output.stdout);
    if (parsed.errors === 0 && parsed.warnings === 0 && output.stdout.trim() === "") {
      // Could be a parse failure on empty output, but also could be clean — still valid
    }

    console.log(`[CodeCop] ${language} lint completed: ${parsed.errors} errors, ${parsed.warnings} warnings`);

    results.push({
      language,
      linter: command,
      errors: parsed.errors,
      warnings: parsed.warnings,
      details: parsed.details || [],
    });

    totalErrors += parsed.errors;
    totalWarnings += parsed.warnings;
  }

  return { results, totalErrors, totalWarnings };
};
