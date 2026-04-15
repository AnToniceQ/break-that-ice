import { getNonEmptyEnvironmentVariable } from "@break-that-ice/shared/config";

export const FRONTEND_DIR = getNonEmptyEnvironmentVariable("FRONTEND_DIR");

export const FRONTEND_INDEX_FILE = getNonEmptyEnvironmentVariable(
  "FRONTEND_INDEX_FILE",
);

export const SERVER_PORT = (() => {
  const value = getNonEmptyEnvironmentVariable("INTERNAL_SERVER_PORT");

  const parsedPort = Number.parseInt(value, 10);
  if (!Number.isInteger(parsedPort) || parsedPort <= 0 || parsedPort > 65535)
    throw new Error(
      "Invalid INTERNAL_SERVER_PORT environment variable. Expected a valid port number.",
    );

  return parsedPort;
})();
