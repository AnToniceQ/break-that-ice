import express from "express";
import { HttpServer } from "./server/http-server.js";
import { SocketServer } from "./server/socket-server.js";
import { SERVER_PORT } from "./config/env.js";

export interface IServerRuntime {
  start: () => void;
}

export interface IServerRuntimeMiddleware {
  register: (app: express.Express) => Promise<void>;
  close?: () => Promise<void>;
}

export async function createServerRuntime(
  app: express.Express,
  httpServer: HttpServer,
  socketServer: SocketServer,
  middlewares: IServerRuntimeMiddleware[],
): Promise<IServerRuntime> {
  async function cleanupMiddlewares(
    middlewaresToCleanup: IServerRuntimeMiddleware[] = middlewares,
  ) {
    middlewaresToCleanup.forEach(async (middleware, index) => {
      try {
        await middleware.close?.();
      } catch (error) {
        console.error(
          `Failed to properly close middleware at index ${index} during cleanup.`,
          error,
        );
      }
    });
  }

  async function registerMiddlewaresTo(app: express.Express) {
    for (let i = 0; i < middlewares.length; i++)
      try {
        await middlewares[i].register(app);
      } catch (error) {
        console.error(`Failed to register middleware at index ${i}.`);

        cleanupMiddlewares(middlewares.slice(0, i));

        throw error;
      }
  }

  function registerShutdown() {
    const cleanup = async () => {
      await cleanupMiddlewares();
      await httpServer.close();
      await socketServer.close();
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  }

  try {
    await registerMiddlewaresTo(app);
    registerShutdown();

    return {
      start: () => {
        httpServer.listen(SERVER_PORT, () => {
          console.log(`Server is running on port ${SERVER_PORT}`);
        });
      },
    };
  } catch (error) {
    console.error("Failed to start the app.", error);
    process.exit(1);
  }
}
