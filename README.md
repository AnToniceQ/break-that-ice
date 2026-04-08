# Break That Ice

A TypeScript monorepo web app to break the ice within friend groups made with typesafe Socket.IO, Express and Vue 3.

Features:

- `app/backend/` — Express.js + Node.js + Socket.IO + `express-session` (TypeScript)
- `app/frontend/` — Vue 3 + Vite + `socket.io-client` (TypeScript)
- `app/shared/` — Type-safe shared library for both backend and frontend
- npm workspaces across all packages for seamless development

## Structure

```text
.
├── app/
│   ├── backend/          # Express + Socket.IO server
│   ├── frontend/         # Vue 3 + Vite app
│   └── shared/           # Shared library between both backend and frontend
├── scripts/              # Scripts meant to run before production
```

## Quick Start

```bash
cp .env.development.example .env.development
npm install
npm run dev
```

The app opens at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## Architecture

### Shared Socket Library

The `app/shared/socket` package provides type-safe Socket.IO event definitions.

## Scripts

From the repo root, managed via npm workspaces:

```bash
# Development
npm run type:check           # TypeScript type checking for all packages
npm run format               # Format code with Prettier
npm run lint                 # Lint and fix with ESLint
npm run dev                  # Run backend + frontend concurrently

# Building
npm run build:all            # Build shared → backend → frontend
npm run build:all:clear      # Clean dist folders and type cache
npm run build:bundle         # Bundle for standalone deployment
```

## Production Build

```bash
npm run build:all:clear
```

```bash
npm run build:all
```

```bash
SERVER_PORT=3000 FRONTEND_DIR=public npm run build:bundle
```

This creates a single deployable backend bundle that includes shared dependencies.

## Contributing

The repository uses `husky` and `lint-staged` so that every staged file is properly linted and formatted for any future commit.

Type checking with `tsc` and `vue-tsc` happens before every push.

`Husky` is initialized automatically when running `npm install`. If you don't want to use `husky`, please ensure to do the following manually before any commit:

```bash
# Make changes, run type checks and linting
npm run type:check
npm run lint:check

# Format code before committing
npm run format
```

## License

MIT
