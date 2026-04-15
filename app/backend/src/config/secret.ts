import { readFileSync } from "node:fs";
import path from "node:path";
import { getNonEmptyEnvironmentVariable } from "@break-that-ice/shared/config";

function getSecret(name: string) {
  return readFileSync(
    path.resolve(
      getNonEmptyEnvironmentVariable("SECRETS_DIR"),
      name.toLowerCase(),
    ),
    "utf8",
  );
}
