export interface TechStack {
  languages: string[];
  frameworks: string[];
  packageManager: string | null;
  buildTools: string[];
  hasDocker: boolean;
  hasCI: boolean;
  hasTesting: boolean;
}

export interface Issues {
  critical: string[];
  warnings: string[];
  good: string[];
}

export interface LintIssue {
  file: string;
  line: number;
  column: number;
  severity: "error" | "warning";
  message: string;
  rule: string;
}

export interface LintResult {
  language: string;
  linter: string;
  errors: number;
  warnings: number;
  details: LintIssue[];
}

export interface RepoStats {
  totalFiles: number;
  totalLines: number;
  totalSize: number;
}

export interface DependencyVersionIssue {
  category: "Dependency Version";
  package: string;
  declaredVersion: string;
  dependencyType: string;
  severity: "warning";
  explanation: string;
  probableRootCause: string;
  suggestedSolution: string;
}

export interface EvaluationResult {
  score: number;
  status: "Clean" | "Needs Improvement" | "Risky Code";
  techStack: TechStack;
  issues: Issues;
  suggestions: string[];
  lintResults: LintResult[];
  repoStats: RepoStats;
  missingDependencies?: unknown[];
  dependencyVersionIssues?: DependencyVersionIssue[];
}

export interface APIResponse {
  result: EvaluationResult;
}

export interface APIError {
  message: string;
}

export interface GitHubUser {
  githubId: number;
  username: string;
  displayName: string;
  avatarUrl: string;
  email: string | null;
  createdAt: string;
}

export interface GitHubRepo {
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  language: string | null;
  updatedAt: string;
  htmlUrl: string;
  stars: number;
}

export interface AnalysisHistoryItem {
  _id: string;
  repoUrl: string;
  score: number;
  status: "Clean" | "Needs Improvement" | "Risky Code";
  duration: number;
  languages: string[];
  createdAt: string;
}
