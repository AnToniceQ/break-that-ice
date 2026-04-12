import { Server } from "socket.io";
import { HttpServer } from "./http-server.js";

export type SocketServer = Server;

export function createSocketServer(httpServer: HttpServer) {
  return new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });
}
