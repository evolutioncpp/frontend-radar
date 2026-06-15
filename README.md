# Frontend Radar

[English](README.md) | [Русский](README.ru.md)

Frontend Radar analyzes frontend repositories and turns repository signals into an explainable health report with metrics, recommendations, history and comparison.

![Frontend Radar overview](docs/screenshots/overview.png)

## What It Checks

- repository metadata and the selected frontend path
- package metadata, lockfiles and package manager consistency
- source files, TypeScript configs, test files and coverage signals
- GitHub Actions workflow quality
- basic security and secrets hygiene
- maintainability, performance and accessibility signals
- actionable recommendations with impact and effort labels

## Screenshots

![Report metrics](docs/screenshots/report-metrics.png)

![Recommendations](docs/screenshots/recommendations.png)

![History comparison](docs/screenshots/history-comparison.png)

## Tech Stack

- React 19, Vite, Redux Toolkit and RTK Query
- Fastify, Zod, Prisma and PostgreSQL
- Vitest, Playwright and Storybook
- Docker Compose for the local database

## Requirements

- Node.js 24+
- npm
- Docker or Docker Desktop

## Quick Start

Install dependencies:

```bash
npm install
```

Create local environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

PowerShell alternative:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env
```

Start PostgreSQL and prepare the database:

```bash
npm run db:up
npm run db:deploy
npm run db:generate
```

Start the app:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

The API runs on:

```text
http://localhost:3001
```

## GitHub Token

Public repositories can be analyzed without a token, but GitHub rate limits are lower.

For private repositories or higher rate limits, add a fine-grained GitHub token in the application settings. The token is stored only in the browser and is sent to the backend as `x-github-token` for analysis requests. It is not stored in the database, reports or logs.

Recommended fine-grained token permissions:

- Contents: Read-only
- Metadata: Read-only

## Useful Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start PostgreSQL, API and web dev servers |
| `npm run db:up` | Start the PostgreSQL container |
| `npm run db:down` | Stop Docker Compose services |
| `npm run db:deploy` | Apply Prisma migrations |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:generate` | Generate the Prisma client |
| `npm run check` | Run SCSS type check, formatting check, lint, build and tests |
| `npm run check:full` | Run full checks including e2e |
| `npm run api:generate -w apps/web` | Regenerate the RTK Query API client |
| `npm run scss:types -w apps/web` | Regenerate SCSS module typings |

## Project Structure

```text
apps/
  api/   Fastify API, report analysis, scoring and persistence
  web/   React dashboard
packages/
  github-repository/
  localization/
scripts/
  dev.mjs
```

## Development Notes

- Prisma migrations live in `apps/api/prisma/migrations`.
- The generated RTK Query client is committed.
- SCSS module `.d.ts` files are committed.
- Local `.env` files, build output, coverage and Playwright reports are ignored.

## License

MIT
