import { rmSync, renameSync, mkdirSync } from "node:fs";

const FRONTEND_DIR = process.env.FRONTEND_DIR;

if (typeof FRONTEND_DIR !== "string")
  throw new Error("Invalid FRONTEND_DIR environment variable. Is it set?");

// clear dist if it exists
rmSync("dist", { recursive: true, force: true });

// move backend into prod dist
renameSync("app/backend/dist", "dist");

// create frontend prod dir
mkdirSync(`dist/${FRONTEND_DIR}`, { recursive: true });

// move the actual frontend into the prod dir/<env>
renameSync("app/frontend/dist", `dist/${FRONTEND_DIR}`);
