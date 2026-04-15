import { spawnSync } from "node:child_process";

const [mode, ...args] = process.argv.slice(2);

if (!mode || !["dev", "prod"].includes(mode)) {
  console.error("Usage: docker.ts <dev|prod> <command>");
  process.exit(1);
}

const files = ["compose.yml", `compose.${mode}.yml`];

const envFiles = [".env", `.env.${mode}`];

const result = spawnSync(
  "docker",
  [
    "compose",
    ...files.flatMap((f) => ["-f", f]),
    ...envFiles.flatMap((f) => ["--env-file", f]),
    ...args,
  ],
  { stdio: "inherit" },
);

process.exit(result.status ?? 0);
