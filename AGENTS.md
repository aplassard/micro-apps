# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages and routes. UI lives in `app/(site)/`, micro-apps under `app/apps/`, and API routes in `app/api/*/route.ts`.
- `lib/`: Shared TypeScript modules (OpenRouter client, weather helpers, schemas).
- `tests/`: Unit and integration tests (`*.test.ts`, `*.integration.test.ts`).
- `public/`: Static assets served at the web root.
- `middleware.ts`: Optional Basic Auth gate for non-static routes.

## Build, Test, and Development Commands
- `npm run dev`: Start the Next.js dev server with Turbopack.
- `npm run build`: Production build (`.next/`).
- `npm start`: Run the built app locally.
- `npm run lint`: Lint with ESLint (Next flat config).
- `npm test`: Type-checks critical TS files to `dist/` then runs Node’s test runner on `dist/tests/*.test.js`.

## Coding Style & Naming Conventions
- **TypeScript**: Strict mode enabled; prefer explicit types at module boundaries.
- **Files**: Pages `page.tsx`, API `route.ts`, shared libs in `lib/*.ts`. Use lower-case filenames where practical; follow existing names when editing (e.g., `geoWeather.ts`).
- **Code style**: 2-space indent, single quotes in TS, JSX allowed. Run `npm run lint` before opening a PR.
- **Imports**: Use alias `@/*` for workspace-root imports.

## Testing Guidelines
- **Framework**: Node’s built-in `node:test` with `assert/strict`.
- **Location**: Add tests in `tests/`. Name unit tests `*.test.ts`; mark networked tests as `*.integration.test.ts` and guard with `skip: !process.env.OPENROUTER_API_KEY`.
- **Run**: `npm test`. Keep tests deterministic; mock `fetch` for external HTTP in unit tests.

## Commit & Pull Request Guidelines
- **Commits**: Use Conventional Commit prefixes when possible (`feat:`, `fix:`, `test:`, `docs:`, `ci:`). Keep messages imperative and scoped.
- **PRs**: Include a brief description, rationale, and screenshots for UI changes. Link issues, list key commands run (lint/tests), and call out any env/config changes.

## Security & Configuration Tips
- Env vars: `OPENROUTER_API_KEY` (required for live OpenRouter calls), `OPENROUTER_MODEL` (default `openai/gpt-5-nano`), `BASIC_AUTH_USER`/`BASIC_AUTH_PASS` (enable Basic Auth), `VERBOSE` (debug logging).
- Avoid committing secrets. For CI, add `OPENROUTER_API_KEY` as a repository secret; workflow is in `.github/workflows/ci.yml`.

## Adding a New Micro‑App
- Create `app/apps/<name>/page.tsx` and add an entry to the list in `app/(site)/page.tsx`.
- Reuse utilities from `lib/`; add new modules with focused APIs and tests.
