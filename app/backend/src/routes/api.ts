import { Router } from "express";

export function createApiRouter() {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  return router;
}
