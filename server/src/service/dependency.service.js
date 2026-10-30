import fs from "fs";
import path from "path";
import {createRequire } from "module";

const require = createRequire(import.meta.url);

const DEPENDENCY_FILES = [
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "Pipfile",
  "Pipfile.lock",
  "go.mod",
  "Cargo.toml",
  "Gemfile",
  "composer.json",
];
export const findDependencyFiles = (repoPath) => {
  const foundFiles = [];

  const scanDirectory = (directory) => {
    if (!fs.existsSync(directory)) {
      return;
    }

    const entries = fs.readdirSync(directory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
  const fullPath = path.join(directory, entry.name);

  if (entry.isDirectory()) {
    if (
  entry.name === "node_modules" ||
  entry.name === ".git" ||
  entry.name === ".next" ||
  entry.name === "temp" ||
  entry.name === "out" ||
  entry.name === "dist" ||
  entry.name === "build"
) {
  continue;
}

    scanDirectory(fullPath);
    continue;
  }

  if (DEPENDENCY_FILES.includes(entry.name)) {
    foundFiles.push(path.relative(repoPath, fullPath));
  }
}
  };

  scanDirectory(repoPath);

  return foundFiles;
};
export const readNodeDependencies = (repoPath) => {
  const packageJsonPaths = [
    path.join(repoPath, "package.json"),
    path.join(repoPath, "client", "package.json"),
    path.join(repoPath, "server", "package.json"),
  ];

  const mergedDependencies = {
    exists: false,
    dependencies: {},
    devDependencies: {},
    optionalDependencies: {},
    peerDependencies: {},
  };

  for (const packageJsonPath of packageJsonPaths) {
    if (!fs.existsSync(packageJsonPath)) {
      continue;
    }

    try {
      const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
      );

      mergedDependencies.exists = true;

      Object.assign(
        mergedDependencies.dependencies,
        packageJson.dependencies || {}
      );

      Object.assign(
        mergedDependencies.devDependencies,
        packageJson.devDependencies || {}
      );

      Object.assign(
        mergedDependencies.optionalDependencies,
        packageJson.optionalDependencies || {}
      );

      Object.assign(
        mergedDependencies.peerDependencies,
        packageJson.peerDependencies || {}
      );
    } catch (error) {
      console.warn(
        `[Dependency] Invalid package.json: ${packageJsonPath}`
      );
    }
  }

  return mergedDependencies;
};
export const findUninstalledDependencies = (repoPath, nodeDependencies) => {
  const issues = [];
  const packageJsonPaths = [];

  const scanDirectory = (directory) => {
    if (!fs.existsSync(directory)) {
      return;
    }

    const entries = fs.readdirSync(directory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === ".next" ||
          entry.name === "temp" ||
          entry.name === "out" ||
          entry.name === "dist" ||
          entry.name === "build"
        ) {
          continue;
        }

        scanDirectory(fullPath);
        continue;
      }

      if (entry.name === "package.json") {
        packageJsonPaths.push(fullPath);
      }
    }
  };

  scanDirectory(repoPath);

  for (const packageJsonPath of packageJsonPaths) {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
      );

      const packageDirectory = path.dirname(packageJsonPath);

      const dependencyGroups = [
        ["dependencies", packageJson.dependencies || {}],
        ["devDependencies", packageJson.devDependencies || {}],
        ["optionalDependencies", packageJson.optionalDependencies || {}],
      ];

      for (const [dependencyType, dependencies] of dependencyGroups) {
        for (const packageName of Object.keys(dependencies)) {
          try {
  let currentDirectory = packageDirectory;
let packageInstalled = false;

while (true) {
  const packagePath = path.join(
    currentDirectory,
    "node_modules",
    packageName
  );

  if (fs.existsSync(packagePath)) {
    packageInstalled = true;
    break;
  }

  const parentDirectory = path.dirname(currentDirectory);

  if (
    parentDirectory === currentDirectory ||
    !parentDirectory.startsWith(repoPath)
  ) {
    break;
  }

  currentDirectory = parentDirectory;
}

if (!packageInstalled) {
  throw new Error("Package not found");
}
} catch {
            issues.push({
        category: "Uninstalled Dependency",
        package: packageName,
        packageFile: path.relative(repoPath, packageJsonPath),
        dependencyType,
        severity: "warning",
        explanation:
          `The dependency "${packageName}" is declared in ${path.relative(
            repoPath,
            packageJsonPath
          )} but could not be resolved from that package.`,
        probableRootCause:
          "The dependency is declared in package.json but is not installed or cannot be resolved from the package's environment.",
        suggestedSolution:
          `Run "npm install" in ${
            path.dirname(path.relative(repoPath, packageJsonPath)) ||
            "the project root"
          } or install "${packageName}" in that package.`,
      });
    }
  }
}
    } catch (error) {
      console.warn(
        `[Dependency] Could not read ${packageJsonPath}:`,
        error.message
      );
    }
  }
  console.log(
  "[DEBUG] packageFile values:",
  issues.map((issue) => issue.packageFile)
);

  return issues;

};

export const analyzeDependencyVersions = (nodeDependencies) => {
  const issues = [];

  const dependencyGroups = [
    ["dependencies", nodeDependencies.dependencies || {}],
    ["devDependencies", nodeDependencies.devDependencies || {}],
    ["optionalDependencies", nodeDependencies.optionalDependencies || {}],
    ["peerDependencies", nodeDependencies.peerDependencies || {}],
  ];

  for (const [dependencyType, dependencies] of dependencyGroups) {
    for (const [packageName, declaredVersion] of Object.entries(dependencies)) {
      if (!declaredVersion || typeof declaredVersion !== "string") {
        continue;
      }

      const version = declaredVersion.trim();

      if (
        version === "*" ||
        version.toLowerCase() === "latest" ||
        version.includes("file:") ||
        version.includes("git+") ||
        version.includes("github:")
      ) {
        issues.push({
          category: "Dependency Version",
          package: packageName,
          declaredVersion: version,
          dependencyType,
          severity: "warning",
          explanation:
            `The dependency "${packageName}" uses a non-standard or unrestricted version declaration.`,
          probableRootCause:
            "The project may not be using a reproducible dependency version.",
          suggestedSolution:
            `Use a specific compatible version range for "${packageName}".`,
        });
      }
    }
  }

  return issues;
};
export const findNearestPackageJson = (repoPath, filePath) => {
  let currentDirectory = path.dirname(filePath);

  while (true) {
    const packageJsonPath = path.join(currentDirectory, "package.json");

    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath;
    }

    const parentDirectory = path.dirname(currentDirectory);

    if (
      parentDirectory === currentDirectory ||
      !parentDirectory.startsWith(repoPath)
    ) {
      break;
    }

    currentDirectory = parentDirectory;
  }

  const rootPackageJson = path.join(repoPath, "package.json");

  return fs.existsSync(rootPackageJson) ? rootPackageJson : null;
};
export const findNodeImports = (repoPath) => {
  const imports = [];

  const scanDirectory = (directory) => {
    if (!fs.existsSync(directory)) {
      return;
    }

    const entries = fs.readdirSync(directory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === ".next" ||
          entry.name === "temp" ||
          entry.name === "out" ||
          entry.name === "dist" ||
          entry.name === "build"
        ) {
          continue;
        }

        scanDirectory(fullPath);
        continue;
      }

      if (!/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(entry.name)) {
        continue;
      }

      try {
        const content = fs.readFileSync(fullPath, "utf8");

        const activeContent = content
          .split("\n")
          .filter((line) => !line.trim().startsWith("//"))
          .join("\n");

        const importRegex =
  /(?:import\s+(?:[\s\S]*?\s+from\s+)?|require\s*\(\s*)["']([^"']+)["']/g;

        let match;

       while ((match = importRegex.exec(activeContent)) !== null) {
  const importedPackage = match[1];

  // Ignore template-variable imports such as ${tsParserUrl}.
  if (
    importedPackage.startsWith("${") &&
    importedPackage.endsWith("}")
  ) {
    continue;
  }

  if (
    !importedPackage.startsWith(".") &&
    !importedPackage.startsWith("/") &&
    !importedPackage.startsWith("@theme/")
  ) {
            const packageName = importedPackage.startsWith("@")
              ? importedPackage.split("/").slice(0, 2).join("/")
              : importedPackage.split("/")[0];

            imports.push({
              package: packageName,
              file: path.relative(repoPath, fullPath),
            });
          }
        }
      } catch (error) {
        console.warn(
          `[Dependency] Could not read ${fullPath}:`,
          error.message
        );
      }
    }
  };

  scanDirectory(repoPath);
  return imports;
};