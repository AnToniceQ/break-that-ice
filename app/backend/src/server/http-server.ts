import { createServer, Server } from "node:http";

export type HttpServer = Server;

export function createHttpServer(app: import("express").Express) {
  return createServer(app);
}
