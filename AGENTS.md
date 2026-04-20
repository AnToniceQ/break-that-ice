# AI Agent README

This file helps coding agents work safely and efficiently in this repository.

## Goal

Maintain and evolve the TypeScript monorepo:

- `app/backend` is the Express + Socket.IO runtime server.
- `app/frontend` is the Vue 3 + Vite client.
- `app/shared` is the shared TypeScript package used by the backend.

## Repository Layout

- Root workspace: `package.json`, `docker/compose.yml`, `docker/compose.dev.yml`, `docker/compose.prod.yml`, `docker/compose.ts`.
- Backend app: `app/backend`.
- Frontend app: `app/frontend`.
- Shared package: `app/shared`.
- Local GitHub actions: `.github/actions`.
- GitHub workflows: `.github/workflows`.
- GitHub workflow scripts: `.github/scripts`.

## Commands You Should Use

Run commands from repository root unless explicitly needed otherwise.

```bash
npm install
npm run dev
npm run type:check
npm run lint
npm run lint:check
npm run format
npm run format:check
npm run quality
npm run build:app:clear
npm run build:app
npm run build:actions
```

Workspace-specific commands:

```bash
npm run dev -w @break-that-ice/backend
npm run build -w @break-that-ice/backend
npm run build:clear -w @break-that-ice/backend
npm run build -w @break-that-ice/frontend
npm run build:clear -w @break-that-ice/frontend
npm run type:check -w @break-that-ice/shared
npm run build --workspace=.github/actions/flow-pr
```

## Branch, Issue, and PR Flow Rules

The repository uses automated PR flow checks and issue label transitions.

- Issue branch naming must match: `{issueNumber}-{short-name}`.
- Main progression path: `issue -> dev -> test -> main`.
- Allowed backports: `main -> test`, `test -> dev`.

Promotion labels managed by automation:

- `reviewing`
- `dev`
- `testing`
- `prepared`
- `deploying`

Label transitions are enforced in `.github/actions/flow-pr` and triggered by `.github/workflows/flow-pr.yml`.

## Runtime Model

- The backend is the only server process.
- In development, the backend mounts Vite middleware for HMR.
- In production, the backend serves the built frontend static files.
- The backend reads its runtime config from environment variables rather than hard-coded paths.

## Environment Variables

Backend runtime:

- `INTERNAL_SERVER_PORT` is the port the HTTP server listens on.
- `FRONTEND_DIR` points to the frontend root or built asset directory.
- `FRONTEND_INDEX_FILE` sets the frontend entry file name.

Backend build:

- `MINIFY_BACKEND_BUILD` controls whether the tsup build is minified.

Docker / compose:

- `EXTERNAL_SERVER_PORT` is the host port published by compose.
- `npm run docker:compose -- <dev|prod> <docker compose args>` is the supported wrapper command; it calls `docker/compose.ts` and loads `.env` + mode env files.

## Docker Notes

- Dev image: `docker/Dockerfile.dev`.
- Prod image: `docker/Dockerfile.prod`.
- Compose files live under `docker/` and are invoked via `docker/compose.ts`.
- `.env.example` documents the compose variables.
- Dev compose mounts `app/frontend/node_modules` and `app/backend/node_modules` as anonymous volumes to keep host and container installs isolated.

Run Docker with:

```bash
npm run docker:compose -- dev up --build
npm run docker:compose -- prod up --build -d
```

## GitHub Actions Runtime Notes

- Workflows use a shared local setup action: `.github/actions/node-setup/action.yml`.
- Any job that uses a local action path (`./.github/actions/...`) must run `actions/checkout` before that step.
- `actions-built-guard` intentionally uses sparse checkout (`package.json`, `package-lock.json`, `.github`, `.husky`) to validate action builds quickly.
- The `actions-built-guard` gate expects generated action bundles to be committed.
- If Husky is not installed/hooked in your environment, run `npm run build:actions` manually before commit.
- Each action workspace under `.github/actions/*` is expected to commit and push its `dist/` output.

## Editing Rules for Agents

- Make minimal, targeted edits.
- Do not revert unrelated user changes.
- Keep scripts and docs synchronized with the real package manifests.
- If you remove dependencies, run `npm install` to update the lockfile.
- After editing action source under `.github/actions/*`, rebuild action bundles with `npm run build:actions`.
- After changing runtime or build flow, rerun:
  - `npm run type:check`
  - `npm run lint:check`
  - `npm run build:app:clear && npm run build:app`

## Current Known State

- Root `build:app` targets backend and frontend only.
- Root `type:check` includes shared.
- Frontend does not import `@break-that-ice/shared` directly.
- Backend depends on `@break-that-ice/shared`.
- Backend env parsing expects `INTERNAL_SERVER_PORT`, not `SERVER_PORT`.
