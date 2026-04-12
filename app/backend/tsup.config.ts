import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.prod.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  treeshake: true,
  splitting: false,
  outDir: "dist",
  clean: true,
  noExternal: ["@break-that-ice/shared"],
});
