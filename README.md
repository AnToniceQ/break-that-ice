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
├── docker/
│   ├── compose.yml
│   ├── compose.dev.yml
│   ├── compose.prod.yml
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── compose.ts
├── .github/
│   ├── actions/
│   │   ├── flow-pr/     # PR flow action (source + dist)
│   │   └── node-setup/  # shared local setup action for workflows
│   ├── scripts/         # CI shell scripts
│   └── workflows/       # workflow definitions
└── package.json
```

## Branch, Issue, and PR Flow

Use this repository flow when developing:

- Issue branches must follow `{issueNumber}-{short-name}` (example: `42-fix-login`).
- Main promotion path is `issue -> dev -> test -> main`.
- Allowed backports are `main -> test` and `test -> dev`.

The PR flow action (`.github/workflows/flow-pr.yml`) enforces these rules and updates issue labels.

Promotion labels used by the automation:

- `reviewing`
- `dev`
- `testing`
- `prepared`
- `deploying`

Label behavior:

- Opening/updating `{id}-{name} -> dev`: issue label becomes `reviewing`.
- Merging `{id}-{name} -> dev`: issue label becomes `dev`.
- Opening/updating `dev -> test`: `dev` issues become `testing`.
- Merging `dev -> test`: `testing` issues become `prepared`.
- Opening/updating `test -> main`: `prepared` issues become `deploying`.
- Merging `test -> main`: `deploying` issues are closed.
- Backports (`main -> test`, `test -> dev`): no label changes.

## Requirements

- Node.js `22.x`
- npm `10.x`

## Preparation

Install:

```bash
npm install
```

Copy modifiable secrets:

```bash
cp -R .secrets.example/. .secrets/
```

## Development & production

We aim to support both Host-based and Docker-based development, although using Docker is highly recommended.

The `.env` examples represents environment variables to be used with Docker-based development. The application is setup for docker to read these environment variables and use them in a needed scope, whether as build arguments, or runtime variables.

If you intend to use Host-based development, feel free to modify the gitignored `.env` files to fit your own development workflow.

### Docker-based

Prepare .env files:

```bash
cp .env.example .env
cp .env.dev.example .env.dev
cp .env.prod.example .env.prod
```

The repository uses split compose files and a small TypeScript helper script to invoke Docker consistently:

- `docker/compose.yml` - shared service settings
- `docker/compose.dev.yml` - development overrides
- `docker/compose.prod.yml` - production overrides

The helper command is:

```bash
npm run docker:compose -- <dev|prod> <docker compose args>
```

Start development:

```bash
npm run docker:compose -- dev up --build
```

Start production:

```bash
npm run docker:compose -- prod up -d --build
```

### Host-based

All commands below are written so that environment variables are passed directly to the command, making the `.env` file unnecessary.

If you created your own custom Host-based `.env` files, feel free to adapt these commands accordingly.

You can see all the variables/arguments needed in [Application environment](#application-environment).

#### Development

Start the development server:

```bash
SECRETS_DIR=./../../.secrets INTERNAL_SERVER_PORT=3000 FRONTEND_DIR=./../frontend FRONTEND_INDEX_FILE=index.html POSTGRES_HOST=localhost POSTGRES_PORT=5432 npm run dev
```

#### Production

Clean and build all packages:

```bash
npm run build:app:clear
MINIFY_BACKEND_BUILD=false npm run build:app
```

Run the app:

```bash
SECRETS_DIR=./../../../.secrets INTERNAL_SERVER_PORT=3000 FRONTEND_DIR=./../../frontend/dist FRONTEND_INDEX_FILE=index.html POSTGRES_HOST=localhost POSTGRES_PORT=5432 node ./app/backend/dist/main.prod.js
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
- `npm run docker:compose -- <dev|prod> <docker compose args>` - run Docker compose through the repository wrapper script
- `npm run type:check` - run type checks across root, frontend, backend, shared
- `npm run lint` - lint and auto-fix
- `npm run lint:check` - lint without auto-fix
- `npm run format` - format all files
- `npm run format:check` - verify formatting
- `npm run quality` - run all type, lint and format checks.
- `npm run build:app:clear` - clear build outputs for backend/frontend
- `npm run build:app` - build backend and frontend
- `npm run build:actions` - build all action workspaces in `.github/actions/*`

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

## Actions Modification Gate

Changes under `.github/actions/**` are protected by the `actions-built-guard` workflow.

- If you modify action source files, regenerate action bundles before pushing:

```bash
npm run build:actions
```

- If Husky is not installed or not hooked on your machine/CI clone, run `npm run build:actions` manually before commit.
- The `dist/` folder of every GitHub Action workspace is expected to be committed and pushed.
- The guard workflow will fail if generated artifacts are out of sync with committed source.

## Environments

We believe that default values in environments obscure the true configuration and behavior of the application. Thus, every variable stated below is mandatory to be set (either by the host or Docker configuration), resulting in a failure of the application if not so.

### Application environment

#### Production build arguments

- `MINIFY_BACKEND_BUILD` - `true` or `false`; whether to minify the `tsup` backend build

#### Runtime variables

- `SECRETS_DIR` - the directory from which the secret files are read from
- `INTERNAL_SERVER_PORT` - port the actual HTTP app is listening on
- `FRONTEND_DIR` - frontend root/static directory path
- `FRONTEND_INDEX_FILE` - frontend entry file name
- `POSTGRES_HOST` - database host name or IP address
- `POSTGRES_PORT` - database TCP port

### Docker environment

#### Docker arguments

- `EXTERNAL_SERVER_PORT` - Port forwarded from Docker to Host

### Runtime secrets

If on Docker, all secret files from `./.secrets.example` must exist within `./.secrets`.

If on Host, all secret files from `./.secrets.example` must exist within the path in `SECRETS_DIR`.

The current database secrets are:

- `postgres_user`
- `postgres_password`
- `postgres_db`

Docker mounts those secrets into `/run/secrets` for both the app and Postgres containers.

### Developer-based .env file and secrets

When using Docker-based development/production, the developer-managed files are:

- `.env` (from `.env.example`)
- `.env.dev` (from `.env.dev.example`)
- `.env.prod` (from `.env.prod.example`)
- `./.secrets` (from `./.secrets.example`)

Any other arguments/variables are set by Docker automatically.

`docker/compose.ts` always loads `.env` and mode-specific env (`.env.dev` or `.env.prod`).

Recommended values:

- `.env`: `EXTERNAL_SERVER_PORT` set to any open port on your Host
- `.env.dev`: currently optional/empty
- `.env.prod`: `MINIFY_BACKEND_BUILD=true|false` (we recommend `false` for easier production output readability while debugging)

## License

MIT
