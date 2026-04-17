import express from "express";
import {
  createServerRuntime,
  IServerRuntimeMiddleware,
} from "./server-runtime.js";
import { createJsonMiddleware } from "./middleware/json-middleware.js";
import { createRouterMiddleware } from "./middleware/router/router-middleware.js";
import { createHttpServer, HttpServer } from "./server/http-server.js";
import { createSocketServer, SocketServer } from "./server/socket-server.js";
import { createDatabaseMiddleware } from "./middleware/database/database-middleware.js";

export type IBaseSetupConfiguration = {
  app: express.Express;
  httpServer: HttpServer;
  socketServer: SocketServer;
};

export type IEnvironmentSetupConfiguration = {
  middlewares: IServerRuntimeMiddleware[];
};

export type TCreateEnvironmentSetup = (
  setupConfiguration: IBaseSetupConfiguration,
) => IEnvironmentSetupConfiguration | Promise<IEnvironmentSetupConfiguration>;

export async function createServerBootstrap(
  createEnvironmentSetup: TCreateEnvironmentSetup,
) {
  const app = express();
  const httpServer = createHttpServer(app);
  const socketServer = createSocketServer(httpServer);

  const environmentSetup = await createEnvironmentSetup({
    app,
    httpServer,
    socketServer,
  });

  const middlewares = [
    createJsonMiddleware(),
    createRouterMiddleware(),
    createDatabaseMiddleware(),
    ...environmentSetup.middlewares,
  ];

  const serverRuntime = await createServerRuntime(
    app,
    httpServer,
    socketServer,
    middlewares,
  );

  serverRuntime.start();
}
