import express from "express";
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { FRONTEND_DIR, IS_PROD, SERVER_PORT } from "./config.js";
import { createApiRouter } from "./routes/api.js";
import { Server } from "socket.io";
import { createEscapedRegex } from "@break-that-ice/shared/utils";

const backendRootPaths = {
  api: "/api",
  socket: "/socket.io",
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: backendRootPaths.socket,
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(backendRootPaths.api, createApiRouter());

if (IS_PROD && fs.existsSync(FRONTEND_DIR)) {
  app.use(express.static(FRONTEND_DIR));

  const patternRootBackendPaths = Object.values(backendRootPaths)
    .map((path) => createEscapedRegex(path))
    .join("|");

  app.get(new RegExp(`^(?!${patternRootBackendPaths}).*`), (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "index.html"));
  });
}

httpServer.listen(SERVER_PORT, () => {
  console.log(`Backend listening on http://localhost:${SERVER_PORT}`);
});
