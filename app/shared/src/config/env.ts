export function getNonEmptyEnvironmentVariable(key: string): string {
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
