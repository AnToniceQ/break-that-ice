function getNonEmptyEnvironmentVariable(key: string): string {
  const value = process.env[key];
  if (typeof value !== "string")
    throw new Error(
      `Environment variable ${key} is not set or is not a string.`,
    );

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0)
    throw new Error(`Environment variable ${key} is set but is empty.`);

  return trimmedValue;
}

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
