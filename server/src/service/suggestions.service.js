import fs from "fs";
import path from "path";

export const generateSuggestions = (repoPath, techStack, issues) => {
  const suggestions = [];

  if (!fs.existsSync(path.join(repoPath, "README.md"))) {
    suggestions.push("Add a README.md to describe your project");
  }

  if (!fs.existsSync(path.join(repoPath, ".gitignore"))) {
    suggestions.push("Add a .gitignore to avoid committing unnecessary files");
  }

  if (!fs.existsSync(path.join(repoPath, "LICENSE"))) {
    suggestions.push("Consider adding a LICENSE file to clarify usage rights");
  }

  if (!techStack.hasCI) {
    suggestions.push("Add a CI/CD pipeline (e.g., GitHub Actions)");
  }

  if (!techStack.hasDocker) {
    suggestions.push("Consider adding a Dockerfile for consistent environments");
  }

  if (!techStack.hasTesting) {
    suggestions.push("Add automated tests to improve code reliability");
  }

  // Check if .gitignore mentions .env but no .env.example exists
  try {
    const gitignore = fs.readFileSync(path.join(repoPath, ".gitignore"), "utf-8");
    if (/\.env/m.test(gitignore) && !fs.existsSync(path.join(repoPath, ".env.example"))) {
      suggestions.push("Add a .env.example to document required environment variables");
    }
  } catch {}

  if (!fs.existsSync(path.join(repoPath, ".editorconfig"))) {
    suggestions.push("Consider adding an .editorconfig for consistent formatting");
  }

  if (issues.critical.some((i) => /secret|API key/i.test(i))) {
    suggestions.push("Remove hardcoded secrets and use environment variables instead");
  }

  const hasLintErrors = issues.critical.some((i) => /lint error/i.test(i));
const hasLintWarnings = issues.warnings.some((i) => /lint warning/i.test(i));

if (hasLintErrors) {
  suggestions.push("Address lint errors to improve code quality");
} else if (hasLintWarnings) {
  suggestions.push("Review lint warnings to improve code quality");
}

  return suggestions.slice(0, 8);
};
