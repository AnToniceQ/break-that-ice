import { defineConfig } from "tsup";

const minifyEnv = process.env.MINIFY_BACKEND_BUILD;

if (minifyEnv !== "true" && minifyEnv !== "false")
  throw new Error(
    "Invalid value for environment variable MINIFY_BACKEND_BUILD. Expected 'true' or 'false'.",
  );

const minify = minifyEnv === "true";

export default defineConfig({
  entry: ["src/main.prod.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  treeshake: true,
  splitting: false,
  outDir: "dist",
  clean: true,
  minify,
  noExternal: ["@break-that-ice/shared"],
});
