"use client";

import Link from "next/link";
import { useAuth } from "../lib/auth-context";

const SUPPORTED_LANGUAGES = [
  {
    name: "JavaScript / TypeScript",
    linter: "ESLint",
    color: "#F7DF1E",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
      </svg>
    ),
  },
  {
    name: "Python",
    linter: "Ruff",
    color: "#3776AB",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" />
      </svg>
    ),
  },
  {
    name: "Go",
    linter: "golangci-lint",
    color: "#00ADD8",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.06 3.096.642.541.398.95.923 1.227 1.555.035.06.012.094-.058.117z" />
        <path d="M18.088 18.905c-1.05-.023-2.02-.246-2.89-.795-.76-.48-1.28-1.145-1.52-2.008-.304-1.086-.21-2.115.327-3.085.607-1.098 1.52-1.8 2.7-2.138 1.016-.292 2.009-.234 2.95.222.88.433 1.484 1.11 1.776 2.044.363 1.18.293 2.313-.304 3.377-.607 1.086-1.543 1.764-2.734 2.09-.422.105-.855.152-1.297.164-.222.012-.21 0-.21 0h.2zm2.84-4.37c-.012-.163-.023-.292-.047-.42-.164-.837-.698-1.39-1.52-1.543-.759-.141-1.449.046-2.009.571-.467.445-.7 1.018-.735 1.672-.036.467.104.9.397 1.274.352.444.841.642 1.414.665.828.023 1.508-.303 2.021-.936.362-.445.548-.96.478-1.284z" />
      </svg>
    ),
  },
  {
    name: "Dart / Flutter",
    linter: "dart analyze",
    color: "#0175C2",
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M4.105 4.105S9.158 1.58 11.684.316a3.079 3.079 0 0 1 1.481-.315c.766.047 1.677.788 1.677.788L24 9.948l-9.263 9.264-1.473 1.473L6.89 24H2.105L0 21.895v-4.79L4.105 4.106zm5.632 10.632L4.158 20.316l.696.696h3.572l5.476-5.48-4.165-4.157zm9.895-4.842l-3.632-3.632-6.168 6.337 3.84 3.84 5.96-5.96v-.585z" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    title: "Code Quality Score",
    description:
      "CodeCop assigns an overall health score to your repository based on best practices, structure, and maintainability.",
    icon: (
      <svg viewBox="0 0 100 100" className="w-10 h-10">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          opacity={0.2}
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray="251"
          strokeDashoffset="50"
          strokeLinecap="round"
          className="-rotate-90 origin-center"
        />
      </svg>
    ),
  },
  {
    title: "Lint Analysis",
    description:
      "CodeCop runs automated linting across multiple languages — catch errors, warnings, and style issues instantly.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
        />
      </svg>
    ),
  },
  {
    title: "Tech Stack Detection",
    description:
      "Automatically identifies languages, frameworks, build tools, Docker, CI/CD, and testing setups.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0L21.75 16.5 12 21.75 2.25 16.5l4.179-2.25m0 0 5.571 3 5.571-3"
        />
      </svg>
    ),
  },
  {
    title: "Actionable Suggestions",
    description:
      "CodeCop delivers targeted recommendations to improve code quality, security, and developer experience.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-10 h-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
        />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-cop-border/50 sticky top-0 z-40 bg-cop-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-cop-primary">Code</span>
            <span className="text-cop-text">Cop</span>
          </span>
          <div className="flex items-center gap-5">
            <a
              href="#about"
              className="text-sm text-cop-subtext hover:text-cop-text transition-colors hidden sm:inline"
            >
              About
            </a>
            <a
              href="https://github.com/syedkumailraza2/Code-Cop"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-cop-subtext hover:text-cop-text transition-colors"
              title="Star CodeCop on GitHub"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-cop-primary text-white hover:bg-cop-primary-hover transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/analyze"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-cop-primary text-white hover:bg-cop-primary-hover transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cop-primary/[0.07] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-cop-primary/[0.04] rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Left — copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cop-primary/10 border border-cop-primary/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-cop-primary animate-glow-pulse" />
                <span className="text-cop-primary font-mono text-xs tracking-wider uppercase">
                  GitHub Code Quality Analyzer
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Inspect your code
                <br />
                <span className="text-cop-primary">before it ships.</span>
              </h1>

              <p className="mt-6 text-cop-subtext text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                CodeCop lets you paste a GitHub repo URL and get an instant
                quality report — lint errors, tech stack breakdown, actionable
                suggestions, and an overall health score.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/analyze"
                  className="group relative px-8 py-3.5 rounded-lg font-semibold bg-cop-primary text-white hover:bg-cop-primary-hover transition-all text-base shadow-[0_0_24px_rgba(232,119,46,0.25)] hover:shadow-[0_0_32px_rgba(232,119,46,0.35)]"
                >
                  Analyze a Repository
                  <span className="inline-block ml-2 transition-transform group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </Link>
                <a
  href="vscode://code-cop.code-cop/connect"
  className="px-8 py-3.5 rounded-lg font-medium border border-cop-border text-cop-subtext hover:bg-cop-elevated hover:text-cop-text transition-colors text-base"
>
  Connect VS Code Project
</a>
                {!isAuthenticated && (
                  <button
                    onClick={login}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-lg font-medium border border-cop-border text-cop-subtext hover:bg-cop-elevated hover:text-cop-text transition-colors text-base cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    Sign in with GitHub
                  </button>
                )}
                {isAuthenticated && (
                  <Link
                    href="/dashboard"
                    className="px-8 py-3.5 rounded-lg font-medium border border-cop-border text-cop-subtext hover:bg-cop-elevated hover:text-cop-text transition-colors text-base"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>

            {/* Right — mock UI preview with supported languages */}
            <div className="flex-1 w-full max-w-md lg:max-w-lg">
              <div className="bg-cop-surface border border-cop-border rounded-xl overflow-hidden shadow-2xl shadow-black/30 animate-float">
                {/* Window title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-cop-border bg-cop-elevated/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-cop-critical/70" />
                    <div className="w-3 h-3 rounded-full bg-cop-warning/70" />
                    <div className="w-3 h-3 rounded-full bg-cop-success/70" />
                  </div>
                  <span className="ml-2 text-xs text-cop-muted font-mono">
                    CodeCop — Analysis Report
                  </span>
                </div>

                {/* Report body */}
                <div className="p-5 text-sm space-y-4">
                  {/* URL input preview */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cop-bg/60 border border-cop-border/60">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-cop-muted shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-4.074a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364l1.757 1.757" />
                    </svg>
                    <span className="text-cop-subtext font-mono text-xs truncate">
                      github.com/user/awesome-project
                    </span>
                  </div>

                  {/* Score output */}
                  <div className="flex items-center gap-3 pl-4 border-l-2 border-cop-primary/40">
                    <span className="text-cop-success">&#10003;</span>
                    <span className="text-cop-subtext">
                      CodeCop Score: <span className="text-cop-success font-bold">86</span>/100 — Clean
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-cop-border/50" />

                  {/* Supported languages section */}
                  <div>
                    <span className="text-cop-muted text-xs uppercase tracking-wider">
                      Supported Linters
                    </span>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <div
                          key={lang.name}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-cop-bg/60 border border-cop-border/60"
                        >
                          <span style={{ color: lang.color }}>{lang.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs text-cop-text truncate">
                              {lang.name}
                            </p>
                            <p className="text-[10px] text-cop-muted truncate">
                              {lang.linter}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analyzing indicator */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cop-primary/5 border border-cop-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-cop-primary animate-glow-pulse" />
                    <span className="text-xs text-cop-primary">
                      Ready to analyze your next repo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech strip */}
      <section className="border-y border-cop-border/50 bg-cop-surface/30">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <span className="text-xs text-cop-muted uppercase tracking-wider whitespace-nowrap">
              Deep analysis for
            </span>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div
                key={lang.name}
                className="flex items-center gap-2 text-cop-subtext"
              >
                <span style={{ color: lang.color }}>{lang.icon}</span>
                <span className="text-sm font-medium">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything you need to
              <span className="text-cop-primary"> audit a repo</span>
            </h2>
            <p className="mt-4 text-cop-subtext text-lg max-w-xl mx-auto">
              One URL. One click. CodeCop gives you a comprehensive breakdown
              of your repository&apos;s code quality.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group bg-cop-surface border border-cop-border rounded-xl p-6 hover:border-cop-primary/40 transition-all hover:shadow-lg hover:shadow-cop-primary/[0.03]"
              >
                <div className="text-cop-primary mb-4 transition-transform group-hover:scale-110 origin-left">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-cop-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-cop-subtext leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-cop-border/50 px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Three steps. <span className="text-cop-primary">That&apos;s it.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Paste URL",
                desc: "Drop in any public GitHub repository link.",
              },
              {
                step: "02",
                title: "We Analyze",
                desc: "CodeCop clones, lints, and evaluates your code.",
              },
              {
                step: "03",
                title: "Get Results",
                desc: "Review your CodeCop score, issues, and suggestions.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="text-cop-primary font-mono text-4xl font-bold">
                  {item.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-cop-text">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-cop-subtext">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              href="/analyze"
              className="inline-block px-8 py-3.5 rounded-lg font-semibold bg-cop-primary text-white hover:bg-cop-primary-hover transition-colors text-base shadow-[0_0_24px_rgba(232,119,46,0.2)] hover:shadow-[0_0_32px_rgba(232,119,46,0.3)]"
            >
              Try It Now
            </Link>
          </div>
        </div>
      </section>

      {/* About CodeCop */}
      <section id="about" className="border-t border-cop-border/50 px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
            About <span className="text-cop-primary">CodeCop</span>
          </h2>
          <div className="space-y-6 text-cop-subtext text-base sm:text-lg leading-relaxed text-center max-w-3xl mx-auto">
            <p>
              CodeCop is a free, open-source code quality analyzer built for
              developers who want fast, actionable feedback on their GitHub
              repositories. Whether you&apos;re maintaining an open-source
              project or reviewing a codebase before contributing, CodeCop helps
              you understand what&apos;s working and what needs attention.
            </p>
            <p>
              Under the hood, CodeCop clones your repository, detects the tech
              stack, and runs industry-standard linters — ESLint for
              JavaScript/TypeScript, Ruff for Python, golangci-lint for Go, and
              dart analyze for Dart/Flutter. The results are combined into a
              single, easy-to-read report with a health score, categorized
              issues, and prioritized suggestions.
            </p>
            <p>
              CodeCop was built with the belief that every developer deserves
              access to professional-grade code analysis — no setup, no
              configuration, no cost. Just paste a URL and let CodeCop do the
              rest.
            </p>
          </div>

          {/* Quick stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: "4", label: "Languages Supported" },
              { value: "100%", label: "Free & Open Source" },
              { value: "< 9.6s", label: "Average Analysis Time" },
              { value: "0", label: "Setup Required" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-xl bg-cop-surface border border-cop-border"
              >
                <p className="text-2xl sm:text-3xl font-bold text-cop-primary">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-cop-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cop-border/50 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
          <span className="text-lg font-bold">
            <span className="text-cop-primary">Code</span>
            <span className="text-cop-text">Cop</span>
          </span>
          <nav className="flex items-center gap-6 text-sm text-cop-subtext">
            <a
              href="#features"
              className="hover:text-cop-text transition-colors"
            >
              Features
            </a>
            <a href="#about" className="hover:text-cop-text transition-colors">
              About
            </a>
            <Link
              href="/analyze"
              className="hover:text-cop-text transition-colors"
            >
              Analyze
            </Link>
          </nav>
          <p className="text-xs text-cop-muted text-center">
            CodeCop — Built for developers who care about code quality.
          </p>
        </div>
      </footer>
    </main>
  );
}
