import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const dockerDir = path.join(rootDir, "docker");

const [mode, ...args] = process.argv.slice(2);

if (!mode || !["dev", "prod"].includes(mode)) {
  console.error("Usage: docker/run.ts <dev|prod> <command...>");
  process.exit(1);
}

const files = [
  path.join(dockerDir, "compose.yml"),
  path.join(dockerDir, `compose.${mode}.yml`),
];

const envFiles = [
  path.join(rootDir, ".env"),
  path.join(rootDir, `.env.${mode}`),
];

const result = spawnSync(
  "docker",
  [
    "compose",
    ...files.flatMap((f) => ["-f", f]),
    ...envFiles.flatMap((f) => ["--env-file", f]),
    ...args,
  ],
  {
    stdio: "inherit",
    cwd: rootDir,
  },
);

process.exit(result.status ?? 0);
