import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  treeshake: true,
  splitting: false,
  outDir: "dist",
  clean: true,
  noExternal: ["@break-that-ice/shared"],
});
