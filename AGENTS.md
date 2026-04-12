# AI Agent README

This file helps coding agents work safely and efficiently in this repository.

## Goal

Maintain and evolve a monorepo app with:

- `app/backend` (Express + Socket.IO)
- `app/frontend` (Vue + Vite)
- `app/shared` (shared TypeScript package)

## Commands You Should Use

Run commands from repository root unless explicitly needed otherwise.

```bash
npm install
npm run type:check
npm run lint:check
npm run format:check
npm run build:app:clear
npm run build:app
npm run dev
```

Workspace-specific commands:

```bash
npm run dev -w @break-that-ice/backend
npm run build -w @break-that-ice/backend
npm run build -w @break-that-ice/frontend
npm run build -w @break-that-ice/shared
```

## Dev/Prod Runtime Model

- Backend is the only server process.
- Development: backend mounts Vite middleware.
- Production: backend serves built frontend static assets.

Important env vars used by backend runtime:

- `SERVER_PORT`
- `FRONTEND_DIR`
- `FRONTEND_INDEX_FILE`

## Docker Notes

- Dev image: `Dockerfile.dev`
- Prod image: `Dockerfile.prod`
- Compose file uses profiles: `dev` and `prod`
- `.env.example` documents compose variables

Run profiles with:

```bash
docker compose --profile dev up --build
docker compose --profile prod up --build -d
```

## Editing Rules for Agents

- Make minimal, targeted edits.
- Do not revert unrelated user changes.
- Keep scripts/docs synchronized with real package scripts.
- If you remove dependencies, run `npm install` to update lockfile.
- After changing runtime/build flow, always rerun:
  - `npm run type:check`
  - `npm run lint:check`
  - `npm run build:app:clear && npm run build:app`

## Current Known State

- Root build scripts build backend and frontend (shared is not forced by root build:app).
- Frontend currently has no direct runtime dependency on shared package.
- Backend and frontend builds pass from a clean build state.
