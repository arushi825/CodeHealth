import fs from "fs";
import path from "path";

const SKIP_DIRS = new Set(["node_modules", ".git", "vendor", "build", "dist", ".next", "__pycache__", ".dart_tool"]);

const EXT_TO_LANGUAGE = {
  ".js": "JavaScript", ".jsx": "JavaScript",
  ".ts": "TypeScript", ".tsx": "TypeScript",
  ".py": "Python",
  ".dart": "Dart",
  ".go": "Go",
  ".java": "Java",
  ".rs": "Rust",
  ".rb": "Ruby",
  ".php": "PHP",
  ".swift": "Swift",
  ".kt": "Kotlin",
  ".cs": "C#",
  ".c": "C/C++", ".cpp": "C/C++", ".h": "C/C++",
};

const scanLanguages = (dir, depth = 0, maxDepth = 4) => {
  const languages = new Set();
  if (depth > maxDepth) return languages;
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const fullPath = path.join(dir, entry);
      const stat = fs.lstatSync(fullPath);
      if (stat.isFile()) {
        const ext = path.extname(entry).toLowerCase();
        if (EXT_TO_LANGUAGE[ext]) languages.add(EXT_TO_LANGUAGE[ext]);
      } else if (stat.isDirectory()) {
        for (const lang of scanLanguages(fullPath, depth + 1, maxDepth)) {
          languages.add(lang);
        }
      }
    }
  } catch {}
  return languages;
};

const readJsonSafe = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
};

const readFileSafe = (filePath) => {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
};

const fileExists = (filePath) => fs.existsSync(filePath);

const detectFrameworks = (repoPath) => {
  const frameworks = [];

  // JS/TS frameworks from package.json
  const pkg = readJsonSafe(path.join(repoPath, "package.json"));
  if (pkg) {
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (allDeps["next"]) frameworks.push("Next.js");
    if (allDeps["react"]) frameworks.push("React");
    if (allDeps["vue"]) frameworks.push("Vue");
    if (allDeps["@angular/core"]) frameworks.push("Angular");
    if (allDeps["express"]) frameworks.push("Express");
    if (allDeps["@nestjs/core"]) frameworks.push("NestJS");
    if (allDeps["svelte"]) frameworks.push("Svelte");
  }

  // Python frameworks
  const reqTxt = readFileSafe(path.join(repoPath, "requirements.txt"));
  const pipfile = readFileSafe(path.join(repoPath, "Pipfile"));
  const pyDeps = reqTxt + pipfile;
  if (/django/i.test(pyDeps)) frameworks.push("Django");
  if (/flask/i.test(pyDeps)) frameworks.push("Flask");
  if (/fastapi/i.test(pyDeps)) frameworks.push("FastAPI");

  // Flutter/Dart
  if (fileExists(path.join(repoPath, "pubspec.yaml"))) {
    const pubspec = readFileSafe(path.join(repoPath, "pubspec.yaml"));
    if (/flutter/i.test(pubspec)) frameworks.push("Flutter");
  }

  // Ruby
  const gemfile = readFileSafe(path.join(repoPath, "Gemfile"));
  if (/rails/i.test(gemfile)) frameworks.push("Rails");

  // PHP
  const composer = readJsonSafe(path.join(repoPath, "composer.json"));
  if (composer) {
    const allDeps = { ...composer.require, ...composer["require-dev"] };
    if (allDeps["laravel/framework"]) frameworks.push("Laravel");
  }

  // Go
  const goMod = readFileSafe(path.join(repoPath, "go.mod"));
  if (/gin-gonic/i.test(goMod)) frameworks.push("Gin");
  if (/labstack\/echo/i.test(goMod)) frameworks.push("Echo");
  if (/gofiber\/fiber/i.test(goMod)) frameworks.push("Fiber");

  // Java/Kotlin
  const pomXml = readFileSafe(path.join(repoPath, "pom.xml"));
  const buildGradle = readFileSafe(path.join(repoPath, "build.gradle"));
  if (/spring/i.test(pomXml + buildGradle)) frameworks.push("Spring");

  return frameworks;
};

const detectPackageManager = (repoPath) => {
  const checks = [
    ["package-lock.json", "npm"],
    ["yarn.lock", "yarn"],
    ["pnpm-lock.yaml", "pnpm"],
    ["requirements.txt", "pip"],
    ["Pipfile", "pipenv"],
    ["go.sum", "go modules"],
    ["Cargo.lock", "cargo"],
    ["pubspec.lock", "pub"],
    ["Gemfile.lock", "bundler"],
    ["composer.lock", "composer"],
  ];
  for (const [file, manager] of checks) {
    if (fileExists(path.join(repoPath, file))) return manager;
  }
  return null;
};

const detectBuildTools = (repoPath) => {
  const tools = [];
  const checks = [
    [/^webpack\.config\./,  "webpack"],
    [/^vite\.config\./,     "vite"],
    [/^tsconfig\.json$/,    "tsc"],
    [/^Makefile$/,          "make"],
    [/^CMakeLists\.txt$/,   "cmake"],
    [/^build\.gradle$/,     "gradle"],
    [/^pom\.xml$/,          "maven"],
    [/^Cargo\.toml$/,       "cargo"],
  ];
  try {
    const entries = fs.readdirSync(repoPath);
    for (const entry of entries) {
      for (const [pattern, tool] of checks) {
        if (pattern.test(entry) && !tools.includes(tool)) {
          tools.push(tool);
        }
      }
    }
  } catch {}
  return tools;
};

const detectDocker = (repoPath) => {
  return fileExists(path.join(repoPath, "Dockerfile"))
    || fileExists(path.join(repoPath, "docker-compose.yml"))
    || fileExists(path.join(repoPath, "compose.yaml"));
};

const detectCI = (repoPath) => {
  return fileExists(path.join(repoPath, ".github", "workflows"))
    || fileExists(path.join(repoPath, ".gitlab-ci.yml"))
    || fileExists(path.join(repoPath, "Jenkinsfile"))
    || fileExists(path.join(repoPath, ".circleci"))
    || fileExists(path.join(repoPath, ".travis.yml"));
};

const detectTesting = (repoPath) => {
  const testDirs = ["test", "tests", "__tests__", "spec"];
  for (const dir of testDirs) {
    if (fileExists(path.join(repoPath, dir))) return true;
  }

  const testConfigs = ["jest.config.js", "jest.config.ts", "jest.config.mjs", "pytest.ini", "phpunit.xml", ".rspec", "vitest.config.ts", "vitest.config.js"];
  for (const cfg of testConfigs) {
    if (fileExists(path.join(repoPath, cfg))) return true;
  }

  // Check package.json for non-default test script
  const pkg = readJsonSafe(path.join(repoPath, "package.json"));
  if (pkg?.scripts?.test && !pkg.scripts.test.includes("no test specified")) {
    return true;
  }

  return false;
};

export const detectTechStack = (repoPath) => {
  console.log(`[TechStack] Detecting tech stack...`);

  const languages = [...scanLanguages(repoPath)];
  const frameworks = detectFrameworks(repoPath);
  const packageManager = detectPackageManager(repoPath);
  const buildTools = detectBuildTools(repoPath);
  const hasDocker = detectDocker(repoPath);
  const hasCI = detectCI(repoPath);
  const hasTesting = detectTesting(repoPath);
  

  console.log(`[TechStack] Languages: ${languages.join(", ") || "none"}`);
  console.log(`[TechStack] Frameworks: ${frameworks.join(", ") || "none"}`);
  console.log(`[TechStack] Package manager: ${packageManager || "none"}`);
  console.log(`[TechStack] Build tools: ${buildTools.join(", ") || "none"}`);
  console.log(`[TechStack] Docker: ${hasDocker}, CI: ${hasCI}, Testing: ${hasTesting}`);

  return { languages, frameworks, packageManager, buildTools, hasDocker, hasCI, hasTesting };
};
