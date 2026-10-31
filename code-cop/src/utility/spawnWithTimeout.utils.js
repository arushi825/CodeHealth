import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const SKIP_DIRS = new Set(["node_modules", ".git", "vendor", "build", "dist"]);

/**
 * Spawn a process with a timeout. Resolves with { stdout, stderr, exitCode }.
 * Rejects with "TIMEOUT" if exceeded, "NOT_INSTALLED" on ENOENT.
 * Does NOT reject on non-zero exit codes.
 */
export const spawnWithTimeout = (command, args, { cwd, timeout = 30000 } = {}) => {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let killed = false;

    const child = spawn(command, args, { cwd });

    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGKILL");
      reject("TIMEOUT");
    }, timeout);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      if (err.code === "ENOENT") {
        reject("NOT_INSTALLED");
      } else {
        reject(err);
      }
    });

    child.on("close", (exitCode) => {
      clearTimeout(timer);
      if (!killed) {
        resolve({ stdout, stderr, exitCode });
      }
    });
  });
};

/**
 * Check if a command-line tool is installed via `which`.
 */
export const isToolInstalled = async (command) => {
  try {
    const { exitCode } = await spawnWithTimeout("which", [command], { timeout: 5000 });
    return exitCode === 0;
  } catch {
    return false;
  }
};

/**
 * Recursively sum file sizes in a directory, skipping common non-source dirs.
 */
export const getRepoSize = (dir) => {
  let total = 0;
  try {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const fullPath = path.join(dir, entry);
      const stat = fs.lstatSync(fullPath);
      if (stat.isFile()) {
        total += stat.size;
      } else if (stat.isDirectory()) {
        total += getRepoSize(fullPath);
      }
    }
  } catch {
    // ignore permission errors etc.
  }
  return total;
};

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".zip", ".tar", ".gz", ".bz2", ".7z",
  ".pdf", ".exe", ".dll", ".so", ".dylib",
  ".mp3", ".mp4", ".avi", ".mov", ".wav",
  ".lock",
]);

/**
 * Recursively collect repo stats: total files, total lines of code, and repo size.
 */
export const getRepoStats = (dir) => {
  let totalFiles = 0;
  let totalLines = 0;
  let totalSize = 0;

  const walk = (currentDir) => {
    try {
      const entries = fs.readdirSync(currentDir);
      for (const entry of entries) {
        if (SKIP_DIRS.has(entry)) continue;
        const fullPath = path.join(currentDir, entry);
        const stat = fs.lstatSync(fullPath);
        if (stat.isFile()) {
          totalFiles++;
          totalSize += stat.size;
          const ext = path.extname(entry).toLowerCase();
          if (!BINARY_EXTENSIONS.has(ext) && stat.size < 1_000_000) {
            try {
              const content = fs.readFileSync(fullPath, "utf-8");
              totalLines += content.split("\n").length;
            } catch {
              // skip unreadable files
            }
          }
        } else if (stat.isDirectory()) {
          walk(fullPath);
        }
      }
    } catch {
      // ignore permission errors
    }
  };

  walk(dir);
  return { totalFiles, totalLines, totalSize };
};
