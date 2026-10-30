"use client";

import { useState } from "react";
import { LintResult, LintIssue } from "../lib/types";

interface LintResultsTableProps {
  lintResults: LintResult[];
}

function generateMarkdown(lintResults: LintResult[]): string {
  const lines: string[] = [
    "# CodeCop Lint Report",
    "",
    `> Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    "",
  ];

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of lintResults) {
    totalErrors += result.errors;
    totalWarnings += result.warnings;
  }

  lines.push("## Summary", "");
  lines.push(`| Language | Linter | Errors | Warnings |`);
  lines.push(`|----------|--------|--------|----------|`);
  for (const result of lintResults) {
    lines.push(
      `| ${result.language} | ${result.linter} | ${result.errors} | ${result.warnings} |`
    );
  }
  lines.push("");
  lines.push(`**Total: ${totalErrors} errors, ${totalWarnings} warnings**`);
  lines.push("");

  for (const result of lintResults) {
    if (!result.details || result.details.length === 0) continue;

    lines.push(`---`, "");
    lines.push(`## ${result.language} (${result.linter})`, "");

    const errors = result.details.filter((d) => d.severity === "error");
    const warnings = result.details.filter((d) => d.severity === "warning");

    if (errors.length > 0) {
      lines.push(`### Errors (${errors.length})`, "");
      for (const issue of errors) {
        const location = `${issue.file}:${issue.line}:${issue.column}`;
        const rule = issue.rule ? ` \`${issue.rule}\`` : "";
        lines.push(`- **${location}**${rule} — ${issue.message}`);
      }
      lines.push("");
    }

    if (warnings.length > 0) {
      lines.push(`### Warnings (${warnings.length})`, "");
      for (const issue of warnings) {
        const location = `${issue.file}:${issue.line}:${issue.column}`;
        const rule = issue.rule ? ` \`${issue.rule}\`` : "";
        lines.push(`- **${location}**${rule} — ${issue.message}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function downloadMarkdown(lintResults: LintResult[]) {
  const md = generateMarkdown(lintResults);
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "codecop-lint-report.md";
  a.click();
  URL.revokeObjectURL(url);
}

function IssueRow({ issue }: { issue: LintIssue }) {
  return (
    <tr className="border-b border-cop-border/30">
      <td className="py-1.5 pr-3 font-mono text-xs text-cop-subtext truncate max-w-50">
        {issue.file}
      </td>
      <td className="py-1.5 pr-3 font-mono text-xs text-cop-muted whitespace-nowrap">
        {issue.line}:{issue.column}
      </td>
      <td className="py-1.5 pr-3">
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
            issue.severity === "error"
              ? "bg-cop-critical/10 text-cop-critical"
              : "bg-cop-warning/10 text-cop-warning"
          }`}
        >
          {issue.severity}
        </span>
      </td>
      <td className="py-1.5 pr-3 text-xs text-cop-text">{issue.message}</td>
      <td className="py-1.5 font-mono text-xs text-cop-muted">
        {issue.rule}
      </td>
    </tr>
  );
}

function LintDetails({
  result,
  onClose,
}: {
  result: LintResult;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<"all" | "error" | "warning">("all");

  const filtered =
    filter === "all"
      ? result.details
      : result.details.filter((d) => d.severity === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-cop-surface border border-cop-border rounded-xl w-full max-w-4xl max-h-[80vh] shadow-2xl shadow-black/40 flex flex-col animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cop-border shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-cop-text">
              {result.language} — {result.details.length} Issues
            </h3>
            <p className="text-xs text-cop-muted mt-0.5">
              {result.linter} &middot; {result.errors} errors, {result.warnings}{" "}
              warnings
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-cop-muted hover:text-cop-text transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-cop-border/50 shrink-0">
          {(["all", "error", "warning"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                filter === f
                  ? "bg-cop-primary/15 text-cop-primary"
                  : "text-cop-muted hover:text-cop-text hover:bg-cop-elevated"
              }`}
            >
              {f === "all"
                ? `All (${result.details.length})`
                : f === "error"
                  ? `Errors (${result.errors})`
                  : `Warnings (${result.warnings})`}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1 px-6 py-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cop-border text-left">
                <th className="pb-2 text-cop-subtext font-medium text-xs">File</th>
                <th className="pb-2 text-cop-subtext font-medium text-xs">Line</th>
                <th className="pb-2 text-cop-subtext font-medium text-xs">Severity</th>
                <th className="pb-2 text-cop-subtext font-medium text-xs">Message</th>
                <th className="pb-2 text-cop-subtext font-medium text-xs">Rule</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((issue, i) => (
                <IssueRow key={i} issue={issue} />
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-sm text-cop-muted italic text-center py-6">
              No {filter} issues found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LintResultsTable({
  lintResults,
}: LintResultsTableProps) {
  const [previewResult, setPreviewResult] = useState<LintResult | null>(null);

  const hasAnyDetails = lintResults.some(
    (r) => r.details && r.details.length > 0
  );

  if (lintResults.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-cop-text mb-3">
          Lint Results
        </h2>
        <p className="text-sm text-cop-muted italic">
          No lint results available
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-cop-text">Lint Results</h2>
        {hasAnyDetails && (
          <button
            onClick={() => downloadMarkdown(lintResults)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-cop-border text-cop-subtext hover:bg-cop-elevated hover:text-cop-text transition-colors cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Download Report
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cop-border text-left">
              <th className="pb-2 text-cop-subtext font-medium">Language</th>
              <th className="pb-2 text-cop-subtext font-medium">Linter</th>
              <th className="pb-2 text-cop-subtext font-medium">Errors</th>
              <th className="pb-2 text-cop-subtext font-medium">Warnings</th>
              <th className="pb-2 text-cop-subtext font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {lintResults.map((result, i) => (
              <tr key={i} className="border-b border-cop-border/50">
                <td className="py-2 font-mono text-cop-text">
                  {result.language}
                </td>
                <td className="py-2 font-mono text-cop-subtext">
                  {result.linter}
                </td>
                <td
                  className={`py-2 font-mono ${
                    result.errors > 0
                      ? "text-cop-critical font-bold"
                      : "text-cop-success"
                  }`}
                >
                  {result.errors}
                </td>
                <td
                  className={`py-2 font-mono ${
                    result.warnings > 0
                      ? "text-cop-warning"
                      : "text-cop-success"
                  }`}
                >
                  {result.warnings}
                </td>
                <td className="py-2 text-right">
                  {result.details && result.details.length > 0 && (
                    <button
                      onClick={() => setPreviewResult(result)}
                      className="text-xs text-cop-primary hover:text-cop-primary-hover transition-colors cursor-pointer font-medium"
                    >
                      View Issues →
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Preview modal */}
      {previewResult && (
        <LintDetails
          result={previewResult}
          onClose={() => setPreviewResult(null)}
        />
      )}
    </div>
  );
}
