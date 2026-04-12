import fs from "node:fs";
import express from "express";
import { IServerRuntimeMiddleware } from "../../server-runtime.js";
import { FRONTEND_DIR, FRONTEND_INDEX_FILE } from "../../config/env.js";
import { isFrontendRequest } from "./frontend-routing-utils.js";
import path from "node:path";

export function createProdFrontendMiddleware(): IServerRuntimeMiddleware {
  return {
    async register(app) {
      if (!fs.existsSync(FRONTEND_DIR))
        throw new Error(`Frontend build missing at: ${FRONTEND_DIR}`);

      const frontendIndex = path.resolve(FRONTEND_DIR, FRONTEND_INDEX_FILE);

      if (!fs.existsSync(frontendIndex))
        throw new Error(`Missing index file at: ${frontendIndex}`);

      app.use(express.static(FRONTEND_DIR));

      app.get(/.*/, (req, res, next) => {
        if (!isFrontendRequest(req.path)) return next();
        res.sendFile(frontendIndex);
      });
    },
  };
}
