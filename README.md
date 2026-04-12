# Break That Ice

TypeScript monorepo with an Express backend and Vue frontend. The backend is the single runtime server in both environments:

- In development, it mounts Vite in middleware mode for HMR.
- In production, it serves the built frontend as static files.

## Workspace Structure

```text
.
├── app/
│   ├── backend/   # Express + Socket.IO runtime
│   ├── frontend/  # Vue 3 + Vite client
│   └── shared/    # Shared TypeScript package
├── Dockerfile.dev
├── Dockerfile.prod
└── docker-compose.yml
```

## Requirements

- Node.js `22.x`
- npm `10.x`

## Install

```bash
npm install
```

## Docker (Development & Production)

The repository is prepared for, and should be used with compose profiles.

The app runs on the development container just as would on your machine (including HMR), just being represented by a more prod-like container.

The profile is chosen automatically based off of the `COMPOSE_PROFILES` environment.

```bash
cp .env.example .env
```

Start up the profile:

```bash
docker compose up -d --build
```

## Host development (unrecommended : use Docker instead!)

The backend needs these environments for local development:

- `INTERNAL_SERVER_PORT`
- `FRONTEND_INDEX_FILE`
- `FRONTEND_DIR`

```bash
INTERNAL_SERVER_PORT=3000 FRONTEND_DIR=./app/frontend/dist FRONTEND_INDEX_FILE=index.html npm run dev
```

## Host production (unrecommended : use Docker instead!)

The backend needs these environments for local production:

- `INTERNAL_SERVER_PORT`
- `FRONTEND_INDEX_FILE`
- `FRONTEND_DIR`

Clean and build all packages:

```bash
npm run build:app:clear
npm run build:app
```

```bash
INTERNAL_SERVER_PORT=3000 FRONTEND_DIR=./app/frontend/dist FRONTEND_INDEX_FILE=index.html node ./app/backend/dist/main.prod.js
```

## Scripts

- `npm run dev` - start backend in dev mode with Vite middleware
- `npm run type:check` - run type checks across root, frontend, backend, shared
- `npm run lint` - lint and auto-fix
- `npm run lint:check` - lint without auto-fix
- `npm run format` - format all files
- `npm run format:check` - verify formatting
- `npm run build:app:clear` - clear build outputs for backend/frontend
- `npm run build:app` - build backend and frontend

## Quality Gates

Recommended before commit:

```bash
npm run quality
```

or manually:

```bash
npm run type:check
npm run lint:check
npm run format:check
```

Quality gates are handled automatically by `husky` and `lint-staged`. They are configured and initialized when `npm install` runs on the Host machine.

## Environment Variables

Docker variables:

- `EXTERNAL_SERVER_PORT` - Port forwarded from Docker to Host

Backend runtime variables:

- `INTERNAL_SERVER_PORT` - Port the actual HTTP app is listening on, containerized or not
- `FRONTEND_DIR` - frontend root/static directory path
- `FRONTEND_INDEX_FILE` - frontend entry file name

Developer-specific variables (from `.env`):

- `COMPOSE_PROFILES` - selected compose profile (`dev` or `prod`)
- `INTERNAL_SERVER_PORT` - when app containerized, we recommend to keep it at `3000`; if app on Host, set to your needs
- `EXTERNAL_SERVER_PORT` - when app containerized, set to your Host needs; if app on Host, this environemnt is not used at all

## License

MIT
