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

## Development & production

We aim to support both Host-based and Docker-based development, although using Docker is highly recommended.

The `.env.example` represents environment variables to be used with Docker-based development. The application is setup for docker to automatically read these environment variables and use them in a needed scope, whether as build arguments, or runtime variables.

If you intend to use Host-based development, feel free to modify the gitignored `.env` file to fit your own development workflow.

### Docker-based

The repository is prepared for, and should be used with, docker compose profiles.

When in development profile, the app runs in the container just as would on your machine (including HMR), just being represented by a more production-like container.

The `development` or `production` profile is chosen automatically based off of the `COMPOSE_PROFILES` environment variable.

```bash
cp .env.example .env
```

Start up the profile:

```bash
docker compose up -d --build
```

### Host-based

All commands below are written so that environment variables are passed directly to the command, making the `.env` file unnecessary.

If you created your own custom `.env` file, feel free to adapt these commands accordingly.

You can see all the variables/arguments needed in [Application environment](#application-environment).

#### Development

Start the development server:

```bash
INTERNAL_SERVER_PORT=3000 FRONTEND_DIR=./../frontend FRONTEND_INDEX_FILE=index.html npm run dev
```

#### Production

Clean and build all packages:

```bash
npm run build:app:clear
MINIFY_BACKEND_BUILD=false npm run build:app
```

Run the app:

```bash
INTERNAL_SERVER_PORT=3000 FRONTEND_DIR=./../../frontend/dist FRONTEND_INDEX_FILE=index.html node ./app/backend/dist/main.prod.js
```

### Using both Host-based and Docker-based development/production

We strongly discourage switching between the two.

If you do switch between them, you may encounter file permission issues. This is due to limitations in Docker's bind mount behavior.

When Docker bind-mounts a directory that does not yet exist on the host, it may create that directory on the host filesystem. In such cases, the directory will be owned by the container's user (typically `root`), not your local user.

This can lead to permission errors when running the project directly on the host (e.g. Vite failing to write to `node_modules`).

#### Fix

When the issue occurs, the simplest one-fix solution is to reset ownership of the affected host directories.

This command includes all known folders to cause these permission-related issues:

```bash
sudo chown -R $USER:$USER app/frontend/node_modules app/backend/node_modules
```

This issue is truly only Host-related. The ownership change does not affect the container's functionality - Docker will continue to work normally even after the change.

## Scripts

- `npm run dev` - start backend in dev mode with Vite middleware
- `npm run type:check` - run type checks across root, frontend, backend, shared
- `npm run lint` - lint and auto-fix
- `npm run lint:check` - lint without auto-fix
- `npm run format` - format all files
- `npm run format:check` - verify formatting
- `npm run quality` - run all type, lint and format checks.
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

## Environments

### Application environment

#### Production build arguments

- `MINIFY_BACKEND_BUILD` - Whether to minify the `tsup` backend build

#### Runtime variables:

- `INTERNAL_SERVER_PORT` - Port the actual HTTP app is listening on
- `FRONTEND_DIR` - frontend root/static directory path
- `FRONTEND_INDEX_FILE` - frontend entry file name

### Docker environment

#### Docker arguments

- `EXTERNAL_SERVER_PORT` - Port forwarded from Docker to Host

#### Developer-specific .env file

When using Docker-based development, the only things needed to be set by the developer are within the `.env.example` file.

Any other arguments/variables are set by Docker automatically.

- `COMPOSE_PROFILES` - selected compose profile (`dev` or `prod`)
- `EXTERNAL_SERVER_PORT` - set to any open port on your Host
- `MINIFY_BACKEND_BUILD` - `true` or `false`; if production build is needed during development, you can set whether the backend should be minified. We recommend `false` for better file readability.

## License

MIT
