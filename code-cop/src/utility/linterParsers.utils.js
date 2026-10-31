/**
 * Parse ruff JSON output.
 * E/F prefix codes = error, everything else = warning.
 */
export const parseRuff = (stdout) => {
  try {
    const issues = JSON.parse(stdout);
    let errors = 0;
    let warnings = 0;
    const details = [];
    for (const issue of issues) {
      const code = issue.code || "";
      const severity = code.startsWith("E") || code.startsWith("F") ? "error" : "warning";
      if (severity === "error") errors++;
      else warnings++;
      details.push({
        file: issue.filename || "",
        line: issue.location?.row || 0,
        column: issue.location?.column || 0,
        severity,
        message: issue.message || "",
        rule: code,
      });
    }
    return { errors, warnings, details };
  } catch {
    return { errors: 0, warnings: 0, details: [] };
  }
};

/**
 * Parse golangci-lint JSON output.
 * Checks .Severity — "error" counts as error, everything else as warning.
 */
export const parseGolangciLint = (stdout) => {
  try {
    const data = JSON.parse(stdout);
    const issues = data.Issues || [];
    let errors = 0;
    let warnings = 0;
    const details = [];
    for (const issue of issues) {
      const severity = issue.Severity === "error" ? "error" : "warning";
      if (severity === "error") errors++;
      else warnings++;
      details.push({
        file: issue.Pos?.Filename || "",
        line: issue.Pos?.Line || 0,
        column: issue.Pos?.Column || 0,
        severity,
        message: issue.Text || "",
        rule: issue.FromLinter || "",
      });
    }
    return { errors, warnings, details };
  } catch {
    return { errors: 0, warnings: 0, details: [] };
  }
};

/**
 * Parse `dart analyze --format machine` output.
 * Lines: SEVERITY|TYPE|CODE|FILE|LINE|COL|MSG
 */
/**
 * Parse `tsc --noEmit --pretty false` output.
 * Lines: file(line,col): error TSxxxx: message
 */
export const parseTsc = (stdout) => {
  try {
    let errors = 0;
    let warnings = 0;
    const details = [];
    const lines = stdout.split("\n").filter((l) => l.trim().length > 0);
    for (const line of lines) {
      // Format: path/file.ts(10,5): error TS2345: Argument of type ...
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)$/);
      if (!match) continue;
      const severity = match[4] === "error" ? "error" : "warning";
      if (severity === "error") errors++;
      else warnings++;
      details.push({
        file: match[1],
        line: parseInt(match[2], 10) || 0,
        column: parseInt(match[3], 10) || 0,
        severity,
        message: match[6],
        rule: match[5],
      });
    }
    return { errors, warnings, details };
  } catch {
    return { errors: 0, warnings: 0, details: [] };
  }
};

export const parseDartAnalyze = (stdout) => {
  try {
    let errors = 0;
    let warnings = 0;
    const details = [];
    const lines = stdout.split("\n").filter((l) => l.includes("|"));
    for (const line of lines) {
      const parts = line.split("|");
      const rawSeverity = (parts[0] || "").trim();
      const severity = rawSeverity === "ERROR" ? "error" : "warning";
      if (severity === "error") errors++;
      else warnings++;
      details.push({
        file: (parts[3] || "").trim(),
        line: parseInt(parts[4], 10) || 0,
        column: parseInt(parts[5], 10) || 0,
        severity,
        message: (parts[6] || "").trim(),
        rule: (parts[2] || "").trim(),
      });
    }
    return { errors, warnings, details };
  } catch {
    return { errors: 0, warnings: 0, details: [] };
  }
};
