import fs from "fs";
import path from "path";
import { runLint } from "./lint.service.js";
import { runMultiLint } from "./lintRunner.service.js";
import { detectTechStack } from "./techStack.service.js";
import { generateSuggestions } from "./suggestions.service.js";
import { getRepoSize, getRepoStats } from "../utility/spawnWithTimeout.utils.js";

import {
  findDependencyFiles,
  readNodeDependencies,
  findNodeImports,
  analyzeDependencyVersions,
  findUninstalledDependencies,
  findNearestPackageJson,
} from "./dependency.service.js";

const MAX_REPO_SIZE = 25 * 1024 * 1024; // 25MB

const SKIP_DIRS = new Set(["node_modules", ".git", "vendor", "build", "dist", ".next", "__pycache__", ".dart_tool"]);

// Matches hardcoded secret assignments like: API_KEY = "value" or apiKey: "value"
// Does NOT match references like process.env.API_KEY or import.meta.env.SECRET_KEY
const SECRET_KEYWORDS = ["API", "SECRET", "PRIVATE", "ACCESS", "AWS"];
const SECRET_PATTERNS = SECRET_KEYWORDS.map(
  // key = "value" or key: "value" — but NOT process.env.KEY or import.meta.env.KEY
  (prefix) => new RegExp(`(?<!process\\.env\\.)(?<!import\\.meta\\.env\\.)(?<!env\\()(?<!getenv\\()${prefix}_(?:KEY|TOKEN|SECRET)\\s*[:=]\\s*["'\`][^"'\`]{8,}`, "i")
).concat(
  // password = "actual_value" (not empty, not a variable reference)
  new RegExp("pass" + "word\\s*[:=]\\s*[\"'`][^\"'`]{8,}", "i")
);

// Skip files that are only defining env var names, not values
const SECRET_SKIP_EXTENSIONS = new Set([".d.ts", ".d.mts"]);

const SECRET_TEST_FILE_PATTERNS = [
  /\.cy\.(js|jsx|ts|tsx)$/i,
  /\.spec\.(js|jsx|ts|tsx)$/i,
  /\.test\.(js|jsx|ts|tsx)$/i,
  /\.fixture\.(js|jsx|ts|tsx)$/i,
];

const isLikelyTestFile = (fileName) => {
  return SECRET_TEST_FILE_PATTERNS.some((pattern) =>
    pattern.test(fileName)
  );
};

const isBinary = (filePath) => {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 1_000_000) return true;
    const buffer = Buffer.alloc(512);
    const fd = fs.openSync(filePath, "r");
    const bytesRead = fs.readSync(fd, buffer, 0, 512, 0);
    fs.closeSync(fd);
    for (let i = 0; i < bytesRead; i++) {
      if (buffer[i] === 0) return true;
    }
    return false;
  } catch {
    return true;
  }
};

const scanForSecrets = (dir, depth = 0, maxDepth = 4) => {
  const found = [];
  if (depth > maxDepth) return found;
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const fullPath = path.join(dir, entry);
      const stat = fs.lstatSync(fullPath);
      if (stat.isFile()) {
        if (isBinary(fullPath)) continue;
        const lower = entry.toLowerCase();
        // Skip documentation and example files
        if (lower === "readme.md" || lower === "readme" || lower === "readme.txt") continue;
        if (isLikelyTestFile(entry)) continue;
        if (lower.includes(".env.example") || lower.includes(".env.sample") || lower.includes("sample.env") || lower.includes("example.env")) continue;
        // Skip .env files (config, not hardcoded in code)
        if (lower.startsWith(".env")) continue;
        // Skip type declaration files
        const ext = path.extname(lower);
        if (SECRET_SKIP_EXTENSIONS.has(ext) || lower.endsWith(".d.ts") || lower.endsWith(".d.mts")) continue;
        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          for (const pattern of SECRET_PATTERNS) {
            if (pattern.test(content)) {
              found.push(entry);
              break;
            }
          }
        } catch {}
      } else if (stat.isDirectory()) {
        found.push(...scanForSecrets(fullPath, depth + 1, maxDepth));
      }
    }
  } catch {}
  return found;
};

export const evaluateProject = async (repoPath, options = {}) => {
  console.log("[TEST] evaluateProject is running");

  // Repo size guard
if (!options.isLocal) {
  const repoSize = getRepoSize(repoPath);

  if (repoSize > MAX_REPO_SIZE) {
    throw new Error("Repository too large to analyze");
  }
}

  let score = 100;
  let issues = { critical: [], warnings: [], good: [] };

  // Detect tech stack
  const techStack = detectTechStack(repoPath);

  // Detect dependencies
  console.log(`[Evaluate] Checking project dependencies...`);
  const dependencyFiles = findDependencyFiles(repoPath);
  const nodeDependencies = readNodeDependencies(repoPath);
  const dependencyVersionIssues =
  analyzeDependencyVersions(nodeDependencies);
 

console.log(
  `[Evaluate] Dependency version issues: ${dependencyVersionIssues.length}`
);
  

  console.log(`[Evaluate] Dependency files:`, dependencyFiles);
  const nodeImports = findNodeImports(repoPath);
  console.log(
  `[Evaluate] Temp imports detected: ${
    nodeImports.filter((item) =>
      item.file.startsWith(`server${path.sep}temp${path.sep}`)
    ).length
  }`
);
  
  const declaredDependencies = new Set([
  ...Object.keys(nodeDependencies.dependencies || {}),
  ...Object.keys(nodeDependencies.devDependencies || {}),
  ...Object.keys(nodeDependencies.optionalDependencies || {}),
  ...Object.keys(nodeDependencies.peerDependencies || {}),
]);
const builtinModules = new Set([
  "assert",
  "buffer",
  "child_process",
  "cluster",
  "console",
  "constants",
  "crypto",
  "dgram",
  "diagnostics_channel",
  "dns",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "module",
  "net",
  "os",
  "path",
  "perf_hooks",
  "process",
  "punycode",
  "querystring",
  "readline",
  "repl",
  "stream",
  "string_decoder",
  "sys",
  "timers",
  "tls",
  "trace_events",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "wasi",
  "worker_threads",
  "zlib",
]);
const isBuiltinModule = (packageName) => {
  if (builtinModules.has(packageName)) {
    return true;
  }

  if (packageName.startsWith("node:")) {
    return builtinModules.has(packageName.slice(5));
  }

   if (packageName === "vscode") {
    return true;
  }

  return false;
};
const packageAliases = {
  "@docusaurus/Link": "@docusaurus/core",
  "@docusaurus/useDocusaurusContext": "@docusaurus/core",
  "@docusaurus/useBaseUrl": "@docusaurus/core",
};
const missingDependencyMap = new Map();
const missingDependencies = [];
for (const imported of nodeImports) {
  const packageName = imported.package;

  // Ignore Node.js built-in modules
  if (isBuiltinModule(packageName)) {
    continue;
  }

  // Find the package.json belonging to the file that imported this package.
  const importedFilePath = path.join(repoPath, imported.file);
  const packageJsonPath = findNearestPackageJson(
    repoPath,
    importedFilePath
  );

  let localDependencies = new Set();

  if (packageJsonPath && fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
      );

      localDependencies = new Set([
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.devDependencies || {}),
        ...Object.keys(packageJson.optionalDependencies || {}),
        ...Object.keys(packageJson.peerDependencies || {}),
      ]);
    } catch (error) {
      console.warn(
        `[Dependency] Could not read ${packageJsonPath}:`,
        error.message
      );
    }
  }

  // Check whether the imported package is declared in the local package.
  const dependencyName =
    packageAliases[packageName] || packageName;

  if (!localDependencies.has(dependencyName)) {
    if (!missingDependencyMap.has(dependencyName)) {
      missingDependencyMap.set(dependencyName, {
        category: "Missing Dependency",
        package: packageName,
        files: [],
        severity: "warning",
        explanation: `The package "${packageName}" is imported by the source code but is not provided by a declared dependency.`,
        probableRootCause:
          "The dependency may have been used without being added to the package's dependency manifest.",
        suggestedSolution:
          `Add "${dependencyName}" to the appropriate dependency section of package.json.`,
      });
    }

    const finding = missingDependencyMap.get(dependencyName);

    if (!finding.files.includes(imported.file)) {
      finding.files.push(imported.file);
    }
  }
}
for (const imported of nodeImports) {
  // existing dependency checking
}

missingDependencies.push(...missingDependencyMap.values());

console.log(
  `[Evaluate] Missing dependencies: ${missingDependencies.length}`
);

console.log(
  `[Evaluate] Missing dependencies: ${missingDependencies.length}`
);

if (missingDependencies.length > 0) {
  console.log(
    "[Evaluate] Missing dependency details:",
    missingDependencies
  );
}
console.log(`[Evaluate] Node imports:`, nodeImports);

  // Check README
  console.log(`[Evaluate] Checking README...`);
  if (fs.existsSync(path.join(repoPath, "README.md"))) {
    issues.good.push("README file present");
  } else {
    score -= 10;
    issues.warnings.push("Missing README file");
  }

  // Check .gitignore
  console.log(`[Evaluate] Checking .gitignore...`);
  if (fs.existsSync(path.join(repoPath, ".gitignore"))) {
    issues.good.push(".gitignore present");
  } else {
    score -= 5;
    issues.warnings.push("Missing .gitignore");
  }

  // Structure check based on detected tech stack
  console.log(`[Evaluate] Checking project structure...`);
  if (techStack.languages.length > 0) {
    // ...
  }

  // Structure check based on detected tech stack
  console.log(`[Evaluate] Checking project structure...`);
  if (techStack.languages.length > 0) {
    const langLabel = techStack.frameworks.length > 0
      ? `${techStack.frameworks[0]} project detected`
      : `${techStack.languages[0]} project detected`;
    issues.good.push(langLabel);
    console.log(`[Evaluate] ${langLabel}`);
  }

  // Linting (JS/TS via ESLint)
  let lintPenalty = 0;
  const lintResults = [];
  const hasJs = techStack.languages.includes("JavaScript");
  const hasTs = techStack.languages.includes("TypeScript");
  if (hasJs || hasTs) {
    console.log(`[Lint] Running JavaScript linter (ESLint)...`);
    try {
      const { errors, warnings, details, skipped } = await runLint(repoPath);
      if (skipped) {
        if (hasTs && !hasJs) {
          // Pure TS repo — ESLint without TS parser can't lint these
          console.log(`[Lint] TypeScript-only repo — ESLint requires typescript-eslint for TS files`);
        } else {
          issues.warnings.push("No JavaScript files found — linting skipped");
        }
      } else {
        console.log(`[Lint] Results — errors: ${errors}, warnings: ${warnings}`);
        lintPenalty += errors * 2 + warnings * 1;
        if (errors > 0) issues.critical.push(`${errors} JavaScript lint errors found`);
        if (warnings > 0) issues.warnings.push(`${warnings} JavaScript lint warnings`);
        if (errors === 0 && warnings === 0) issues.good.push("No JavaScript lint issues found");

        lintResults.push({
          language: "JavaScript",
          linter: "eslint",
          errors,
          warnings,
          details: details || [],
        });
      }
    } catch (err) {
      console.error(`[Lint] Failed: ${err.message || err}`);
      issues.warnings.push("JavaScript linting failed");
    }
  } else {
    console.log(`[Lint] No JS/TS detected, skipping ESLint`);
  }

  // Multi-language linting (Python, Go, Dart)
  try {
    const multiLint = await runMultiLint(techStack.languages, repoPath);
    lintResults.push(...multiLint.results);
    lintPenalty += multiLint.totalErrors * 2 + multiLint.totalWarnings * 1;

    for (const result of multiLint.results) {
      if (result.errors > 0) {
        issues.critical.push(`${result.errors} ${result.language} lint errors (${result.linter})`);
      }
      if (result.warnings > 0) {
        issues.warnings.push(`${result.warnings} ${result.language} lint warnings (${result.linter})`);
      }
      if (result.errors === 0 && result.warnings === 0) {
        issues.good.push(`No ${result.language} lint issues`);
      }
    }
  } catch (err) {
    console.error(`[CodeCop] Multi-lint failed: ${err.message || err}`);
  }

  // Cap total lint penalty at 50
  lintPenalty = Math.min(lintPenalty, 50);
  score -= lintPenalty;

  // Secret detection (recursive)
  console.log(`[Evaluate] Scanning for secrets...`);
  const secretFiles = scanForSecrets(repoPath);
  if (secretFiles.length > 0) {
    score -= secretFiles.length * 20;
    for (const file of secretFiles) {
      issues.critical.push(`Possible secret/key in ${file}`);
    }
  }
  console.log(`[Evaluate] Secret scan done — ${secretFiles.length} issue(s) found`);

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  // Generate suggestions
  const suggestions = generateSuggestions(repoPath, techStack, issues);

  // Repo stats
  console.log(`[Evaluate] Collecting repo stats...`);
  const repoStats = getRepoStats(repoPath);
  console.log(`[Evaluate] Stats — files: ${repoStats.totalFiles}, lines: ${repoStats.totalLines}, size: ${repoStats.totalSize}`);

  console.log(`[Evaluate] Final score: ${score}`);
  return {
    score,
    status: score > 80 ? "Clean" : score > 50 ? "Needs Improvement" : "Risky Code",
    techStack,
    issues,
    suggestions,
    lintResults,
    repoStats,
    missingDependencies,
    dependencyVersionIssues,
  };
};
