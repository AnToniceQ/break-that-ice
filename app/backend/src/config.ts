const mode = process.env.NODE_ENV || "development";

export const IS_PROD = mode === "production";
export const SERVER_PORT = (() => {
  const port = Number(process.env.SERVER_PORT);

  if (isNaN(port))
    throw new Error("Invalid SERVER_PORT environment variable. Is it set?");

  return port;
})();
export const FRONTEND_DIR = (() => {
  const dir = process.env.FRONTEND_DIR;

  if (mode == "development") return "";

  if (typeof dir !== "string" || dir.trim() === "")
    throw new Error("Invalid FRONTEND_DIR environment variable. Is it set?");

  return dir;
})();
