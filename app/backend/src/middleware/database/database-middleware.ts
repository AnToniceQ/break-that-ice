import type { IServerRuntimeMiddleware } from "../../server-runtime.js";

export function createDatabaseMiddleware(): IServerRuntimeMiddleware {
  return {
    async register() {},
    async close() {},
  };
}
