import fs from "node:fs/promises";
import { createServer as createViteServer, ViteDevServer } from "vite";
import { IServerRuntimeMiddleware } from "../../server-runtime.js";
import { FRONTEND_DIR, FRONTEND_INDEX_FILE } from "../../config/env.js";
import { isFrontendRequest } from "./frontend-routing-utils.js";
import { HttpServer } from "../../server/http-server.js";
import path from "node:path";

export function createDevFrontendMiddleware(
  httpServer: HttpServer,
): IServerRuntimeMiddleware {
  let vite: ViteDevServer | null = null;

  return {
    async register(app) {
      vite = await createViteServer({
        root: FRONTEND_DIR,
        configLoader: "runner",
        server: {
          middlewareMode: true,
          hmr: {
            server: httpServer,
          },
        },
        appType: "custom",
      });

      app.use(vite.middlewares);

      app.get(/.*/, async (req, res, next) => {
        if (!isFrontendRequest(req.path)) return next();

        try {
          const template = await fs.readFile(
            path.resolve(FRONTEND_DIR, FRONTEND_INDEX_FILE),
            "utf-8",
          );

          if (vite === null)
            throw new Error(
              "Vite dev server was not initialized or has been closed.",
            );

          const html = await vite.transformIndexHtml(req.originalUrl, template);

          res.status(200).type("html").send(html);
        } catch (error) {
          next(error);
        }
      });
    },

    async close() {
      await vite?.close();
    },
  };
}
