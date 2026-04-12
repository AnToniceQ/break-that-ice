import { IServerRuntimeMiddleware } from "../../server-runtime.js";
import { rootPaths } from "../../config/root-paths.js";
import { createApiRouter } from "./sub-routers/api-router.js";

export function createRouterMiddleware(): IServerRuntimeMiddleware {
  return {
    async register(app) {
      app.use(rootPaths.api, createApiRouter());
    },
  };
}
