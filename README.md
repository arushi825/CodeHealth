# CodeCop

**Instant code quality reports for any GitHub repository.**

CodeCop is a free, open-source tool that analyzes public GitHub repositories and generates detailed quality reports — lint issues, tech stack detection, security checks, and actionable suggestions — all from a single URL.

**Live at** [codecop.kumailrazas.in](https://codecop.kumailrazas.in)

---

## Features

- **Code Quality Score** — 0–100 health score based on best practices, structure, and maintainability
- **Multi-Language Linting** — ESLint (JavaScript), tsc (TypeScript), Ruff (Python), golangci-lint (Go), dart analyze (Dart/Flutter)
- **Tech Stack Detection** — Auto-identifies languages, frameworks, package managers, build tools, Docker, CI/CD, and testing setups
- **Security Scanning** — Detects hardcoded secrets, API keys, and tokens
- **Downloadable Lint Reports** — Export a full `.md` report with every issue listed by file, line, and rule
- **Actionable Suggestions** — Up to 8 prioritized recommendations to improve code quality
- **Repository Statistics** — Total files, lines of code, and repo size
- **Feedback System** — Built-in feedback form to help improve CodeCop

---

## Architecture

CodeCop follows a client-server architecture with a Next.js frontend and an Express.js backend.

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│                   (Next.js 16 + React 19)               │
│                                                         │
│   /  ──────────  Landing page                           │
│   /analyze ────  URL input form                         │
│   /results ────  Dashboard (score, issues, lint, etc.)  │
│                                                         │
│   Rewrites /api/* requests to the backend server        │
└────────────────────���─┬──────────────────────────────────┘
                       │ POST /api/evaluate
                       │ POST /api/feedback
                       ▼
┌─────────────────────────────────────────────────────────┐
│                        Server                           │
│                   (Express 5 + Node.js)                 │
│                                                         │
│   POST /evaluate                                        │
│   ┌───────────────────────────────────────────────┐     │
│   │ 1. Clone repo (shallow, --depth 1)            │     │
│   │ 2. Detect tech stack                          │     │
│   │ 3. Check README, .gitignore                   │     │
│   │ 4. Run linters per detected language          │     │
│   │    ├─ JavaScript  → ESLint                    │     │
│   │    ├─ TypeScript  → tsc --noEmit              │     │
│   │    ├─ Python      → Ruff                      │     │
│   │    ├─ Go          → golangci-lint             │     │
│   │    └─ Dart        → dart analyze              │     │
│   │ 5. Scan for hardcoded secrets                 │     │
│   │ 6. Calculate score (100 base, deductions)     │     │
│   │ 7. Generate suggestions                       │     │
│   │ 8. Collect repo stats                         │     │
│   │ 9. Save to MongoDB (async)                    │     │
│   │ 10. Delete cloned repo                        │     │
│   └───────────────────────────────────────────────┘     │
│                                                         │
│   POST /feedback                                        │
│   └─ Save rating + message to MongoDB                   │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   MongoDB Atlas  │
              │                 │
              │  evaluations    │
              │  feedbacks      │
              └─────────────────┘
```

### Scoring System

| Check | Impact |
|-------|--------|
| Missing README | -10 |
| Missing .gitignore | -5 |
| Each lint error | -2 (capped at -50 total) |
| Each lint warning | -1 (capped at -50 total) |
| Hardcoded secret found | -20 per file |

| Score | Status |
|-------|--------|
| 81–100 | Clean |
| 51–80 | Needs Improvement |
| 0–50 | Risky Code |

### Tech Stack Detection

CodeCop detects the following from repository file structures:

- **Languages** — JavaScript, TypeScript, Python, Go, Java, Dart, Rust, Ruby, PHP, Swift, Kotlin, C#
- **Frameworks** — Next.js, React, Vue, Angular, Express, NestJS, Django, Flask, FastAPI, Flutter, Rails, Laravel, Gin, Spring, and more
- **Package Managers** — npm, yarn, pnpm, pip, pipenv, Go modules, Cargo, Pub, Bundler, Composer
- **Build Tools** — Webpack, Vite, tsc, Make, CMake, Gradle, Maven
- **DevOps** — Docker, GitHub Actions, GitLab CI, Jenkins, CircleCI, Travis CI
- **Testing** — Jest, Pytest, PHPUnit, RSpec, Vitest

---

## Project Structure

```
CodeCop/
├── client/                          # Next.js frontend
│   ├── src/
│   │   ├── app/                     # App router pages
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── layout.tsx           # Root layout + SEO metadata
│   │   │   ├── analyze/page.tsx     # URL input page
│   │   │   ├── results/page.tsx     # Results dashboard
│   │   │   ├── sitemap.ts           # Dynamic sitemap
│   │   │   └── robots.ts           # Robots.txt
│   │   ├── components/              # React components
│   │   │   ├── ResultsDashboard.tsx # Main results layout
│   │   │   ├── ScoreGauge.tsx       # Circular score display
│   │   │   ├── LintResultsTable.tsx # Lint issues table + download
│   │   │   ├── IssuePanel.tsx       # Critical/warning/good issues
│   │   │   ├── TechStackBadges.tsx  # Language/framework badges
│   │   │   ├── SuggestionsList.tsx  # Recommendations list
│   │   │   ├── RepoStatsCard.tsx    # File count, lines, size
│   │   │   ├── FeedbackModal.tsx    # Rating & feedback form
│   │   │   ├── URLInput.tsx         # GitHub URL input
│   │   │   └── LoadingOverlay.tsx   # Analysis spinner
│   │   └── lib/
│   │       ├── api.ts               # API client functions
│   │       ├── types.ts             # TypeScript interfaces
│   │       └── constants.ts         # App constants
│   ├── next.config.ts               # API rewrites
│   └── package.json
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── app.js                   # Express setup + MongoDB
│   │   ├── controller/
│   │   │   ├── evaluator.controller.js  # /evaluate handler
│   │   │   └── feedback.controller.js   # /feedback handler
│   │   ├── service/
│   │   │   ├── evaluator.service.js     # Main evaluation pipeline
│   │   │   ├── lint.service.js          # ESLint runner (JS)
│   │   │   ├── lintRunner.service.js    # Multi-language linters
│   │   │   ├── techStack.service.js     # Tech stack detection
│   │   │   ├── suggestions.service.js   # Recommendations engine
│   │   │   └── cloneRepo.service.js     # Git clone wrapper
│   │   ├── model/
│   │   │   ├── evaluation.model.js      # Evaluation schema
│   │   │   └── feedback.model.js        # Feedback schema
│   │   ├── router/
│   │   │   └── evaluation.router.js     # Route definitions
│   │   └── utility/
│   │       ├── spawnWithTimeout.utils.js  # Process spawning
│   │       ├── linterParsers.utils.js     # Linter output parsers
│   │       └── deleteFolder.utils.js      # Cleanup utility
│   ├── Dockerfile
│   ├── index.js                     # Server entry point
│   └── package.json
│
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4 |
| Backend | Node.js, Express 5, Mongoose 9 |
| Database | MongoDB Atlas |
| Linters | ESLint, TypeScript Compiler, Ruff, golangci-lint, Dart SDK |
| Containerization | Docker (Node 20-slim) |
| Analytics | Google Analytics 4 |

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **MongoDB** (local or Atlas connection string)
- **Git** (for cloning repositories during analysis)

Optional (for full multi-language linting):
- **Ruff** — `curl -LsSf https://astral.sh/ruff/install.sh | sh`
- **golangci-lint** — `curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b /usr/local/bin`
- **Dart SDK** — [Install guide](https://dart.dev/get-dart)
- **TypeScript** — `npm install -g typescript`

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/syedkumailraza2/Code-Cop.git
   cd Code-Cop
   ```

2. **Set up the backend**

   ```bash
   cd server
   npm install
   ```

   Create a `.env` file:

   ```env
   PORT=5000
   MONGO_URL=mongodb+srv://<USERNAME>:<ENCODED_PASSWORD>@<CLUSTER_HOST>/codecop
   ```

3. **Set up the frontend**

   ```bash
   cd ../client
   npm install
   ```

   Create a `.env` file:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   ```

4. **Start both servers**

   In one terminal (backend):

   ```bash
   cd server
   npm run dev
   ```

   In another terminal (frontend):

   ```bash
   cd client
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker (Backend Only)

```bash
cd server
docker build -t codecop-server .
docker run -p 8000:8000 --env-file .env codecop-server
```

The Docker image includes all linters (ESLint, Ruff, golangci-lint, Dart SDK, TypeScript) pre-installed.

---

## API Reference

### `POST /evaluate`

Analyze a GitHub repository.

**Request:**

```json
{
  "githubURL": "https://github.com/user/repo"
}
```

**Response:**

```json
{
  "result": {
    "score": 85,
    "status": "Clean",
    "techStack": {
      "languages": ["TypeScript", "JavaScript"],
      "frameworks": ["Next.js", "React"],
      "packageManager": "npm",
      "buildTools": ["tsc"],
      "hasDocker": true,
      "hasCI": false,
      "hasTesting": false
    },
    "issues": {
      "critical": ["2 JavaScript lint errors found"],
      "warnings": ["Missing .gitignore"],
      "good": ["README file present", "TypeScript project detected"]
    },
    "suggestions": [
      "Add a .gitignore to avoid committing unnecessary files",
      "Add a CI/CD pipeline (e.g., GitHub Actions)"
    ],
    "lintResults": [
      {
        "language": "JavaScript",
        "linter": "eslint",
        "errors": 2,
        "warnings": 5,
        "details": [
          {
            "file": "src/index.js",
            "line": 10,
            "column": 5,
            "severity": "error",
            "message": "'foo' is not defined.",
            "rule": "no-undef"
          }
        ]
      }
    ],
    "repoStats": {
      "totalFiles": 42,
      "totalLines": 8500,
      "totalSize": 312000
    }
  }
}
```

### `POST /feedback`

Submit user feedback.

**Request:**

```json
{
  "rating": 4,
  "message": "Great tool, would love Python support improvements",
  "repoUrl": "https://github.com/user/repo"
}
```

**Response:**

```json
{
  "message": "Feedback submitted successfully"
}
```

---

## Contributing

Contributions are welcome! Here's how to get started:

### 1. Fork & Clone

```bash
git clone https://github.com/<your-username>/Code-Cop.git
cd Code-Cop
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

Some areas where contributions are especially welcome:

- **New language support** — Add linters for Rust, Ruby, PHP, etc. in `server/src/service/lintRunner.service.js` and `server/src/utility/linterParsers.utils.js`
- **Improved tech stack detection** — Extend `server/src/service/techStack.service.js` with new frameworks or tools
- **UI improvements** — Components live in `client/src/components/`
- **Better suggestions** — Enhance `server/src/service/suggestions.service.js`
- **Bug fixes** — Check [open issues](https://github.com/syedkumailraza2/Code-Cop/issues)

### 4. Adding a New Linter

To add support for a new language:

1. **Add a parser** in `server/src/utility/linterParsers.utils.js`:

   ```javascript
   export const parseYourLinter = (stdout) => {
     // Parse stdout into { errors, warnings, details[] }
     // Each detail: { file, line, column, severity, message, rule }
   };
   ```

2. **Register the linter** in `server/src/service/lintRunner.service.js`:

   ```javascript
   const LINTER_REGISTRY = {
     YourLanguage: {
       command: "your-linter",
       args: ["--format", "json"],
       parser: parseYourLinter,
       requiresFile: "config.file",  // optional
     },
     // ...existing entries
   };
   ```

3. **Add language detection** in `server/src/service/techStack.service.js` if not already detected.

4. **Update the Dockerfile** to install the linter tool.

### 5. Submit a Pull Request

```bash
git push origin feature/your-feature-name
```

Open a PR against the `main` branch with a clear description of your changes.

### Code Style

- **Frontend** — TypeScript, functional React components, Tailwind CSS utility classes
- **Backend** — ES Modules (`import`/`export`), async/await, Express 5

---

## Constraints & Limits

| Constraint | Value |
|-----------|-------|
| Max repository size | 25 MB |
| Linter timeout | 30 seconds per language |
| Clone depth | Shallow (`--depth 1`) |
| Secret scan depth | 4 directory levels |
| Max suggestions | 8 |

---

## Deployment

CodeCop is deployed using managed platforms with built-in CI/CD — no custom pipelines needed.

| Service | Platform | Auto-deploys on |
|---------|----------|-----------------|
| Frontend | [Vercel](https://vercel.com) | Push to `main` |
| Backend | [Render](https://render.com) | Push to `main` |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | — |

Both Vercel and Render automatically build and deploy on every push to `main`.

---

## License

This project is open source. See the repository for license details.

---

Built by [Kumail Raza](https://github.com/syedkumailraza2) · [LinkedIn](https://www.linkedin.com/in/syedkumailraza/)
